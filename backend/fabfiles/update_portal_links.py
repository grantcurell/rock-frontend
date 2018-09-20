"""
Module is responsible for updating the links for the portal page.
"""
import sys
import os
from fabric import Connection
from fabric.runners import Result

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from shared.mongo_connection_mng import MongoConnectionManager
from shared.constants import PORTAL_ID, KIT_ID
from typing import Dict, Tuple

USERNAME = 'root'
CONNECTION_TIMEOUT = 20
# The default DNS names to insert when they do not exist.
DEFAULT_NAMES = ("elastichq.lan", "elasticsearch.lan", "kafka-manager.lan", "kibana.lan", "moloch-viewer.lan",
                 "kubernetes-dashboard.lan", "monitoring-grafana.lan")


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


def set_defaults(conn_mng: MongoConnectionManager):
    """
    Sets the defaults for the connection manager.

    :param conn_mng:
    :return:
    """
    print("No Kit form found. Setting defaults")
    portal_links = []
    for default_dns in DEFAULT_NAMES:
        portal_links.append({'ip': '', 'dns': default_dns})
    conn_mng.mongo_portal.find_one_and_replace({'_id': PORTAL_ID},
                                               {'_id': PORTAL_ID, 'payload': portal_links}, upsert=True)


def main():
    with MongoConnectionManager() as conn_mng:
        portal_links = []
        kit_form = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
        if kit_form:
            try:
                master_ip, password = get_master_node_ip_and_password(kit_form['payload'])
                with Connection(master_ip, user=USERNAME, connect_timeout=CONNECTION_TIMEOUT,
                                connect_kwargs={'password': password}) as ssh_conn:
                    ret_val = ssh_conn.run('cat /etc/dnsmasq_kube_hosts', hide=True)  # type: Result
                    for line in ret_val.stdout.split('\n'):
                        try:
                            ip, dns = line.split(' ')
                            portal_links.append({'ip': ip, 'dns': dns})
                        except ValueError as e:
                            pass
                    conn_mng.mongo_portal.find_one_and_replace({'_id': PORTAL_ID},
                                                               {'_id': PORTAL_ID, 'payload': portal_links},
                                                               upsert=True)
            except Exception as e:
                print(e)
                set_defaults(conn_mng)
        else:
            set_defaults(conn_mng)


if __name__ == '__main__':
    main()
