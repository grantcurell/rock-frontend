"""
This is the main module for all the shared REST calls
"""
import json

from app import app, logger
from app.node_facts import get_system_info
from flask import request, jsonify, Response
from app.common import ERROR_RESPONSE, OK_RESPONSE
from app.job_manager import kill_job_in_queue


MIN_MBPS = 1000


@app.route('/api/gather_device_facts', methods=['POST'])
def gather_device_facts() -> Response:
    """
    Gathers device facts or sends back a HTTP error to the
    user if something fails.

    :return: A jsonified response object.
    """
    try:
        payload = request.get_json()
        management_ip = payload.get('management_ip')
        password = payload.get('password')
        node = get_system_info(management_ip, password)
        potential_monitor_interfaces = []

        for interface in node.interfaces:
            if interface.ip_address != management_ip:
                potential_monitor_interfaces.append(interface.name)
            if interface.ip_address == management_ip:
                if interface.speed < MIN_MBPS:
                    return jsonify(error_message="ERROR: Please check your "
                                   "network configuration. The link speed on {} is less than {} Mbps."
                                   .format(interface.name, MIN_MBPS))

        return jsonify(cpus_available=node.cpu_cores,
                       memory_available=node.memory_gb,
                       disks= json.dumps([disk. __dict__ for disk in node.disks]),
                       hostname=node.hostname,
                       potential_monitor_interfaces=potential_monitor_interfaces,
                       interfaces=json.dumps([interface. __dict__ for interface in node.interfaces]))
    except Exception as e:
        logger.exception(e)
        return jsonify(error_message=str(e))


@app.route('/api/kill_job', methods=['POST'])
def kill_job() -> Response:
    """
    Kills the job before it finishes processing.

    :return: OK response on success or server 500 on failure.
    """
    payload = request.get_json()
    try:
        kill_job_in_queue(payload['jobName'])
        return OK_RESPONSE
    except Exception as e:
        logger.exception(e)
    return ERROR_RESPONSE
