"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import os

from app import app, logger, conn_mng
from app.archive_controller import archive_form
from app.common import OK_RESPONSE
from app.inventory_generator import KitInventoryGenerator
from app.job_manager import spawn_job
from app.socket_service import log_to_console
from bson import ObjectId
from datetime import datetime
from flask import request, Response, jsonify
from pymongo.collection import ReturnDocument
from shared.constants import KIT_ID
from shared.connection_mngs import KUBEDIR, FabricConnectionManager
from typing import Dict, Tuple


def _set_sensor_type_counts(payload: Dict) -> None:
    """
    Set sensor type counts.

    :param payload: A dictionary of the payload.
    :return: None
    """
    sensor_remote_count = 0
    sensor_local_count = 0

    for sensor in payload["sensors"]:
        if sensor['sensor_type'] == "Remote":
            sensor_remote_count += 1
        else:
            sensor_local_count += 1

    payload["sensor_local_count"] = sensor_local_count
    payload["sensor_remote_count"] = sensor_remote_count


def _delete_kubernetes_conf():
    """
    Delets the kubernetes file on disk so that the next time we connect
    using our Kubernenets in our connection_mng.py module. It will reset to 
    a new configuration file.
    
    :return: 
    """
    config_path = KUBEDIR + '/config'
    if os.path.exists(config_path) and os.path.isfile(config_path):
        os.remove(config_path)


def _replace_kit_inventory(payload: Dict) -> Tuple[bool, str]:
    """
    Replaces the kit inventory if one exists.

    :param payload: The kit payload received from the frontend
    :return: True if successfull, False otherwise.        
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if current_kit_configuration:
        archive_form(current_kit_configuration['form'], True, conn_mng.mongo_kit_archive)

    current_kit_configuration = conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                            {"_id": KIT_ID, "form": payload},
                                            upsert=True,
                                            return_document=ReturnDocument.AFTER)  # type: InsertOneResult

    if current_kit_configuration:
        if current_kit_configuration["form"] and current_kit_configuration["form"]["root_password"]:
            payload['kubernetes_services_cidr'] = payload['kubernetes_services_cidr'] + "/28"
            if payload['dns_ip'] is None:
                payload['dns_ip'] = ''
            payload['use_ceph_for_pcap'] = False
            if payload["sensor_storage_type"] == "Use Ceph clustered storage for PCAP":
                payload['use_ceph_for_pcap'] = True

            _set_sensor_type_counts(payload)
            kit_generator = KitInventoryGenerator(payload)
            kit_generator.generate()
            return True, current_kit_configuration["form"]["root_password"]
    return False, None


def zero_pad(num: int) -> str:
    """
    Zeros pads the numers that are lower than 10.

    :return: string of the new number.
    """
    if num < 10:
        return "0" + str(num)
    return num


def _execute_cmds(timeForm: Dict, password: str, ip_address: str) -> None:
    """
    Executes commands

    :param timeForm: The time form from the main payload passed in from the Kit configuration page.
    :param password: The ssh password of the box.
    :param ip_address: The IP Address of the node.

    :return:
    """
    hours, minutes = timeForm['time'].split(':')
    with FabricConnectionManager('root', password, ip_address) as cmd:
        ret_val = cmd.run('timedatectl set-timezone {}'.format(timeForm['timezone']))
        time_cmd = "timedatectl set-time '{year}-{month}-{day} {hours}:{minutes}:00'".format(year=timeForm['date']['year'],
                                                                                             month=zero_pad(timeForm['date']['month']),
                                                                                             day=zero_pad(timeForm['date']['day']),
                                                                                             hours=hours,
                                                                                             minutes=minutes
                                                                                            )
        cmd.run('timedatectl set-ntp false', warn=True)
        cmd.run(time_cmd)
        cmd.run('timedatectl set-ntp true', warn=True)


def _change_time_on_nodes(payload: Dict) -> None:
    """
    Sets the time on the nodes.  This function throws an exception on failure.

    :param payload: The dictionary object containing the payload.
    :return: None
    """
    timeForm = payload['timeForm']    
    password = payload['kitForm']["root_password"]
    for server in payload['kitForm']["servers"]:        
        _execute_cmds(timeForm, password, server["host_server"])

    for sensor in payload['kitForm']["sensors"]:
        _execute_cmds(timeForm, password, server["host_server"])    


@app.route('/api/execute_kit_inventory', methods=['POST'])
def execute_kit_inventory() -> Response:
    """
    Generates the kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    # logger.debug(json.dumps(payload, indent=4, sort_keys=True))    
    isSucessful, root_password = _replace_kit_inventory(payload['kitForm'])    
    _delete_kubernetes_conf()
    if isSucessful:        
        _change_time_on_nodes(payload)
        cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' site.yml")
        if payload["kitForm"]["install_grr"]:
            cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' site.yml; "
                              "ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + root_password + "' grr-only.yml")
        spawn_job("Kit",
                cmd_to_execute,
                ["kit"],
                log_to_console,
                working_directory="/opt/tfplenum/playbooks")
        
        return OK_RESPONSE

    logger.error("Executing Kit configuration has failed.")
    return ERROR_RESPONSE


@app.route('/api/execute_add_node', methods=['POST'])
def execute_add_node() -> Response:
    """
    Generates the kit inventory file and executes the add node routine

    :return: Response object
    """
    payload = request.get_json()
    # logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    isSucessful, root_password = _replace_kit_inventory(payload['kitForm'])
    if isSucessful:
        for nodeToAdd in payload['nodesToAdd']:
            cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t preflight-add-node,disable-firewall,repos,update-networkmanager,update-dnsmasq-hosts,update-dns,yum-update,genkeys,preflight,common,vars-configmap site.yml; "
                            "ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t docker -l {node} site.yml; "
                            "ansible-playbook -i inventory.yml -e ansible_ssh_pass='{playbook_pass}' -e node_to_add='{node}' -t pull_join_script,kube-node,ceph,es-scale,kafka-scale,bro-scale,moloch-scale,enable-sensor-monitor-interface site.yml"
                            ).format(playbook_pass=root_password, node=nodeToAdd['hostname'])
            spawn_job("Add_Node",
                    cmd_to_execute,
                    ["kit"],
                    log_to_console,
                    working_directory="/opt/tfplenum/playbooks",
                    is_shell=True)
        return OK_RESPONSE

    logger.error("Executing add node configuration has failed.")
    return ERROR_RESPONSE


@app.route('/api/get_kit_form', methods=['GET'])
def get_kit_form() -> Response:
    """
    Gets the Kit form that was generated by the user on the Kit
    configuration page.

    :return:
    """
    mongo_document = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if mongo_document is None:
        return OK_RESPONSE

    mongo_document['_id'] = str(mongo_document['_id'])
    return jsonify(mongo_document["form"])
