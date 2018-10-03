"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
import pymongo
from app import app, logger, conn_mng
from app.job_manager import shell
from shared.constants import KIT_ID

from app.job_manager import spawn_job
from app.socket_service import log_to_console
from app.common import OK_RESPONSE, ERROR_RESPONSE
from flask import request, Response, jsonify


@app.route('/api/describe_pod/<pod_name>', methods=['GET'])
def describe_pod(pod_name: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param pod_name: The name of the pod of cource.  
                     You can get it with 'kubectl get pods' on the main server node.
    """
    command = '/opt/tfplenum-frontend/tfp-env/bin/python describe_kubernetes_pod.py %s' % pod_name
    stdout, stderr = shell(command, working_dir="/opt/tfplenum-frontend/backend/fabfiles")        

    if stdout:
        stdout = stdout.decode('utf-8')        

    if stderr:
        stderr = stderr.decode('utf-8')        

    return jsonify({'stdout': stdout, 'stderr': stderr})


@app.route('/api/describe_node/<node_name>', methods=['GET'])
def describe_node(node_name: str) -> Response:
    """
    Runs a command and pulls the pods describe command output.

    :param node_name: The name of the node of cource.  
                      You can get it with 'kubectl get nodes' on the main server node.
    """
    command = '/opt/tfplenum-frontend/tfp-env/bin/python describe_kubernetes_node.py %s' % node_name
    stdout, stderr = shell(command, working_dir="/opt/tfplenum-frontend/backend/fabfiles")        

    if stdout:
        stdout = stdout.decode('utf-8')        

    if stderr:
        stderr = stderr.decode('utf-8')        

    return jsonify({'stdout': stdout, 'stderr': stderr})


@app.route('/api/perform_systems_check', methods=['GET'])
def perform_systems_check() -> Response:
    """
    Kicks off a systems check job

    :return: Response object
    """
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if current_kit_configuration:
        if current_kit_configuration["payload"] and current_kit_configuration["payload"]["root_password"]:
            cmd_to_execute = ("ansible-playbook -i /opt/tfplenum/playbooks/inventory.yml -e ansible_ssh_pass='" + 
                              current_kit_configuration["payload"]["root_password"] + "' site.yml")
            spawn_job("SystemsCheck",
                    cmd_to_execute,
                    ["systems_check"],
                    log_to_console,
                    working_directory="/opt/tfplenum-integration-testing/playbooks")
            return OK_RESPONSE

    logger.warn("Perform systems check failed because the Kit configuration was not found in the mongo database.")
    return ERROR_RESPONSE


@app.route('/api/get_pods_statuses', methods=['GET'])
def get_pod_info() -> Response:
    return_projection = {"metadata.name": True, "metadata.creation_timestamp": True, "metadata.namespace": True,"spec.containers.image": True, 
                         "status.phase": True, "status.host_ip": True, "status.container_statuses": True}

    results = conn_mng.mongo_kubernetes_pods.find({}, projection=return_projection)
    ret_val = []
    if results:
        for item in results:
            item["_id"] = str(item["_id"])
            ret_val.append(item)

    return jsonify(ret_val)


@app.route('/api/get_node_statuses', methods=['GET'])
def get_node_statuses() -> Response:        
    return_projection = None
    return_projection = {"metadata.name": True, "metadata.creation_timestamp": True, 
                         "status.conditions": True, "status.node_info": True, "metadata.annotations": True}
    results = conn_mng.mongo_kubernetes_nodes.find({}, projection=return_projection)
    ret_val = []
    if results:
        for item in results:            
            item["_id"] = str(item["_id"])
            public_ip = item["metadata"]["annotations"]["flannel.alpha.coreos.com/public-ip"]
            item["metadata"]["public_ip"] = public_ip
            del item["metadata"]["annotations"]
            ret_val.append(item)

    return jsonify(ret_val)
