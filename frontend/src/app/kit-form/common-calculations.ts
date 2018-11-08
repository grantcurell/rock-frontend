import { KitInventoryForm } from './kit-form';


export function SetZookeeperReplicas(kitForm: KitInventoryForm) {
    let nodeCount = kitForm.servers.length + kitForm.sensors.length;

    if (nodeCount <= 2){
        kitForm.advanced_kafka_settings.zookeeper_replicas.setValue(1);
    }
}