import { KitInventoryForm, ServerFormGroup } from './kit-form';
import { StorageCalculator } from './storage-calculations';
import { SetElasticSearchValidated } from './kit-form-globals'; 

export class ElasticSearchCalculator {
    kitForm: KitInventoryForm;
    storageCalculator: StorageCalculator;

    constructor(kitForm: KitInventoryForm, storageCalculator: StorageCalculator) 
    {
        this.kitForm = kitForm;
        this.storageCalculator = storageCalculator;
    }

    //TODO break out various pieces of the calculate form into smaller pieces.
    public calculate() {
        // server_memory_list (int array): A list of server instances and the memory available
        //                          to each one
        // number_of_servers (int): The number of servers in server_memory_list
        // elastic_memory_per_instance (int): The size in GBs of the amount of memory required for an
        //                      Elasticsearch instance
        // elastic_instances (int): The number of Elasticsearch instances
        // server_cpus_list (int array): A list of server instances and the cpus available
        //                          to each one
        // elastic_cpus_per_instance (int): The number of CPUs which will be assigned per instance
        // The purpose of this function is to ensure that when we calculate the recommended
        // number of Elasticsearch instances that they can actually fit on the individual
        // servers. For example, you may have a scenario where the total resource pool
        // allows for 3 instances, but it is divided among 4 servers in a way which precludes
        // allocation. This function will return false if it was unable to allocate the
        // instances appropriately across the servers.

        if (this.kitForm.disable_autocalculate.value){            
            return;
        }

        // This variable denotes a build that will work, but does not reach recommended minimums
        let warning_reached = false;

        // Used to determine if one of the servers is short on memory.
        let mem_warning_reached = false;

        // The percentage of CPU the user input that Elasticsearch will use
        let elastic_cpu_percentage = parseInt(this.kitForm.elastic_cpu_percentage.value);

        // The percentage of RAM the user input that Elasticsearch will use
        let elastic_memory_percentage = parseInt(this.kitForm.elastic_memory_percentage.value);

        // See the forms explanation for elastic_cpus_per_instance_ideal
        let elastic_recommended_cpus = parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_cpus_per_instance_ideal.value);

        // The amonut of RAM Elasticsearch should use per CPU core
        let elastic_cpu_to_mem_ratio = parseInt(this.kitForm.advanced_elasticsearch_settings.elastic_cpus_to_mem_ratio.value);

        // Same as the above, but this will not be modified. elastic_cpu_to_mem_ratio will change
        // if the proper amount of resources aren't available.
        let ideal_cpu_to_mem = elastic_cpu_to_mem_ratio;

        // The number of Logstash replicas for the system
        let logstash_replicas = parseInt(this.kitForm.logstash_replicas.value);

        // The percentage of the CPU power Logstash should consume
        let logstash_cpu_percentage = parseInt(this.kitForm.logstash_cpu_percentage.value);

        // The number of servers available in the system
        let number_of_servers = this.kitForm.servers.length;

        // The number of CPU cores Logstash will need
        let logstash_required_cpu = this.kitForm.server_resources.cpuCoresAvailable * (logstash_cpu_percentage / 100) / logstash_replicas;
        this.kitForm.server_resources.setAssignedLogstashCpus( (logstash_required_cpu / logstash_replicas) );

        if (elastic_cpu_percentage < 1 || elastic_cpu_percentage > 99) {
            this.kitForm.elastic_cpu_percentage.setValue(this.kitForm.elastic_cpu_percentage.default_value);
        }

        if (elastic_memory_percentage < 1 || elastic_memory_percentage > 99) {
            this.kitForm.elastic_memory_percentage.setValue(this.kitForm.elastic_memory_percentage.default_value);
        }

        // The total number of CPUs Elasticsearch could potentially use. We subtract
        // the number of servers because each server must have one core set aside for
        // other functions
        let elastic_available_cpus = Math.floor((this.kitForm.server_resources.cpuCoresAvailable * (elastic_cpu_percentage / 100)) - number_of_servers);
        if (elastic_available_cpus < 0){
            this.kitForm.server_resources.setTotalAssignedElasticSearchCPUs(0);
        } else {
            this.kitForm.server_resources.setTotalAssignedElasticSearchCPUs(elastic_available_cpus);
        }
            
        // The total amount of memory Elasticsearch could potentially use
        let elastic_available_memory = this.kitForm.server_resources.memoryAvailable * (elastic_memory_percentage / 100);
        this.kitForm.server_resources.assignedElasicSearchMemory = elastic_available_memory;

        let elastic_memory_per_instance = 0; // The required memory per Elasticsearch instance
        let elastic_cpus_per_instance = 0; // The required CPUs per Elasticsearch instance
        let elastic_instances = 0; // The total number of Elasticsearch instances
        let elastic_memory_required = 0; // The total amount of RAM required for all Elasticsearch instances

        // This section is the algorithm that calculates the number of instances of master
        // and server that should be run on the system.

        // The magic number 3 refers to the minimum number of instances. Ideally, you should
        // never run fewer than 3 instances of Elasticsearch.
        let elastic_minimum_instances = 3;

        // At a bare minimum, you should be be able to dedicate one CPU to each instance
        // This makes sure that is the case
        if (elastic_available_cpus < elastic_minimum_instances) {

            console.log('FAIL - INSUFFICIENT CPUS')

            // These repeated three lines redraw the text with either error or success
            // messages. We use the parent method in this case, otherwise it would just
            // color the number and the error message
            this.kitForm.server_resources.elasticSearchCss = "text-danger";
            this.kitForm.server_resources.elasticSearchErrorText = ' - Error: Insufficient CPUs. You do not even have enough to assign 1 core per instance. Minimum number of instances is ' + elastic_minimum_instances;            
            SetElasticSearchValidated(false);
        } else {

            // Ideally, each instance can run at least some ideal number of CPUs. Currently,
            // this is 8. However, some setups don't have this much. This conditional
            // statement handles these low power situations.
            let recommended_cpus = elastic_recommended_cpus * elastic_minimum_instances
            if (elastic_available_cpus < recommended_cpus) {

                this.kitForm.server_resources.elasticSearchCss = "text-warning";
                this.kitForm.server_resources.elasticSearchErrorText = ' - Warning: You have enough CPU power to at least create a build, but you do not meet the recommended minimum of ' + recommended_cpus;
                warning_reached = true;

                // If there aren't enough CPUs to run in production mode, we'll set the number
                // of instances to elastic_minimum_instances (3 by default)
                elastic_instances = elastic_minimum_instances;

                // If we don't have enough CPUs for the recommended amount, we'll use some
                // proportion of elastic_minimum_instances
                elastic_cpus_per_instance = Math.floor(elastic_available_cpus / elastic_minimum_instances);
                console.log(elastic_cpus_per_instance);
                // This condition handles the production mode for the kit.
            } else {
                elastic_cpus_per_instance = elastic_recommended_cpus;
                console.log(elastic_cpus_per_instance);

                // The largest constraint is typically CPU power so we base the number of
                // Elasticsearch instances on the number of available CPUs
                elastic_instances = Math.floor(elastic_available_cpus / elastic_cpus_per_instance);
                warning_reached = false;
            }

            this.kitForm.server_resources.setTotalAssignedElasticSearchCPUs(elastic_cpus_per_instance * elastic_instances);

            // The memory required in production mode will be some ratio (3 by default)
            // multiplied by the number of instances of Elasticsearch, further multiplied
            // by however many CPUs belong to each instance.
            elastic_memory_required = elastic_instances * elastic_cpu_to_mem_ratio * elastic_cpus_per_instance;
            elastic_memory_per_instance = elastic_memory_required / elastic_instances;

            // Check to make sure we have enough memory to run the designated number of instances
            if (elastic_memory_required > elastic_available_memory) {

                // Even if we cannot run with an ideal quantity of memory, it is possible
                // to reduce the amount of memory and potentially still run the kit by
                // reducing the CPU:MEM ratio. This loop decrements the elastic_cpu_to_mem_ratio
                // by one until either there is enough memory to support all instances or
                // the ratio is one to one and there still isn't enough memory
                while (elastic_memory_required > elastic_available_memory && elastic_cpu_to_mem_ratio > 1) {
                    elastic_cpu_to_mem_ratio -= 1;
                    elastic_memory_required = elastic_instances * elastic_cpu_to_mem_ratio * elastic_cpus_per_instance;
                    elastic_memory_per_instance = elastic_memory_required / elastic_instances;
                }

                if (elastic_available_memory > elastic_memory_required) {
                    console.log('SUCCESS - REDUCED MEMORY RATIO TO ' + elastic_cpu_to_mem_ratio);
                } else {
                    this.kitForm.server_resources.elasticSearchMemCss = "text-danger";
                    this.kitForm.server_resources.elasticSearchMemErrorText = ' - Error: Insufficient memory. You need at least ' + elastic_memory_required + ' GBs to start a build.';
                    SetElasticSearchValidated(false)
                }
            }

            let server_memory_list = new Array(number_of_servers);
            let server_cpus_list = new Array(number_of_servers);

            // This is modeled from https://www.geeksforgeeks.org/program-best-fit-algorithm-memory-management/

            // This loop attempts to allocate all Elasticsearch instances. If it cannot,
            // it will reduce the number of Elasticsearch instances. Ideally, the section
            // above would prevent this from happening, but you could have a scenario where
            // the total pool of server resources could support all of the Elasticsearch
            // instances, but it would cause a specific server to become over tasked. For
            // example, you might have a total memory pool of 115GB available to Elasticsearch.
            // Each server could have 57.5GB available. The blocks preceeding this would
            // calculate you could support seven Elasticsearch instances each at 16 GB of
            // RAM successfully. While the total memory can support 7 instances which in
            // total requires 112 GB of RAM, you could not fit 7 instances across two servers
            // with only 57.5 GB of RAM each. Each server can only support 3 instances at
            // 16GB. The code block below will check for this condition. It will attempt
            // to allocate all instances across the servers. If it cannot, it will decrement
            // the Elasticsearch instances count by 1. In our example, it would decrement
            // from 7 to 6, which would succeed.
            let elasticsearch_successful_allocation_cpu = true;
            let elasticsearch_successful_allocation_ram = true;
            let logstash_successful_allocation = true;

            do {
                for (let i = 0; i < number_of_servers; i++) {
                    let serverForm = this.kitForm.servers.at(i) as ServerFormGroup;

                    // This is the number of CPUs the server has avialable
                    let total_server_cpus = serverForm.basicNodeResource.cpu_cores;

                    // This line takes the total number of cores available on each server, takes the percenteage of the CPUs the user requests and
                    // then subtracts one because you should always have one core left over
                    server_cpus_list[i] = Math.floor(total_server_cpus * (elastic_cpu_percentage / 100));
                }

                elasticsearch_successful_allocation_cpu = true;
                elasticsearch_successful_allocation_ram = true;
                logstash_successful_allocation = true;
                mem_warning_reached = false;

                // Stores block id of the block allocated to a process
                if (isNaN(elastic_instances)){
                    elastic_instances = 0;
                }

                let elasticsearch_cpu_allocation = new Array(elastic_instances);
                let elasticsearch_memory_allocation = new Array(elastic_instances);

                // Initialize the elasticsearch_allocation array
                for (let i = 0; i < elastic_instances; i++) {
                    elasticsearch_cpu_allocation[i] = -1;
                    elasticsearch_memory_allocation[i] = -1;
                }

                // This for loop handles allocating CPUs for Elasticsearch
                for (let i = 0; i < elastic_instances; i++) {
                    // Find the best fit block for current process
                    var bestIdx = -1;
                    for (let j = 0; j < number_of_servers; j++) {
                        if (server_cpus_list[j] >= elastic_cpus_per_instance) {
                            if (bestIdx == -1)
                                bestIdx = j;
                            else if (server_cpus_list[bestIdx] > server_cpus_list[j])
                                bestIdx = j;
                        }
                    }

                    // If we could find a block for current process
                    if (bestIdx != -1) {
                        // allocate block j to p[i] process
                        elasticsearch_cpu_allocation[i] = bestIdx;

                        // Reduce processors available on this server
                        server_cpus_list[bestIdx] -= elastic_cpus_per_instance;
                    }
                }

                do {

                    for (let i = 0; i < number_of_servers; i++) {
                        let serverForm = this.kitForm.servers.at(i) as ServerFormGroup;
                        server_memory_list[i] = serverForm.basicNodeResource.memory * (elastic_memory_percentage / 100);
                    }

                    // This loop handles allocating memory
                    for (let i = 0; i < elastic_instances; i++) {
                        // Find the best fit block for current process
                        var bestIdx = -1;
                        for (let j = 0; j < number_of_servers; j++) {
                            if (server_memory_list[j] >= elastic_memory_per_instance) {
                                if (bestIdx == -1)
                                    bestIdx = j;
                                else if (server_memory_list[bestIdx] > server_memory_list[j])
                                    bestIdx = j;
                            }
                        }

                        // If we could find a block for current process
                        if (bestIdx != -1) {
                            // allocate block j to p[i] process
                            elasticsearch_memory_allocation[i] = bestIdx;

                            // Reduce available memory on this server
                            server_memory_list[bestIdx] -= elastic_memory_per_instance;
                        }
                    }

                    let total_server_memory_available = [];
                    let total_memory_used = [];

                    // This checks to see if any server would have less than 4 GB remaining.
                    // You could still run the build it just might be a problem.
                    for (let i = 0; i < number_of_servers; i++) {
                        let serverForm = this.kitForm.servers.at(i) as ServerFormGroup;
                        total_server_memory_available[i] = serverForm.basicNodeResource.memory;
                    }

                    // The total amount used is whatever we started with minus any memory
                    // leftover from the above loop (which is what would be in server_memory_list
                    // still).
                    for (let i = 0; i < number_of_servers; i++) {
                        total_memory_used[i] = total_server_memory_available[i] - server_memory_list[i];
                    }

                    // Check to see if any of that is under 4GB
                    for (let i = 0; i < number_of_servers; i++) {
                        if ((total_server_memory_available[i] - total_memory_used[i]) < 4) {
                            mem_warning_reached = true;
                        }
                    }

                    if (elasticsearch_memory_allocation.includes(-1)) {
                        elastic_memory_per_instance -= 1;
                    }

                } while (elasticsearch_memory_allocation.includes(-1) && elastic_memory_per_instance > 0);

                // The above section allocated all the Elasticsearch instances, now we have
                // to see if we can allocate Logstash

                // This part of the equation attempts to match the logstash instance to a
                // server

                // We have to figure out how much of the server's resources remain. This takes
                // whatever CPU power wasn't originally allocated to Elasticsearch and then
                // adds in any CPU power which was left as a remainder from the calculation
                // above
                for (let i = 0; i < number_of_servers; i++) {
                    if (server_cpus_list[i] == -1) {
                        server_cpus_list[i] = 0;
                    }
                    let serverForm = this.kitForm.servers.at(i) as ServerFormGroup;
                    server_cpus_list[i] = serverForm.basicNodeResource.cpu_cores - Math.floor(serverForm.basicNodeResource.cpu_cores * (elastic_cpu_percentage / 100)) + server_cpus_list[i];
                }

                // Stores block id of the block allocated to a
                // process
                var logstash_allocation = new Array(logstash_replicas);

                // Initialize the logstash_allocation array
                for (let i = 0; i < logstash_replicas; i++) {
                    logstash_allocation[i] = -1
                }

                for (let i = 0; i < logstash_replicas; i++) {
                    // Find the best fit block for current process
                    var bestIdx = -1;
                    for (let j = 0; j < number_of_servers; j++) {
                        if (server_cpus_list[j] >= logstash_required_cpu) {
                            if (bestIdx == -1)
                                bestIdx = j;
                            else if (server_cpus_list[bestIdx] > server_cpus_list[j])
                                bestIdx = j;
                        }
                    }

                    // If we could find a block for current process
                    if (bestIdx != -1) {
                        // allocate block j to p[i] process
                        logstash_allocation[i] = bestIdx;

                        // Reduce processors available on this server
                        server_cpus_list[bestIdx] -= logstash_required_cpu;

                    }
                }

                for (let i = 0; i < elastic_instances; i++) {
                    if (elasticsearch_cpu_allocation[i] != -1) {
                        console.log('Elasticsearch Instance ' + i + ' CPU successfully allocated.');
                    } else {
                        console.log('Elasticsearch Instance ' + i + ' CPU failed to allocate.');
                        elasticsearch_successful_allocation_cpu = false;
                    }
                }

                for (let i = 0; i < elastic_instances; i++) {
                    if (elasticsearch_memory_allocation[i] != -1) {
                        console.log('Elasticsearch Instance ' + i + ' RAM successfully allocated.');
                    } else {
                        console.log('Elasticsearch Instance ' + i + ' RAM failed to allocate.');
                        elasticsearch_successful_allocation_ram = false;
                    }
                }

                for (let i = 0; i < logstash_replicas; i++) {
                    if (logstash_allocation[i] != -1) {
                        console.log('Logstash Instance ' + i + ' successfully allocated.');
                    } else {
                        console.log('Logstash Instance ' + i + ' failed to allocate.');
                        logstash_successful_allocation = false;
                    }
                }

                // This is based on the recommendation from Elasticsearch that we run 5 servers with all roles and if there are more than 5
                // we start splitting it up with data nodes.
                if (elasticsearch_successful_allocation_cpu && elasticsearch_successful_allocation_ram && logstash_successful_allocation) {
                    if (elastic_instances > 5) {
                        this.kitForm.advanced_elasticsearch_settings.elastic_masters.setValue(5);
                        this.kitForm.advanced_elasticsearch_settings.elastic_datas.setValue(elastic_instances - 5);
                    } else {
                        this.kitForm.advanced_elasticsearch_settings.elastic_masters.setValue(elastic_instances);
                    }

                    this.kitForm.advanced_elasticsearch_settings.elastic_memory.setValue(elastic_memory_per_instance);
                    console.log(elastic_cpus_per_instance);
                    this.kitForm.advanced_elasticsearch_settings.elastic_cpus.setValue(elastic_cpus_per_instance);
                    this.kitForm.server_resources.setAssignedElasticSearchCPURequest(elastic_cpus_per_instance);
                    this.storageCalculator.recalculate_storage_recommendation()                    
                    console.log("SUCCESS. ALL ELASTICSEARCH/LOGSTASH INSTANCES ALLOCATED.");
                } else {
                    console.log("FAIL - COULD NOT ALLOCATE INSTANCES. REDUCING ELASTICSEARCH INSTANCES BY 1.");
                    elastic_instances -= 1;
                }
            } while ((!elasticsearch_successful_allocation_ram || !elasticsearch_successful_allocation_cpu || !logstash_successful_allocation) && elastic_instances >= elastic_minimum_instances);
        

            if (elasticsearch_successful_allocation_ram) {
                if (mem_warning_reached) {
                    console.log('WARN - Server memory dangerously low!');
                    this.kitForm.server_resources.elasticSearchMemCss = "text-warning";

                    if (elastic_memory_per_instance < ideal_cpu_to_mem) {
                        this.kitForm.server_resources.elasticSearchMemErrorText = ' - Heads up, the system could potentially allocate pods in a way in which a server has less than 4GB remaining. This may never happen and it won\'t stop you from building, but it *could* cause problems! On top of that, we had to reduce the memory per instance to ' + elastic_memory_per_instance + " to get Elasticsearch to fit on the system!";
                    } else {
                        this.kitForm.server_resources.elasticSearchMemErrorText = ' - Heads up, the system could potentially allocate pods in a way in which a server has less than 4GB remaining. This may never happen and it won\'t stop you from building, but it *could* cause problems!';
                    }
                } else {
                    if (elastic_memory_per_instance < ideal_cpu_to_mem) {
                        this.kitForm.server_resources.elasticSearchMemCss = "text-warning";
                        this.kitForm.server_resources.elasticSearchMemErrorText = ' - We got it to work, but we had to drop the memory per instance to ' + elastic_memory_per_instance + ".";
                    } else {
                        this.kitForm.server_resources.elasticSearchMemCss = "text-success";
                        this.kitForm.server_resources.elasticSearchMemErrorText = ' - Looks good!';
                    }
                }
            } else {
                this.kitForm.server_resources.elasticSearchMemCss = "text-danger";
                this.kitForm.server_resources.elasticSearchMemErrorText = ' - Error: Could not allocate all Elasticsearch instances successfully! Remember, Elasticsearch cannot use 100% of a single server\'s resources!';
            }

            if (elasticsearch_successful_allocation_cpu) {
                if (!warning_reached) {
                    this.kitForm.server_resources.elasticSearchCss = "text-success";
                    this.kitForm.server_resources.elasticSearchErrorText = ' - Looks good!';
                }
            } else {
                this.kitForm.server_resources.elasticSearchCss = "text-danger";
                this.kitForm.server_resources.elasticSearchErrorText = ' - Error: Could not allocate all Elasticsearch instances successfully! Remember, Elasticsearch cannot use 100% of a single server\'s resources!';
            }

            if (!logstash_successful_allocation) {
                this.kitForm.server_resources.logstashCss = "text-danger";
                this.kitForm.server_resources.logstashErrorText = ' - Error: Could not allocate all Logstash instances successfully!';
            } else {
                this.kitForm.server_resources.logstashCss = "text-success";
                this.kitForm.server_resources.logstashErrorText = ' - Looks good!';
            }
            
            if (logstash_successful_allocation && elasticsearch_successful_allocation_cpu && elasticsearch_successful_allocation_ram) {
                SetElasticSearchValidated(true);
                this.kitForm.advanced_elasticsearch_settings.elastic_cpus.setValue(elastic_cpus_per_instance);
                this.kitForm.server_resources.setAssignedLogstashCpus(logstash_required_cpu);
            } else {
                SetElasticSearchValidated(false);
            }
        }
    }
}
