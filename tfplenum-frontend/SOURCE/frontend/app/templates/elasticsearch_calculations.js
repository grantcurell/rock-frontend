recalculate_elasticsearch_recommendations = function() {

  //@ sourceURL=elasticsearch_calculations.js

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

  // This variable denotes a build that will work, but does not reach recommended minimums
  var warning_reached = false;

  var elastic_cpu_percentage = parseInt($( "#{{ form.elastic_cpu_percentage.field_id }}" ).val());
  var elastic_memory_percentage = parseInt($( "#{{ form.elastic_memory_percentage.field_id }}" ).val());
  var elastic_recommended_cpus = parseInt($( "#{{ form.elastic_cpus_per_instance_ideal.field_id }}" ).val());
  var elastic_cpu_to_mem_ratio = parseInt($( "#{{ form.elastic_cpus_to_mem_ratio.field_id }}" ).val());
  var ideal_cpu_to_mem = elastic_cpu_to_mem_ratio;
  var logstash_replicas = parseInt($( "#{{ form.logstash_replicas.field_id }}" ).val());
  var logstash_cpu_percentage = parseInt($( "#{{ form.logstash_cpu_percentage.field_id }}" ).val());

  var logstash_required_cpu = parseInt($( "#server_cpus_available" ).text()) * (logstash_cpu_percentage/100) / logstash_replicas;
  $( "#logstash_cpus" ).text((logstash_required_cpu / logstash_replicas).toFixed(2));

  if(elastic_cpu_percentage < 1 || elastic_cpu_percentage > 99) {
    $( "#{{ form.elastic_cpu_percentage.field_id }}" ).val({{ form.elastic_cpu_percentage.default_value }});
  }

  if(elastic_memory_percentage < 1 || elastic_memory_percentage > 99) {
    $( "#{{ form.elastic_memory_percentage.field_id }}" ).val({{ form.elastic_memory_percentage.default_value }});
  }

  // The total number of CPUs Elasticsearch could potentially use
  var elastic_available_cpus = Math.floor(parseInt($( "#server_cpus_available" ).text()) * (elastic_cpu_percentage/100));

  $( "#elasticsearch_cpus" ).text(elastic_available_cpus);

  // The total amount of memory Elasticsearch could potentially use
  var elastic_available_memory = parseFloat($( "#server_memory_available" ).text()) * (elastic_memory_percentage/100);
  $( "#elasticsearch_memory" ).text(elastic_available_memory.toFixed(2));

  var elastic_memory_per_instance = 0; // The required memory per Elasticsearch instance
  var elastic_cpus_per_instance = 0; // The required CPUs per Elasticsearch instance
  var elastic_instances = 0; // The total number of Elasticsearch instances
  var elastic_memory_required = 0; // The total amount of RAM required for all Elasticsearch instances

  // This section is the algorithm that calculates the number of instances of master
  // and server that should be run on the system.

  // The magic number 3 refers to the minimum number of instances. Ideally, you should
  // never run fewer than 3 instances of Elasticsearch.
  var elastic_minimum_instances = 3;

  // At a bare minimum, you should be be able to dedicate one CPU to each instance
  // This makes sure that is the case
  if(elastic_available_cpus < elastic_minimum_instances) {

    console.log('FAIL - INSUFFICIENT CPUS')

    // These repeated three lines redraw the text with either error or success
    // messages. We use the parent method in this case, otherwise it would just
    // color the number and the error message
    $( "#elasticsearch_cpus_errors" ).parent().removeClass( "text-success text-warning" );
    $( "#elasticsearch_cpus_errors" ).parent().addClass( "text-danger" );
    $( "#elasticsearch_cpus_errors" ).text(' - Error: Insufficient CPUs. You do not even have enough to assign 1 core per instance. Minimum number of instances is ' + elastic_minimum_instances);

    if( !$( "#generate_inventory" ).is(':disabled') ) {
      $( "#generate_inventory" ).prop( "disabled", true );
    }

    set_elasticsearch_validation(false);
    validate_all();

  } else {

    // Ideally, each instance can run at least some ideal number of CPUs. Currently,
    // this is 8. However, some setups don't have this much. This conditional
    // statement handles these low power situations.
    recommended_cpus = elastic_recommended_cpus * elastic_minimum_instances
    if(elastic_available_cpus < recommended_cpus) {

      console.log('WARN NOT PRODUCTION READY');
      $( "#elasticsearch_cpus_errors" ).parent().removeClass( "text-success text-danger" );
      $( "#elasticsearch_cpus_errors" ).parent().addClass( "text-warning" );
      $( "#elasticsearch_cpus_errors" ).text(' - Warning: You have enough CPU power to at least create a build, but you do not meet the recommended minimum of ' + recommended_cpus);

      warning_reached = true;

      // If there aren't enough CPUs to run in production mode, we'll set the number
      // of instances to elastic_minimum_instances (3 by default)
      elastic_instances = elastic_minimum_instances;

      // If we don't have enough CPUs for the recommended amount, we'll use some
      // proportion of elastic_minimum_instances
      elastic_cpus_per_instance = Math.floor(elastic_available_cpus / elastic_minimum_instances);

    // This condition handles the production mode for the kit.
    } else {

      elastic_cpus_per_instance = elastic_recommended_cpus;

      // The largest constraint is typically CPU power so we base the number of
      // Elasticsearch instances on the number of available CPUs
      elastic_instances = Math.floor(elastic_available_cpus / elastic_cpus_per_instance);

      warning_reached = false;

    }

    // The memory required in production mode will be some ratio (3 by default)
    // multiplied by the number of instances of Elasticsearch, further multiplied
    // by however many CPUs belong to each instance.
    elastic_memory_required = elastic_instances * elastic_cpu_to_mem_ratio * elastic_cpus_per_instance;
    elastic_memory_per_instance = elastic_memory_required / elastic_instances;

    // Check to make sure we have enough memory to run the designated number of instances
    if(elastic_memory_required > elastic_available_memory) {

      // Even if we cannot run with an ideal quantity of memory, it is possible
      // to reduce the amount of memory and potentially still run the kit by
      // reducing the CPU:MEM ratio. This loop decrements the elastic_cpu_to_mem_ratio
      // by one until either there is enough memory to support all instances or
      // the ratio is one to one and there still isn't enough memory
      while(elastic_memory_required > elastic_available_memory && elastic_cpu_to_mem_ratio > 1) {
          elastic_cpu_to_mem_ratio -= 1;
          elastic_memory_required = elastic_instances * elastic_cpu_to_mem_ratio * elastic_cpus_per_instance;
          elastic_memory_per_instance = elastic_memory_required / elastic_instances;
      }

      if( elastic_available_memory > elastic_memory_required) {
        console.log('SUCCESS - REDUCED MEMORY RATIO TO ' + elastic_cpu_to_mem_ratio);
      } else {
        console.log('FAIL 2 - NOT ENOUGH MEMORY');
        $( "#elasticsearch_memory_errors" ).parent().removeClass( "text-success text-warning" );
        $( "#elasticsearch_memory_errors" ).parent().addClass( "text-danger" );
        $( "#elasticsearch_memory_errors" ).text(' - Error: Insufficient memory. You need at least ' + elastic_memory_required + ' GBs to start a build.');

        if( !$( "#generate_inventory" ).is(':disabled') ) {
          $( "#generate_inventory" ).prop( "disabled", true );
        }

        set_elasticsearch_validation(false);
        validate_all();
      }
    }

    var number_of_servers = parseInt($( "#{{ form.number_of_servers.field_id }}" ).val());

    var server_memory_list = new Array(number_of_servers);
    var server_cpus_list = new Array(number_of_servers);

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
    var elasticsearch_successful_allocation_cpu = true;
    var elasticsearch_successful_allocation_ram = true;
    var logstash_successful_allocation = true;

    do {

      for(i = 0; i < number_of_servers; i++) {
        server_cpus_list[i] = Math.floor(parseInt($( "#server_" + String(i+1) + "_cpus_available" ).text()) * (elastic_cpu_percentage/100));
      }

      elasticsearch_successful_allocation_cpu = true;
      var elasticsearch_successful_allocation_ram = true;
      logstash_successful_allocation = true;

      // Stores block id of the block allocated to a
      // process
      console.log(elastic_instances);
      var elasticsearch_cpu_allocation = new Array(elastic_instances);
      var elasticsearch_memory_allocation = new Array(elastic_instances);

      // Initialize the elasticsearch_allocation array
      for(i=0; i < elastic_instances; i++) {
        elasticsearch_cpu_allocation[i] = -1;
        elasticsearch_memory_allocation[i] = -1;
      }

      // This for loop handles allocating CPUs for Elasticsearch
      for (i=0; i<elastic_instances; i++) {
          // Find the best fit block for current process
          var bestIdx = -1;
          for (j=0; j<number_of_servers; j++)
          {
              if (server_cpus_list[j] >= elastic_cpus_per_instance)
              {
                  if (bestIdx == -1)
                      bestIdx = j;
                  else if (server_cpus_list[bestIdx] > server_cpus_list[j])
                      bestIdx = j;
              }
          }

          // If we could find a block for current process
          if (bestIdx != -1)
          {
              // allocate block j to p[i] process
              elasticsearch_cpu_allocation[i] = bestIdx;

              // Reduce processors available on this server
              server_cpus_list[bestIdx] -= elastic_cpus_per_instance;
          }
      }

      do {

        for(i = 0; i < number_of_servers; i++) {
          server_memory_list[i] = parseFloat($( "#server_" + String(i+1) + "_memory_available" ).text()) * (elastic_memory_percentage/100);
        }

        // This loop handles allocating memory
        for (i=0; i<elastic_instances; i++) {
            // Find the best fit block for current process
            var bestIdx = -1;
            for (j=0; j<number_of_servers; j++)
            {
                if (server_memory_list[j] >= elastic_memory_per_instance)
                {
                    if (bestIdx == -1)
                        bestIdx = j;
                    else if (server_memory_list[bestIdx] > server_memory_list[j])
                        bestIdx = j;
                }
            }

            // If we could find a block for current process
            if (bestIdx != -1)
            {
                // allocate block j to p[i] process
                elasticsearch_memory_allocation[i] = bestIdx;

                // Reduce available memory on this server
                server_memory_list[bestIdx] -= elastic_memory_per_instance;
            }
        }

        if(elasticsearch_memory_allocation.includes(-1)) {
          elastic_memory_per_instance -= 1;
        }

      } while(elasticsearch_memory_allocation.includes(-1) && elastic_memory_per_instance > 0);

      // The above section allocated all the Elasticsearch instances, now we have
      // to see if we can allocate Logstash

      // This part of the equation attempts to match the logstash instance to a
      // server

      // We have to figure out how much of the server's resources remain. This takes
      // whatever CPU power wasn't originally allocated to Elasticsearch and then
      // adds in any CPU power which was left as a remainder from the calculation
      // above
      for(i = 0; i < number_of_servers; i++) {
        if(server_cpus_list[i] == -1) {
          server_cpus_list[i] = 0;
        }
        server_cpus_list[i] = parseInt($( "#server_" + String(i+1) + "_cpus_available" ).text()) - Math.floor(parseInt($( "#server_" + String(i+1) + "_cpus_available" ).text()) * (elastic_cpu_percentage/100)) + server_cpus_list[i];
      }

      // Stores block id of the block allocated to a
      // process
      var logstash_allocation = new Array(logstash_replicas);

      // Initialize the logstash_allocation array
      for(i=0; i < logstash_replicas; i++) {
        logstash_allocation[i] = -1
      }

      for (i=0; i<logstash_replicas; i++) {
          // Find the best fit block for current process
          var bestIdx = -1;
          for (j=0; j<number_of_servers; j++)
          {
              if (server_cpus_list[j] >= logstash_required_cpu)
              {
                  if (bestIdx == -1)
                      bestIdx = j;
                  else if (server_cpus_list[bestIdx] > server_cpus_list[j])
                      bestIdx = j;
              }
          }

          // If we could find a block for current process
          if (bestIdx != -1)
          {
              // allocate block j to p[i] process
              logstash_allocation[i] = bestIdx;

              // Reduce processors available on this server
              server_cpus_list[bestIdx] -= logstash_required_cpu;

          }
      }

      for (i = 0; i < elastic_instances; i++) {
        if (elasticsearch_cpu_allocation[i] != -1) {
            console.log('Elasticsearch Instance ' + i + ' CPU successfully allocated.');
        } else {
            console.log('Elasticsearch Instance ' + i + ' CPU failed to allocate.');
            elasticsearch_successful_allocation_cpu = false;
        }
      }

      for (i = 0; i < elastic_instances; i++) {
        if (elasticsearch_memory_allocation[i] != -1) {
            console.log('Elasticsearch Instance ' + i + ' RAM successfully allocated.');
        } else {
            console.log('Elasticsearch Instance ' + i + ' RAM failed to allocate.');
            elasticsearch_successful_allocation_ram = false;
        }
      }

      for (i = 0; i < logstash_replicas; i++) {
        if (logstash_allocation[i] != -1) {
            console.log('Logstash Instance ' + i + ' successfully allocated.');
        } else {
            console.log('Logstash Instance ' + i + ' failed to allocate.');
            logstash_successful_allocation = false;
        }
      }

      if(elasticsearch_successful_allocation_cpu && elasticsearch_successful_allocation_ram && logstash_successful_allocation) {
        if(elastic_instances > 5) {
          $( "#{{ form.elastic_masters.field_id }}" ).val(5);
          $( "#{{ form.elastic_datas.field_id }}" ).val(elastic_instances-5);
        } else {
          $( "#{{ form.elastic_masters.field_id }}" ).val(elastic_instances);
        }
        $( "#{{ form.elastic_memory.field_id }}" ).val(elastic_memory_per_instance);
        $( "#{{ form.elastic_cpus.field_id }}" ).val(elastic_cpus_per_instance);
        recalculate_storage_recommendation();

        console.log("SUCCESS. ALL ELASTICSEARCH/LOGSTASH INSTANCES ALLOCATED.");
      } else {
        console.log("FAIL - COULD NOT ALLOCATE INSTANCES. REDUCING ELASTICSEARCH INSTANCES BY 1.");
        elastic_instances -= 1;
      }
    } while((!elasticsearch_successful_allocation_ram || !elasticsearch_successful_allocation_cpu || !logstash_successful_allocation) && elastic_instances >= elastic_minimum_instances);

    if(elasticsearch_successful_allocation_ram) {
      if((elastic_available_memory - parseFloat($( "#server_memory_available" ).text())) < 4) {
        console.log('WARN - Server memory dangerously low!');
        $( "#elasticsearch_memory_errors" ).parent().removeClass( "text-danger text-success" );
        $( "#elasticsearch_memory_errors" ).parent().addClass( "text-warning" );
        if(elastic_memory_per_instance < ideal_cpu_to_mem) {
          $( "#elasticsearch_memory_errors" ).text(' - Server memory dangerously low! You have less than 4GB remaining. We won\'t stop you from building, but this might not work and is a bad idea! On top of that, we had to reduce the memory per instance to ' + elastic_memory_per_instance + " to get it to work!");
        } else {
          $( "#elasticsearch_memory_errors" ).text(' - Server memory dangerously low! You have less than 4GB remaining. We won\'t stop you from building, but this might not work and is a bad idea!');
        }
      } else {
        if(elastic_memory_per_instance < ideal_cpu_to_mem) {
          $( "#elasticsearch_memory_errors" ).parent().removeClass( "text-danger text-success" );
          $( "#elasticsearch_memory_errors" ).parent().addClass( "text-warning" );
          $( "#elasticsearch_memory_errors" ).text(' - We got it to work, but we had to drop the memory per instance to ' + elastic_memory_per_instance + ".");
        } else {
          $( "#elasticsearch_memory_errors" ).parent().removeClass( "text-danger text-warning" );
          $( "#elasticsearch_memory_errors" ).parent().addClass( "text-success" );
          $( "#elasticsearch_memory_errors" ).text(' - Looks good!');
        }
      }
    } else {
      $( "#elasticsearch_memory_errors" ).parent().removeClass( "text-success text-warning" );
      $( "#elasticsearch_memory_errors" ).parent().addClass( "text-danger" );
      $( "#elasticsearch_memory_errors" ).text(' - Error: Could not allocate all Elasticsearch instances successfully! Remember, Elasticsearch cannot use 100% of a single server\'s resources!');
    }

    if(elasticsearch_successful_allocation_cpu) {

      if(!warning_reached) {
        $( "#elasticsearch_cpus_errors" ).parent().removeClass( "text-danger text-warning" );
        $( "#elasticsearch_cpus_errors" ).parent().addClass( "text-success" );
        $( "#elasticsearch_cpus_errors" ).text(' - Looks good!');
      }

    } else {
      $( "#elasticsearch_cpus_errors" ).parent().removeClass( "text-success text-danger text-warning" );
      $( "#elasticsearch_cpus_errors" ).parent().addClass( "text-danger" );
      $( "#elasticsearch_cpus_errors" ).text(' - Error: Could not allocate all Elasticsearch instances successfully! Remember, Elasticsearch cannot use 100% of a single server\'s resources!');
    }

    if(!logstash_successful_allocation) {
      $( "#logstash_cpus_errors" ).parent().removeClass( "text-success text-warning" );
      $( "#logstash_cpus_errors" ).parent().addClass( "text-danger" );
      $( "#logstash_cpus_errors" ).text(' - Error: Could not allocate all Logstash instances successfully!');
    } else {
      $( "#logstash_cpus_errors" ).parent().removeClass( "text-danger text-warning" );
      $( "#logstash_cpus_errors" ).parent().addClass( "text-success" );
      $( "#logstash_cpus_errors" ).text(' - Looks good!');
    }

    if(logstash_successful_allocation && elasticsearch_successful_allocation_cpu && elasticsearch_successful_allocation_ram) {
      set_elasticsearch_validation(true);
      validate_all();
    } else {
      set_elasticsearch_validation(false);
      validate_all();
    }
  }
};
