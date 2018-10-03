"""
Module is responsible for updating the links for the portal page.
"""
import os
import sys
from fabric import Connection
from fabric.runners import Result
from fabric_wrapper import FabricConnectionWrapper

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from shared.mongo_connection_mng import MongoConnectionManager
from shared.constants import PORTAL_ID


# The default DNS names to insert when they do not exist.
DEFAULT_NAMES = ("elastichq.lan", "elasticsearch.lan", "kafka-manager.lan", "kibana.lan", "moloch-viewer.lan",
                 "kubernetes-dashboard.lan", "monitoring-grafana.lan")


def set_defaults(conn_mng: MongoConnectionManager):
    """
    Sets the defaults for portal links in the event that we cannot 
    connect to kubernetes master server.

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
        with FabricConnectionWrapper(conn_mng) as ssh_conn:
            portal_links = []
            try:        
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
                set_defaults(conn_mng)


if __name__ == '__main__':
    main()
