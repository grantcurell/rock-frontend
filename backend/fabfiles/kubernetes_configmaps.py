import json
from connection_wrappers import objectify, MongoConnectionManager, KubernetesWrapper

def list_kubernetes_configmaps(kube_apiv1: KubernetesWrapper):
    api_response = kube_apiv1.list_config_map_for_all_namespaces()
    print(json.dumps(objectify(api_response.to_dict())))

def main():
    with MongoConnectionManager() as mongo_conn:
        with KubernetesWrapper(mongo_conn) as kubectl_conn:
            list_kubernetes_configmaps(kubectl_conn)

if __name__ == '__main__':
    main()
    