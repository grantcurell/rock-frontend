"""
Main module for handling all of the Kit Configuration REST calls.
"""
import json
from app import app, logger

from app.inventory_generator import KitInventoryGenerator
from app.job_manager import spawn_job
from app.socket_service import log_to_console
from app.common import OK_RESPONSE
from flask import request, Response
from typing import Dict


MIN_MBPS = 1000


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


@app.route('/api/generate_kit_inventory', methods=['POST'])
def generate_kit_inventory() -> Response:
    """
    Generates the kit inventory file which will be used in provisioning the system.

    :return: Response object
    """
    payload = request.get_json()
    payload['kubernetes_services_cidr'] = payload['kubernetes_services_cidr'] + "/28"
    payload['use_ceph_for_pcap'] = False
    if payload["sensor_storage_type"] == "Use Ceph clustered storage for PCAP":
        payload['use_ceph_for_pcap'] = True

    _set_sensor_type_counts(payload)
    logger.debug(json.dumps(payload, indent=4, sort_keys=True))
    kit_generator = KitInventoryGenerator(payload)
    kit_generator.generate()
    spawn_job("Kit",
              "make",
              ["kit"],
              log_to_console,
              working_directory="/opt/tfplenum/playbooks")
    return OK_RESPONSE
