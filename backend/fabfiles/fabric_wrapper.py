
import sys
import os
from datetime import datetime
from fabric import Connection

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from shared.mongo_connection_mng import MongoConnectionManager
from shared.constants import KIT_ID
from typing import Dict, Tuple

USERNAME = 'root'
CONNECTION_TIMEOUT = 20

class KitFormNotFound(Exception):
    pass


def objectify(some_dict: Dict) -> Dict:
    """
    Converts a given dictionary into a savable mongo object.
    It removes things that are set to None.

    :param some_dict:
    :return:
    """
    for key in list(some_dict):
        if some_dict[key] is None:
            del some_dict[key]
        elif isinstance(some_dict[key], datetime):
            some_dict[key] = some_dict[key].strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(some_dict[key], list):
            for index, item in enumerate(some_dict[key]):
                if item is None:
                    some_dict[key].pop(index)
                elif isinstance(item, datetime):
                    some_dict[key][index] = item.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(item, dict):
                    objectify(item)
        elif isinstance(some_dict[key], dict):
            objectify(some_dict[key])

    return some_dict


def get_master_node_ip_and_password(kit_form: Dict) -> Tuple[str, str]:
    """
    Returns a the IP address and root password of the master node from the kit form passed in.

    :param kit_form:
    :return:
    """
    for server in kit_form["servers"]:
        try:
            if server["is_master_server"]:
                return server["host_server"], kit_form["root_password"]
        except KeyError:
            pass

    return None, None


class FabricConnectionWrapper():

    def __init__(self, conn_mongo: MongoConnectionManager=None):
        self._connection = None  # type: Connection
        self._conn_mongo = conn_mongo

    def _establish_fabric_connection(self, conn_mongo: MongoConnectionManager) -> None:
        kit_form = conn_mongo.mongo_kit.find_one({"_id": KIT_ID})
        if kit_form:
            master_ip, password = get_master_node_ip_and_password(kit_form['payload'])
            self._connection = Connection(master_ip, 
                                          user=USERNAME, 
                                          connect_timeout=CONNECTION_TIMEOUT,
                                          connect_kwargs={'password': password, 
                                                          'allow_agent': False, 
                                                          'look_for_keys': False})
        else:
            raise KitFormNotFound()

    def __enter__(self):
        if self._conn_mongo:
            self._establish_fabric_connection(self._conn_mongo)
        else:
            with MongoConnectionManager() as conn_mng:
                self._establish_fabric_connection(conn_mng)
            
        return self._connection

    def __exit__(self, *exc):
        if self._connection:
            self._connection.close()
