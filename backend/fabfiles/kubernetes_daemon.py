"""
Main module used for saving any kubernetes information that the main frontend requires
for rendering pages.
"""
from connection_wrappers import objectify, MongoConnectionManager, KubernetesWrapper

class KubernetesExecutor():

    def __init__(self, kubectl_wrapper: KubernetesWrapper, mongo_conn: MongoConnectionManager):
        """
        :param self._mongo_conn: A mongo connection wrapper
        :param self._kube_apiv1: A kubernetes API wrapper.
        """        
        self._mongo_conn = mongo_conn
        self._kube_apiv1 = kubectl_wrapper

    def _save_pod_data(self) -> None:
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
        
    def _save_node_data(self) -> None:
        """
        Saves node information from the kubernetes API to our mongo store
        """
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
        with KubernetesWrapper(mongo_conn) as kubectl_conn:
            executor = KubernetesExecutor(kubectl_conn, mongo_conn)
            executor.execute()    

if __name__ == '__main__':
    main()
