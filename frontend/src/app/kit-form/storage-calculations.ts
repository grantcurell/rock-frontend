import { KitInventoryForm } from './kit-form';
import { CEPH_DRIVE_MIN_COUNT } from '../frontend-constants';

export class StorageCalculator {
    kitForm: KitInventoryForm;
    elasticStorageAvailable: number;
    molochStorageAvailable: number;

    constructor(kitForm: KitInventoryForm) {
        this.kitForm = kitForm;
        this.elasticStorageAvailable = 0;
        this.molochStorageAvailable = 0;
    }

    public validate_ceph_drive_count() {
        let number_of_ceph_drives = this.kitForm.system_resources.totalCephDrives;
        
        if (number_of_ceph_drives < CEPH_DRIVE_MIN_COUNT) {
            this.kitForm.system_resources.totalCephDrivesCss = "text-danger";
            this.kitForm.system_resources.totalCephDrivesErrors = ' - Error: You need at least two drives in the Ceph cluster!';
        } else {
            this.kitForm.system_resources.totalCephDrivesCss = "text-success";
            this.kitForm.system_resources.totalCephDrivesErrors = ' - Looks good!';
        }
    }

    public recalculate_storage_recommendation() {
        if (this.kitForm.system_resources.clusterStorageAvailable === 0){
            return;
        }

        let elastic_storage_percentage = this.kitForm.elastic_storage_percentage.value / 100;

        // This basically amounts to total_storage * elastic_storage_percentage / #_instances
        // toFixed keeps it from exceeding two decimal places
        let elastic_storage_size = (this.kitForm.system_resources.clusterStorageAvailable * elastic_storage_percentage)
            / (parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_masters.value) + parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_datas.value));

        this.kitForm.advanced_elasticsearch_settings.elastic_pv_size.setValue(Math.floor(elastic_storage_size));
        this.elasticStorageAvailable = elastic_storage_size;
        let total_committed = elastic_storage_size;
        
        // The condition prevents Moloch PCAP storage from being computed if the user
        // did not select Ceph for PCAP
        let dropDownValue = this.kitForm.sensor_storage_type.value;
        if (dropDownValue == this.kitForm.sensor_storage_type.options[0]) {
            let moloch_pcap_storage_percentage = parseInt(this.kitForm.moloch_pcap_storage_percentage.value) / 100;
            let moloch_pcap_storage_size = this.kitForm.system_resources.clusterStorageAvailable * moloch_pcap_storage_percentage;
            this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.setValue(Math.floor(moloch_pcap_storage_size));
            this.molochStorageAvailable = Math.floor(moloch_pcap_storage_size);
            total_committed = moloch_pcap_storage_size + elastic_storage_size;
        }
        
        total_committed += parseInt(this.kitForm.advanced_kafka_settings.kafka_pv_size.value)
                                    + parseInt(this.kitForm.advanced_kafka_settings.zookeeper_pv_size.value)
                                    * parseInt(this.kitForm.advanced_kafka_settings.zookeeper_replicas.value);
        this.kitForm.system_resources.clusterStorageComitted = total_committed;
    }
}