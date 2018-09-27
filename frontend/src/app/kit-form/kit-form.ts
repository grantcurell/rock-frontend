import {
    FormGroup, FormArray,
    AbstractControl,
    FormControl
} from '@angular/forms';

import { HtmlInput, HtmlCheckBox, HtmlDropDown, HtmlCardSelector, HtmlHidden } from '../html-elements';
import { SensorResourcesForm } from '../total-sensor-resources-card/total-sensor-resources-form';
import { TotalServerResources } from '../total-server-resources-card/total-server-resources-form';
import {  PERCENT_PLACEHOLDER, PERCENT_MIN_MAX, PERCENT_INVALID_FEEDBACK, 
          PERCENT_VALID_FEEDBACK, KUBE_CIDR_CONSTRAINT, IP_CONSTRAINT,
          CONSTRAINT_MIN_ONE, WHAT_IS_CEPH, MIN_ONE_INVALID_FEEDBACK,
          CONSTRAINT_MIN_ZERO, MIN_ZERO_INVALID_FEEDBACK,
          CONSTRAINT_MIN_TWO, MIN_TWO_INVALID_FEEDBACK,
          CONSTRAINT_MIN_EIGHT, MIN_EIGHT_INVALID_FEEDBACK,
          CONSTRAINT_MIN_THREE, MIN_THREE_INVALID_FEEDBACK,
          INVALID_FEEDBACK_INTERFACE, INVALID_FEEDBACK_IP
       } from '../frontend-constants';

import { BasicNodeResource, BasicNodeResourceInterface } from '../basic-node-resource-card/basic-node-resource-card.component';
import { TotalSystemResources } from '../total-system-resource-card/total-system-resource-form';
import { ValidateKitInventory } from './kit-form-validation';

export interface DeviceFactsContainerInterface{
    deviceFacts: Object;    
}

/**
 * Sets the drive selections based on the passed in deviceFacts.
 * 
 * @param deviceFacts 
 * @returns - [{value: "sdb", label: "sdb - 50 GB"}]
 */
function SetDriveSelections(deviceFacts: Object) : Array<{value: string, label: string}> {
    let driveSelections = new Array();

    if (deviceFacts == null){
        return driveSelections;
    }

    for (let item of deviceFacts["disks"]){
        if (item["hasRoot"]){
            continue;
        }
        driveSelections.push({value: item["name"], label: item["name"] + " - " + item["size_gb"] + " GB"})
    }
    return driveSelections;
}

export class SensorFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public interfaceSelections: Array<{value: string, label: string}>;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string) {
        super({});
        this.hidden = hidden;                
        this.host_server.setDefaultValue(managementIP);
        super.addControl('host_server', this.host_server);
        super.addControl('monitor_interface', this.monitor_interface);
        super.addControl('ceph_drives', this.ceph_drives);
        super.addControl('pcap_drives', this.pcap_drives);
        
        super.addControl('hostname', this.hostname);
        super.addControl('bro_workers', this.bro_workers);
        super.addControl('moloch_threads', this.moloch_threads)
        super.addControl('sensor_type', this.sensor_type);

        this.basicNodeResource = new BasicNodeResource();
        this.deviceFacts = null;
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();                
    }

    hostname = new HtmlHidden('hostname', true);
    
    /**
     * Sets option selections for both interfaces and CEPH drives.
     */
    public setSensorOptionsSelections(managementIp: string){
        if (this.deviceFacts == null){
            return;
        }        
        
        //Reset selections if user clicks on Gather facts twice.
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();
        this.driveSelections = SetDriveSelections(this.deviceFacts);

        for (let item of this.deviceFacts["interfaces"]){
            if (item["name"] == 'lo'){
                continue;
            }

            if (item["ip_address"] == managementIp){
                continue;
            }

            this.interfaceSelections.push({value: item["name"], label: item["name"] + " - " + item["ip_address"]})
        }
    }    

    host_server = new HtmlInput (
        'host_server',
        'Management IP Address',      
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        undefined,
        '',
        'Looks good! Now hit \"Gather Facts\"! Heads up, once you add a server successfully, you can\'t remove it!',
        undefined,
        true,
        'Gather Facts'
    )

    monitor_interface = new HtmlCardSelector(
        'monitor_interface',
        'Select Monitor Interface',
        "The interfaces on the sensor you would like to use for monitoring.\
        These will be the interfaces that Moloch, Bro, and Suricata use.\
        Note: The management interface will not appear in this list. You \
        cannot use an interface for both management and monitoring.",
        "Select which interfaces you would like to use as monitor interfaces.",
        "Note: The management interface will not be listed below. It is not eligble for use as a monitor interface.",
        INVALID_FEEDBACK_INTERFACE,
        true,
    )

    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",      
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )

    pcap_drives = new HtmlCardSelector (
        'pcap_drives',
        "PCAP Drives",      
        "TODO Add a PCAP description here.",
        "Select which drive you would like to use for PCAP storage.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        false
    )

    bro_workers = new HtmlInput(
        'bro_workers',
        'Number of Bro Workers',
        "1",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,      
        true,
        '0',
        "The number of bro workers to run on each sensor. The worker is the Bro process \
        that sniffs network traffic and does protocol analysis on the reassembled traffic \
        streams. Most of the work of an active cluster takes place on the workers and \
        as such, the workers typically represent the bulk of the Bro processes that \
        are running in a cluster. See https://www.bro.org/sphinx/cluster/index.html for \
        more information.",
        undefined,
        true
    )
   
    moloch_threads = new HtmlInput (
        'moloch_threads',
        'Number of Moloch Threads',
        "1",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '0',      
        "Number of threads to use to process packets AFTER the reader has received \
        the packets. This also controls how many packet queues there are, since each \
        thread has its own queue. Basically how much CPU to dedicate to parsing the \
        packets. Increase this if you get errors about dropping packets or the packetQ \
        is over flowing.",
        undefined,
        true
    )

    sensor_type = new HtmlDropDown(
        'sensor_storage_type',
        'Sensor Type',
        ['Local', 'Remote'],
        "Indicates if the sensor in question is a local or a remote sensor.",
        'Local'
    )
}

export class ServerFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string) {
        super({});
        this.hidden = hidden;                
        this.host_server.setDefaultValue(managementIP);
        super.addControl('host_server', this.host_server);
        super.addControl('is_master_server', this.is_master_server);
        super.addControl('ceph_drives', this.ceph_drives)
        super.addControl('hostname', this.hostname);
        this.basicNodeResource = new BasicNodeResource();
        this.driveSelections = new Array();
        this.deviceFacts = null;
    }

    public setOptionSelections(){
        this.driveSelections = SetDriveSelections(this.deviceFacts);
    }

    hostname = new HtmlHidden('hostname', true);

    host_server = new HtmlInput (
        'host_server',
        'Management IP Address',      
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        'You must input the server management IP address.',
        true,
        undefined,
        '',
        'Looks good! Now hit \"Gather Facts\"! Heads up, once you add a server successfully, you can\'t remove it!',
        undefined,
        true,
        'Gather Facts'
    )

    is_master_server = new HtmlCheckBox(
        "is_master_server",
        "Is Kubernetes master server?",
        "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
        There can only be one master server. It is a bit like the Highlander that way.\
        The master server is special in that it runs the Kubernetes master and is     \
        responsible for deploying services out to all the other hosts in the cluster. \
        This server should be fairly beefy. By default, this server will also provide \
        DNS to the rest of the kit for internal services. WARNING: If this server     \
        fails, the entire kit goes down with it!!!"
    )

    //TODO make this spot dry
    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",      
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )
}

export class AdvancedElasticSearchSettingsFormGroup extends FormGroup {
    constructor() {
        super({});
        super.addControl('elastic_masters', this.elastic_masters);
        super.addControl('elastic_datas', this.elastic_datas);
        super.addControl('elastic_cpus', this.elastic_cpus);
        super.addControl('elastic_memory', this.elastic_memory);
        super.addControl('elastic_pv_size', this.elastic_pv_size);
        super.addControl('elastic_curator_threshold', this.elastic_curator_threshold);
        super.addControl('elastic_cpus_per_instance_ideal', this.elastic_cpus_per_instance_ideal);
        super.addControl('elastic_cpus_to_mem_ratio', this.elastic_cpus_to_mem_ratio);
    }

    elastic_masters = new HtmlInput(
        'elastic_masters',
        'Elasticsearch Masters',
        "# of Elasticsearch masters",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '3',
        "The number of Elasticsearch masters you would like to run on your kit. Each of \
        these will run all Elasticsearch node types. Unless you are going to exceed 5 Elasticsearch \
        nodes, you should run masters instead of data instances. See https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html \
        for a description of the node types.",
        undefined,
        true
    )

    elastic_datas = new HtmlInput(
        'elastic_datas',
        'Elasticsearch Data Nodes',
        "# of Elasticsearch data nodes",
        'number',
        CONSTRAINT_MIN_ZERO,
        MIN_ZERO_INVALID_FEEDBACK,
        true,
        '0',
        "The number of Elasticsearch data nodes you will run. Each of these run the Elasticsearch \
        data node type. You should use these if your instance count would exceed 5. \
        See https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html for \
        a description of the node types.",
        undefined,
        true
    )

    elastic_cpus = new HtmlInput(
        'elastic_cpus',
        'Elasticsearch CPUs',
        "Logical CPUs per Elasticsearch instance",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '0',
        "The number of CPUs which will be assigned to each Elasticsearch instance.",
        undefined,
        true
    )

    elastic_memory = new HtmlInput(
        'elastic_memory',
        'Elasticsearch Memory',
        "Memory in GB per Elasticsearch instance",
        'number',
        CONSTRAINT_MIN_TWO,
        MIN_TWO_INVALID_FEEDBACK,
        true,
        '0',
        "The amount of memory you would like to assign per Elasticsearch instance. Elasticsearch \
        will use the memlock feature of the OS to take the memory and immediately commit it for \
        itself. Good values depend very heavily on the type of traffic that the system runs and developing \
        good predictive models of what work is one of the more challenging engineering problems\
        that exists. We generally recommend you stick with the recommended default. If you \
        know what you are doing, you might try experimenting with this value.",
        undefined,
        true
    )

    elastic_pv_size = new HtmlInput(
        'elastic_pv_size',
        'ES Persistent Volume Size',
        "Storage space in GB per Elasticsearch instance",
        'number',
        CONSTRAINT_MIN_EIGHT,
        MIN_EIGHT_INVALID_FEEDBACK,
        true,
        '0',
        "The amount of space to allocate from the Ceph cluster to the persistent volume \
        used per Elasticsearch instance. See " + WHAT_IS_CEPH['label'] + " for a description \
        of persistent volumes and Ceph.",
        undefined,
        true
    )

    elastic_curator_threshold = new HtmlInput(
        'elastic_curator_threshold',
        'ES Curator Threshold',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '90',
        "The percentage of maximum allocated space for Elasticsearch that can be filled \
        before Curator begins deleting indices. The oldest moloch indices that exceed \
        this threshold will be deleted.",
        PERCENT_VALID_FEEDBACK
    )

    elastic_cpus_per_instance_ideal = new HtmlInput(
        'elastic_cpus_per_instance_ideal',
        'Ideal ES CPUs Per Instance',
        "Default value should be set to 8.",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '8',
        "This is the value that the automatic resource computation algorithm will use to \
        maximize the number of Elasticsearch instances. We settled on 8 based on testing \
        and recommendations from Elasticsearch engineers. If you have fewer than this \
        number the algorithm will still adapt. Unless you really know what you are doing \
        we do not recommend changing this number."
    )

    elastic_cpus_to_mem_ratio = new HtmlInput(
        'elastic_cpus_to_mem_ratio',
        'ES CPU to Memory Ratio Default',
        "Default value should be set to 3.",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '3',
        "This is the ratio of CPUs to memory. This is the value that the automatic resource computation algorithm will use to \
        estimate memory resource requirement by default. This \
        can vary greatly dependent on the workload. Unless you really know what you are \
        doing we do not recommend changing this number. Keep in mind that this is the ratio \
        the algorithm begins with. If there are insufficient memory resources, it will \
        first try this number and then reduce it until it reaches 1:0 or a working configuration \
        is found."
    )
}

export class AdvancedKafkaSettingsFormGroup extends FormGroup {

    constructor() {
        super({});
        super.addControl('kafka_jvm_memory', this.kafka_jvm_memory);
        super.addControl('kafka_pv_size', this.kafka_pv_size);
        super.addControl('zookeeper_jvm_memory', this.zookeeper_jvm_memory);
        super.addControl('zookeeper_pv_size', this.zookeeper_pv_size);
        super.addControl('zookeeper_replicas', this.zookeeper_replicas);
    }

    kafka_jvm_memory = new HtmlInput(
        'kafka_jvm_memory',
        'Kafka JVM Memory',
        "Kafka JVM Memory in GBs",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '1',
        "This is the amount of memory which will be allocated to Kafka's JVM instance."
    )

    kafka_pv_size = new HtmlInput(
        'kafka_pv_size',
        'Kafka Persistent Volume Size',
        "Storage space in GB per Kafka instance",
        'number',
        CONSTRAINT_MIN_THREE,
        MIN_THREE_INVALID_FEEDBACK,
        true,
        '3',
        "The amount of space to allocate from the Ceph cluster to the persistent volume \
        used per Kafka instance. See " + WHAT_IS_CEPH['label'] + " for a description \
        of persistent volumes and Ceph."
    )

    zookeeper_jvm_memory = new HtmlInput(
        'zookeeper_jvm_memory',
        'Zookeeper JVM Memory',
        "Zookeeper JVM Memory in GBs",
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '1',
        "This is the amount of memory which will be allocated to Zookeeper's JVM instance."
    )

    zookeeper_pv_size = new HtmlInput(
        'zookeeper_pv_size',
        'Zookeeper Persistent Volume Size',
        "Storage space in GB per Zookeeper instance",
        'number',
        CONSTRAINT_MIN_THREE,
        MIN_THREE_INVALID_FEEDBACK,
        true,
        '3',
        "The amount of space to allocate from the Ceph cluster to the persistent volume \
        used per Zookeeper instance. See " + WHAT_IS_CEPH['label'] + " for a description \
        of persistent volumes and Ceph."
    )

    zookeeper_replicas = new HtmlInput(
        'zookeeper_replicas',
        'Zookeeper Replicas',
        "Number of Zookeeper instances",
        'number',
        CONSTRAINT_MIN_THREE,
        MIN_THREE_INVALID_FEEDBACK,
        true,
        '3',
        "This is the number of Zookeeper instances your kit will run. These are used for \
        redundancy and load balancing. There isn't much reason to run more than three."
    )

}


export class AdvancedMolochSettingsFormGroup extends FormGroup {

    constructor() {
        super({});
        super.addControl('moloch_pcap_pv_size', this.moloch_pcap_pv_size);
        super.addControl('moloch_bpf', this.moloch_bpf);
        super.addControl('moloch_dontSaveBPFs', this.moloch_dontSaveBPFs);
        super.addControl('moloch_spiDataMaxIndices', this.moloch_spiDataMaxIndices);
        super.addControl('moloch_pcapWriteMethod', this.moloch_pcapWriteMethod);
        super.addControl('moloch_pcapWriteSize', this.moloch_pcapWriteSize);
        super.addControl('moloch_dbBulkSize', this.moloch_dbBulkSize);
        super.addControl('moloch_maxESConns', this.moloch_maxESConns);
        super.addControl('moloch_maxESRequests', this.moloch_maxESRequests);
        super.addControl('moloch_packetsPerPoll', this.moloch_packetsPerPoll);
        super.addControl('moloch_magicMode', this.moloch_magicMode);
        super.addControl('moloch_maxPacketsInQueue', this.moloch_maxPacketsInQueue);
    }

    moloch_pcap_pv_size = new HtmlInput(
        'moloch_pcap_pv_size',
        'Moloch PCAP Persistent Volume Size',
        "Size of Moloch PCAP PV",
        'number',
        CONSTRAINT_MIN_ZERO,
        'You must allocate at least 1 GB to Moloch\'s PCAP PV',
        true,
        '0',
        "See " + WHAT_IS_CEPH['label'] + " and Sensor Storage Type for a good \
        explanation of how Ceph works and what this field does. This is the amount of space \
        you will allocate from the Ceph cluster to Moloch\'s PCAP storage. This is set up on \
        a per instance basis. For example, if you put 8 here, each Moloch instance will receive \
        8 GB to write to.",
        undefined,
        true
    )

    moloch_bpf = new HtmlInput(
        'moloch_bpf',
        'Moloch BPF Filter',
        "WARNING: MOLOCH WILL NOT WORK IF THIS IS WRONG",
        'text',
        null,
        undefined,
        false,
        '',        
        "See https://biot.com/capstats/bpf.html for a full description of different BPF \
        filters. We strongly recommend you test any BPF filters you choose to use with \
        tcpdump before you submit them here. There is no built in validator in this web \
        UI for BPF filters. (Though feel free to write one and push it to us.) If you get \
        this wrong, Moloch will not work correctly. See https://github.com/aol/moloch/wiki/Settings \
        for Moloch's description. If you enter a filter here, Moloch will ONLYprocess \
        the packets it matches and will discard everything it does NOT match."
    )

    moloch_dontSaveBPFs = new HtmlInput(
        'moloch_dontSaveBPFs',
        'Moloch Don\'t Save BPF Filter',
        "WARNING: MOLOCH WILL NOT WORK IF THIS IS WRONG",
        'text',
        null,
        undefined,
        false,
        '',
        "See https://biot.com/capstats/bpf.html for a full description of different BPF \
        filters. We strongly recommend you test any BPF filters you choose to use with \
        tcpdump before you submit them here. There is no built in validator in this web \
        UI for BPF filters. (Though feel free to write one and push it to us.) If you get \
        this wrong, Moloch will not work correctly. See https://github.com/aol/moloch/wiki/Settings \
        for Moloch's description. If you enter a filter here, Moloch will ONLY save the \
        PCAP for the packets it matches and will discard everything it does NOT match.<br>\
        This expects a semicolon ';' separated list of bpf filters which when matched \
        for a session causes the remaining pcap from being saved for the session. It is \
        possible to specify the number of packets to save per filter by ending with a \
        :num. For example dontSaveBPFs = port 22:5 will only save 5 packets for port 22 \
        sessions. Currently only the initial packet is matched against the bpfs."
    )

    moloch_spiDataMaxIndices = new HtmlInput(
        'moloch_spiDataMaxIndices',
        'Moloch SPI Data Max Indices',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '5',
        "Specify the max number of indices we calculate spidata for. Elasticsearch will \
        blow up if we allow the spiData to search too many indices."
    )

    moloch_pcapWriteMethod = new HtmlInput(
        'moloch_pcapWriteMethod',
        'Moloch PCAP Write Method',
        '',
        'text',
        null,
        undefined,
        true,
        'simple',
        "Specify how packets are written to disk. \
        'simple' = what you should probably use. \
        'simple-nodirect = use this with zfs/nfs. \
        's3' = write packets into s3. \
        'null' = don't write to disk at all."
    )

    moloch_pcapWriteSize = new HtmlInput (
        'moloch_pcapWriteSize',
        'Moloch PCAP Write Size',
        '',
        'number',
        //TODO Add validation here later for 4096.
        null,
        'This must be at least 4096.',
        true,
        '262143',
        "Buffer size when writing pcap files. Should be a multiple of the raid 5/xfs \
        stripe size and multiple of 4096 if using direct/thread-direct pcapWriteMethod",        
    )

    moloch_dbBulkSize = new HtmlInput (
        'moloch_dbBulkSize',
        'Moloch DB Bulk Size',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,      
        true,
        '20000',
        "Size of indexing request to send to Elasticsearch. Increase if monitoring a \
        high bandwidth network."
    )

    moloch_maxESConns = new HtmlInput (
        'moloch_maxESConns',
        'Moloch Maximum ES Connections',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,      
        true,
        '30',
        "Max number of connections to Elasticsearch from capture process"
    )
   
    moloch_maxESRequests = new HtmlInput(
        'moloch_maxESRequests',
        'Moloch Maximum ES Requests',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '500',
        "Max number of Elasticsearch requests outstanding in queue"
    )

    moloch_packetsPerPoll = new HtmlInput(
        'moloch_packetsPerPoll',
        'Moloch Maximum Packets Per Poll',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '50000',
        "Number of packets to ask libnids/libpcap to read per poll/spin. Increasing may \
        hurt stats and ES performance. Decreasing may cause more dropped packets"
    )

    moloch_magicMode = new HtmlInput(
        'moloch_magicMode',
        'Moloch Magic Mode',
        '',
        'text',
        null,
        undefined,
        true,
        'libmagic',
        "(since 0.16.1) libfile can be VERY slow. Less accurate \"magicing\" \
        is available for http/smtp bodies. \
        'libmagic' = normal libmagic. \
        'libmagicnotext' = libmagic, but turns off text checks. \
        'molochmagic' = molochmagic implementation (subset of libmagic input files, and less accurate). \
        'basic' = 20 of most common headers. \
        'none' = no libmagic or molochmagic calls."
    )

     moloch_maxPacketsInQueue = new HtmlInput (
        'moloch_maxPacketsInQueue',
        'Moloch Maximum Packets in Queue',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '200000',
        "See: https://github.com/aol/moloch/wiki/FAQ#why-am-i-dropping-packets"
    )
   
}

export class SensorsFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }    
}

export class ServersFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }
}

export class KitInventoryForm extends FormGroup {
    servers: ServersFormArray;
    sensors: ServersFormArray;
    kubernetesCidrInfoText;

    constructor() {
        super({}, ValidateKitInventory);
        super.addControl('sensor_storage_type', this.sensor_storage_type);
        super.addControl('root_password', this.root_password);
        super.addControl('elastic_cpu_percentage', this.elastic_cpu_percentage);
        super.addControl('elastic_memory_percentage', this.elastic_memory_percentage);
        super.addControl('logstash_cpu_percentage', this.logstash_cpu_percentage);
        super.addControl('logstash_replicas', this.logstash_replicas);
        super.addControl('elastic_storage_percentage', this.elastic_storage_percentage);
        super.addControl('moloch_pcap_storage_percentage', this.moloch_pcap_storage_percentage);
        super.addControl('kubernetes_services_cidr', this.kubernetes_services_cidr);        

        this.servers = new ServersFormArray([], true);
        this.sensors = new SensorsFormArray([], true);
        super.addControl('servers', this.servers);
        super.addControl('sensors', this.sensors);
        super.addControl('sensor_resources', this.sensor_resources);
        super.addControl('server_resources', this.server_resources);

        super.addControl('advanced_moloch_settings', this.advanced_moloch_settings);
        super.addControl('advanced_elasticsearch_settings', this.advanced_elasticsearch_settings);
        super.addControl('advanced_kafka_settings', this.advanced_kafka_settings);
        super.addControl('dns_ip', this.dns_ip);
        super.addControl('disable_autocalculate', this.disable_autocalculate);

        this.kubernetesCidrInfoText = "";
    }

    public addServerFormGroup(managementIP: string){        
        this.servers.hidden = false;
        this.servers.push(new ServerFormGroup(false, managementIP));
    }

    public addSensorFormGroup(managementIP: string){        
        this.sensors.hidden = false;
        this.sensors.push(new SensorFormGroup(false, managementIP));
    }

    system_resources = new TotalSystemResources();
    server_resources = new TotalServerResources();
    sensor_resources = new SensorResourcesForm();

    advanced_moloch_settings = new AdvancedMolochSettingsFormGroup();
    advanced_elasticsearch_settings = new AdvancedElasticSearchSettingsFormGroup();
    advanced_kafka_settings = new AdvancedKafkaSettingsFormGroup();
    
    sensor_storage_type = new HtmlDropDown(
        'sensor_storage_type',
        'Sensor Storage Type',
        ['Use Ceph clustered storage for PCAP', 'Use hard drive for PCAP storage'],
        "The kit can use two types of storage for PCAP. One is clustered Ceph storage \
        and the other is a disk on the sensor itself. See what_is_ceph['label'] \
        for a description of Ceph. The advantage to clustered storage \
        is that all hard drives given to Ceph are treated like one \"mega hard drive\". \
        This means that you may have PCAP come in on sensor 1, but if its disk is filling \
        up, it can just write that data to the disk on sensor 2 because it is also part \
        of the Ceph cluster. The downside is that now all of the internal kit traffic \
        must traverse the internal kit network backbone. If you have a 10Gb/s link, this \
        may not be a big deal to you. If you only have a 1Gb/s link, this will likely be \
        a bottleneck. However, if you aren't capturing a lot of traffic, this may not \
        be a big deal to you. In direct attached storage mode, you will write the data \
        directly to a locally attached disk or folder on the sensor. This obviously is \
        much faster, but has the downside in that once that disk is full, the data has \
        to roll even if there is space available elsewhere in the kit. Regardless of your \
        decision, this only applies to PCAP. Everything else will use clustered storage \
        with Ceph. Though, that traffic is only a fraction of what PCAP consumes in most \
        cases.",
        'Use hard drive for PCAP storage'
    )

    root_password = new HtmlInput(
        'root_password',
        'Root Password',
        '',
        'password',
        '^.{6,}$',
        'You must enter a root password with a minimum length of 6 characters.',
        true,
        '',
        "The root password will be how to log into each node after the kickstart process completes.  \
        Do not forget this password or you will not be able to complete the system installation."
    )

    elastic_cpu_percentage = new HtmlInput(
        'elastic_cpu_percentage',
        'Elasticsearch CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server CPUs which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- CPUs here does not mean dedicated CPUs. \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        CPU you want going to Elasticsearch.",
        PERCENT_VALID_FEEDBACK
    )

    elastic_memory_percentage = new HtmlInput(
        'elastic_memory_percentage',
        'Elasticsearch RAM %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server RAM which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        RAM you want going to Elasticsearch.",
        PERCENT_VALID_FEEDBACK
    )

    logstash_cpu_percentage = new HtmlInput(
        'logstash_cpu_percentage',
        'Logstash Servers CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '5',
        "The Percentage of the server CPU resources which will be dedicated to logstash. \
        Unlike some of the other calculations, this is a percentage of the total server \
        resources.",
        PERCENT_VALID_FEEDBACK
    )

    logstash_replicas = new HtmlInput (
        'logstash_replicas',
        'Logstash Replicas',
        "The number of logstash instances you would like to run",
        'number',
        '^[1-9]|[1-9]\\d+$',
        'Enter the number of elasticsearch master instances you would like',
        true,
        '1',      
        "This is the number of instances of Logstash you would like to run."      
    )

    elastic_storage_percentage = new HtmlInput (
        'elastic_storage_percentage',
        'ES Storage Space %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '90',
        "Setting this value correctly can be a bit confusing. It depends primarily if you \
        are running Ceph for PCAP storage or not. If you are not using Ceph for PCAP storage \
        then this value can be very high - we recommend around 90%. This is due to the \
        fact that Elasticsearch accounts for the overwhelming bulk of the resource demand \
        on the server and there's not much need for storing other things. However, if you \
        are using Ceph for PCAP then you will have to share server storage with Moloch. \
        Moloch also takes up a lot of space. If you are running Moloch, in general, we give \
        Moloch 60% and Elasticsearch 30%, but this depends heavily on the size of your disk storage.",
        PERCENT_VALID_FEEDBACK
    )

    moloch_pcap_storage_percentage = new HtmlInput (
        'moloch_pcap_storage_percentage',
        'Moloch PCAP Storage Percentage',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '1',      
        "This is the percentage of the clustered storage which will be assigned to Moloch PCAP. \
        In general, we give this 60% and Elasticsearch 30%, but this depends heavily on \
        the amount of storage you have available. You can play with the values to see what \
        works for you.",
        PERCENT_VALID_FEEDBACK
    )

    kubernetes_services_cidr = new HtmlInput(
        'kubernetes_services_cidr',
        'Kubernetes Service IP Range Start',
        "Put your Kubernetes Services CIDR here.",
        'text',
        KUBE_CIDR_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        undefined,
        "Services_cidr is the range of addresses kubernetes will use for external services \
        This includes cockpit (a front end for Kubernetes), Moloch viewer, Kibana, elastichq, kafka-manager, and the \
        kubernetes dashboard. This will use a /28 under the hood. This means it will take \
        whatever IP address you enter and create a range addresses from that IP +16. For example, \
        192.168.1.16 would become a range from 192.168.1.16-31."
    )    

    dns_ip = new HtmlInput(
        'dns_ip',
        'DNS IP Address',
        "Same as Master Server management IP",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        false,
        undefined,
        "The IP address of the system DNS server. You may define this or it will   \
        default  to using the master server's management IP. We suggest you leave \
        it to default  unless you have a specific reason to use a different DNS   \
        server. Keep in mind  you will need to manually provide all required DNS  \
        entries on your separate  DNS Server or the kit will break."
    )

    disable_autocalculate = new HtmlCheckBox(
        "disable_autocalculate",
        "Disable Autocalculations for Elasticsearch/Logstash/Moloch Threads/Bro Workers",
        "By default, the system will calculate recommended values for the number of Elasticsearch \
        nodes required, Elasticsearch resource requirements, Logstash, Bro workers, and Moloch threads. \
        If you know what you are doing and you have a specific use case, you may not want these \
        values autocalculated for you. In general, you should use the field " +
        this.elastic_cpu_percentage.label + " and " + this.elastic_memory_percentage.label + " \
        to control the allocation of resources for Elasticsearch. The algorithm was based \
        on recommendations from Elasticsearch. However, you may disable these by unchecking \
        this checkbox."
    )
}