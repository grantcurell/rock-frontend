"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import os

from app import app, logger, conn_mng
from app.common import OK_RESPONSE
from app.inventory_generator import KitInventoryGenerator
from app.job_manager import spawn_job
from app.socket_service import log_to_console
from bson import ObjectId
from datetime import datetime
from flask import request, Response, jsonify
from pymongo.collection import ReturnDocument
from shared.constants import KIT_ID
from shared.connection_mngs import KUBEDIR, FabricConnectionWrapper
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
    current_kit_configuration = conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                            {"_id": KIT_ID, "payload": payload},
                                            upsert=True,
                                            return_document=ReturnDocument.AFTER)  # type: InsertOneResult

    if current_kit_configuration:
        if current_kit_configuration["payload"] and current_kit_configuration["payload"]["root_password"]:
            payload['kubernetes_services_cidr'] = payload['kubernetes_services_cidr'] + "/28"
            if payload['dns_ip'] is None:
                payload['dns_ip'] = ''
            payload['use_ceph_for_pcap'] = False
            if payload["sensor_storage_type"] == "Use Ceph clustered storage for PCAP":
                payload['use_ceph_for_pcap'] = True

            _set_sensor_type_counts(payload)
            kit_generator = KitInventoryGenerator(payload)
            kit_generator.generate()
            return True, current_kit_configuration["payload"]["root_password"]
    return False, None


def zero_pad(num: int) -> str:
    """
    Zeros pads the numers that are lower than 10.

    :return: string of the new number.
    """
    if num < 10:
        return "0" + str(num)
    return num


def _change_time_on_kubernetes_master(timeForm: Dict):
    """
    Sets the time on the kubernetes box.  This function throws an exception on failure.

    :return: None
    """
    with FabricConnectionWrapper(conn_mng) as cmd:
        ret_val = cmd.run('timedatectl set-timezone UTC')
        time_cmd = "timedatectl set-time '{year}-{month}-{day} {hours}:{minutes}:00'".format(year=timeForm['date']['year'],
                                                                                            month=zero_pad(timeForm['date']['month']),
                                                                                            day=zero_pad(timeForm['date']['day']),
                                                                                            hours=zero_pad(timeForm['time']['hour']),
                                                                                            minutes=zero_pad(timeForm['time']['minute'])
                                                                                           )
        cmd.run('timedatectl set-ntp false')
        cmd.run(time_cmd)
        cmd.run('timedatectl set-ntp true')


@app.route('/api/execute_kit_inventory', methods=['POST'])
def execute_kit_inventory() -> Response:
    """
    Generates the kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    isSucessful, root_password = _replace_kit_inventory(payload['kitForm'])
    _delete_kubernetes_conf()
    if isSucessful:
        _change_time_on_kubernetes_master(payload['timeForm'])
        cmd_to_execute = ("ansible-playbook -i inventory.yml -e ansible_ssh_pass='" + 
                          root_password + "' site.yml")
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
    return jsonify(mongo_document["payload"])


@app.route('/api/remove_and_archive_kit', methods=['POST'])
def remove_and_archive_kit() -> Response:
    """
    Removes the kickstart inventory from the main collection and then
    archives it in a separate collection.

    :return:
    """
    kit_form = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit_form is not None:
        del kit_form['_id']
        kit_form['archive_date'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        conn_mng.mongo_kit_archive.insert_one(kit_form)
        conn_mng.mongo_kit.delete_one({"_id": KIT_ID})
    return OK_RESPONSE


@app.route('/api/get_kit_archived')
def get_archived_kit_ids() -> Response:
    """
    Returns all the archived Kit Configuration form ids and their associated archive dates.
    :return:
    """
    ret_val = []
    result = conn_mng.mongo_kit_archive.find({})
    if result:
        for item in result:
            item["_id"] = str(item["_id"])
            ret_val.append(item)

    return jsonify(ret_val)


@app.route('/api/restore_archived_kit', methods=['POST'])
def restore_archived_kit() -> Response:
    """
    Restores archived Kit form from the archived collection.

    :return:
    """
    payload = request.get_json()
    logger.debug(json.dumps(payload, indent=4, sort_keys=True))

    kit_form = conn_mng.mongo_kit_archive.find_one_and_delete({"_id": ObjectId(payload["_id"])})
    if kit_form:
        conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                                {"_id": KIT_ID, "payload": kit_form['payload']},
                                                upsert=True)  # type: InsertOneResult
        return OK_RESPONSE
    return ERROR_RESPONSE
