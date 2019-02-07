import { FormGroup } from '@angular/forms';

import { HtmlInput } from '../html-elements';
import {  PERCENT_PLACEHOLDER, PERCENT_MIN_MAX, PERCENT_INVALID_FEEDBACK,
          PERCENT_VALID_FEEDBACK, CONSTRAINT_MIN_ONE, WHAT_IS_CEPH, MIN_ONE_INVALID_FEEDBACK,
          CONSTRAINT_MIN_ZERO, MIN_ZERO_INVALID_FEEDBACK,
          CONSTRAINT_MIN_TWO, MIN_TWO_INVALID_FEEDBACK,
          CONSTRAINT_MIN_THREE, MIN_THREE_INVALID_FEEDBACK
       } from '../frontend-constants';


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

    /**
     * Overridden method
     */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({
            'elastic_masters': this.elastic_masters.default_value,
            'elastic_datas': this.elastic_datas.default_value,
            'elastic_cpus': this.elastic_cpus.default_value,
            'elastic_memory': this.elastic_memory.default_value,
            'elastic_pv_size': this.elastic_pv_size.default_value,
            'elastic_curator_threshold': this.elastic_curator_threshold.default_value,
            'elastic_cpus_per_instance_ideal': this.elastic_cpus_per_instance_ideal.default_value,
            'elastic_cpus_to_mem_ratio': this.elastic_cpus_to_mem_ratio.default_value
        });
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
        CONSTRAINT_MIN_ZERO,
        MIN_ZERO_INVALID_FEEDBACK,
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

    /**
     * Overridden method
     */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({
            'kafka_jvm_memory': this.kafka_jvm_memory.default_value,
            'kafka_pv_size': this.kafka_pv_size.default_value,
            'zookeeper_jvm_memory': this.zookeeper_jvm_memory.default_value,
            'zookeeper_pv_size': this.zookeeper_pv_size.default_value,
            'zookeeper_replicas': this.zookeeper_replicas.default_value
        });
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
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
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
        super.addControl('moloch_packet_v3_block_size', this.moloch_packet_v3_block_size);
        super.addControl('moloch_packet_v3_num_threads', this.moloch_packet_v3_num_threads);
    }

    /**
     * Overridden method
     */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({
            'moloch_pcap_pv_size': this.moloch_pcap_pv_size.default_value,
            'moloch_bpf': this.moloch_bpf.default_value,
            'moloch_dontSaveBPFs': this.moloch_dontSaveBPFs.default_value,
            'moloch_spiDataMaxIndices': this.moloch_spiDataMaxIndices.default_value,
            'moloch_pcapWriteMethod': this.moloch_pcapWriteMethod.default_value,
            'moloch_pcapWriteSize': this.moloch_pcapWriteSize.default_value,
            'moloch_dbBulkSize': this.moloch_dbBulkSize.default_value,
            'moloch_maxESConns': this.moloch_maxESConns.default_value,
            'moloch_maxESRequests': this.moloch_maxESRequests.default_value,
            'moloch_packetsPerPoll': this.moloch_packetsPerPoll.default_value,
            'moloch_magicMode': this.moloch_magicMode.default_value,
            'moloch_maxPacketsInQueue': this.moloch_maxPacketsInQueue.default_value,
            'moloch_packet_v3_block_size': this.moloch_packet_v3_block_size.default_value,
            'moloch_packet_v3_num_threads': this.moloch_packet_v3_num_threads.default_value
        });
    }

    moloch_packet_v3_block_size = new HtmlInput(
        'moloch_packet_v3_block_size',
        'T PacketV3 Block Size',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '8388608',
        'The block size in bytes used for reads from each interface. There are 120 blocks per interface.'
    )

    moloch_packet_v3_num_threads = new HtmlInput(
        'moloch_packet_v3_num_threads',
        'T PacketV3 Num Threads',
        '',
        'number',
        CONSTRAINT_MIN_ONE,
        MIN_ONE_INVALID_FEEDBACK,
        true,
        '8',
        'The number of threads used to read packets from each interface. These threads take the packets \
        from the AF packet interface and place them into the packet queues.'
    )

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
        '2560000',
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
        '400000',
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
        '500000',
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
        'basic',
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
        '400000',
        "See: https://github.com/aol/moloch/wiki/FAQ#why-am-i-dropping-packets"
    )

}
