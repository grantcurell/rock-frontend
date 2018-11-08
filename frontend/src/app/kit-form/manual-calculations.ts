import { KitInventoryForm } from './kit-form';
import { StorageCalculator } from './storage-calculations';
import { SetElasticSearchValidated, SetClusteredStorageValidated } from './kit-form-globals';
import { SetZookeeperReplicas } from './common-calculations'; 

export class ManualCalculator {
    kitForm: KitInventoryForm;
    storageCalculator: StorageCalculator;

    constructor(kitForm: KitInventoryForm) {
        this.kitForm = kitForm;
    }

    public validate_manual_entries() {
        if (!this.kitForm.disable_autocalculate.value){            
            return;
        }
        SetZookeeperReplicas(this.kitForm);

        let number_of_masters = parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_masters.value);
        let number_of_datas = parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_datas.value);

        let total_instances = number_of_masters + number_of_datas;

        let memory_required = total_instances * parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_memory.value);
        let cpus_required = total_instances * parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_cpus.value);
        
        let storage_required = total_instances * parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_pv_size.value) 
                                               + parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_pv_size.value) 
                                               + parseInt(this.kitForm.advanced_kafka_settings.zookeeper_pv_size.value) 
                                               * parseInt(this.kitForm.advanced_kafka_settings.zookeeper_replicas.value);

        let current_storage_total = this.kitForm.system_resources.clusterStorageAvailable;

        let logstash_replicas = parseInt(this.kitForm.logstash_replicas.value);
        let logstash_cpu_percentage = parseInt(this.kitForm.logstash_cpu_percentage.value);

        let logstash_required_cpu = this.kitForm.server_resources.cpuCoresAvailable * (logstash_cpu_percentage / 100);
        let logstash_cpus_required = logstash_required_cpu * logstash_replicas;

        this.kitForm.server_resources.setAssignedLogstashCpus(logstash_required_cpu * logstash_replicas);        

        // Add Moloch if they are using Ceph storage
        if (this.kitForm.sensor_storage_type.value == this.kitForm.sensor_storage_type.options[0]){
            storage_required += parseInt(this.kitForm.advanced_moloch_settings.moloch_pcap_pv_size.value);
        }
        
        // Validate the storage requirements
        if (storage_required > current_storage_total) {
            this.kitForm.system_resources.clusteredStorageErrors = ' - Error: Insufficient storage space available on system.';
            this.kitForm.system_resources.clusteredStorageCss = "text-danger";

            SetClusteredStorageValidated(false);
        } else {
            this.kitForm.system_resources.clusteredStorageErrors = ' - Looks good!';
            this.kitForm.system_resources.clusteredStorageCss = "text-success";
            SetClusteredStorageValidated(true);                        
        }

        let server_cpus_available = this.kitForm.server_resources.cpuCoresAvailable;
        let server_memory_available = this.kitForm.server_resources.memoryAvailable;

        if (!isNaN(server_cpus_available) && !isNaN(server_memory_available)) {
            this.kitForm.server_resources.setAssignedElasticSearchCPURequest(cpus_required);
            this.kitForm.server_resources.assignedElasicSearchMemory = memory_required;            

            if (server_cpus_available < cpus_required) {
                this.kitForm.server_resources.elasticSearchErrorText = ' - Error: Insufficient CPUs to support the selected value.';
                this.kitForm.server_resources.elasticSearchCss = "text-danger";
                this.kitForm.server_resources.logstashErrorText = ' - Error: Insufficient CPUs to support the selected value for Logstash and Elasticsearch.';
                this.kitForm.server_resources.logstashCss = "text-danger";
                SetElasticSearchValidated(false);
            } else if (server_cpus_available == cpus_required) {
                this.kitForm.server_resources.elasticSearchErrorText = ' - Error: You cannot use all available CPUs for Elasticsearch/Logstash. Something has to be left for the system.';
                this.kitForm.server_resources.elasticSearchCss = "text-danger";
                this.kitForm.server_resources.logstashErrorText = ' - Error: You cannot use all available CPUs for Elasticsearch/Logstash. Something has to be left for the system.';
                this.kitForm.server_resources.logstashCss = "text-danger";
                SetElasticSearchValidated(false);
            } else {
                this.kitForm.server_resources.elasticSearchErrorText = ' - Looks good!';
                this.kitForm.server_resources.elasticSearchCss = "text-success";
                this.kitForm.server_resources.logstashErrorText = ' - Looks good!';
                this.kitForm.server_resources.logstashCss = "text-success";
                SetElasticSearchValidated(true);
            }
            
            if (parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_cpus.value) == 0) {
                this.kitForm.server_resources.elasticSearchErrorText = ' - Error: Elasticsearch CPUs must be non-zero!';
                this.kitForm.server_resources.elasticSearchCss = "text-danger";
                SetElasticSearchValidated(false);
            }

            if (parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_memory.value) == 0) {
                this.kitForm.server_resources.elasticSearchMemErrorText = ' - Error: Elasticsearch memory must be non-zero!';
                this.kitForm.server_resources.elasticSearchMemCss = "text-danger";
                SetElasticSearchValidated(false);
            } else if (server_memory_available < memory_required) {
                this.kitForm.server_resources.elasticSearchMemErrorText = ' - Error: Insufficient server memory available.';
                this.kitForm.server_resources.elasticSearchMemCss = "text-danger";
                SetElasticSearchValidated(false);
            } else if (server_memory_available == memory_required) {
                this.kitForm.server_resources.elasticSearchMemErrorText = ' - Error: You cannot use all memory available for Elasticsearch alone.';
                this.kitForm.server_resources.elasticSearchMemCss = "text-danger";
                SetElasticSearchValidated(false);
            } else {
                this.kitForm.server_resources.elasticSearchMemErrorText = ' - Looks good!';
                this.kitForm.server_resources.elasticSearchMemCss = "text-success";
                SetElasticSearchValidated(true);
            }
        } else {
            SetElasticSearchValidated(false);            
        }
    }
}