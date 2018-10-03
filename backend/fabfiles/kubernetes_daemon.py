"""
Main module used for saving any kubernetes information that the main frontend requires
for rendering pages.
"""
import os

from fabric_wrapper import FabricConnectionWrapper, MongoConnectionManager, objectify
from kubernetes import client, config
from typing import Dict
from bson.errors import InvalidDocument
KUBEDIR = "/root/.kube"


class KubernetesExecutor():

    def __init__(self, mongo_conn: MongoConnectionManager):
        self._mongo_conn = mongo_conn
        self._get_and_save_kubernetes_config()
        config.load_kube_config()
        self._kube_apiv1 = client.CoreV1Api()

    def _get_and_save_kubernetes_config(self) -> None:
        if not os.path.exists(KUBEDIR):
            os.makedirs(KUBEDIR)

        with FabricConnectionWrapper(self._mongo_conn) as fab_conn:
            fab_conn.get(KUBEDIR + '/config', KUBEDIR + '/config')

    def _save_pod_data(self):
        """
        Saves the pode data to the kubernetes_pods collection in the Mongo database.
        """
        # Configs can be set in Configuration class directly or using helper utility
        
        ret = self._kube_apiv1.list_pod_for_all_namespaces(watch=False)
        self._mongo_conn.mongo_kubernetes_pods.drop()
        for pod in ret.items:        
            my_dict = objectify(pod.to_dict())
            self._mongo_conn.mongo_kubernetes_pods.insert(my_dict, check_keys=False)
            #print("%s\t%s\t%s" % (pod.status.pod_ip, pod.metadata.namespace, pod.metadata.name))
        
    def _save_node_data(self):
        config.load_kube_config()
        api_response = self._kube_apiv1.list_node()
        self._mongo_conn.mongo_kubernetes_nodes.drop()
        for node in api_response.items:
            my_dict = objectify(node.to_dict())
            self._mongo_conn.mongo_kubernetes_nodes.insert(my_dict, check_keys=False)        

    def execute(self):
        self._save_pod_data()
        self._save_node_data()

def main():
    with MongoConnectionManager() as mongo_conn:
        executor = KubernetesExecutor(mongo_conn)
        executor.execute()    

if __name__ == '__main__':
    main()
