// This will contact the server, run the _server route, and the value provided
// here will be used in the server.html template as the loop count variable
// to determine how many server forms should be made. (IE if the user types
// 5 in Number of Servers it will be transfered as the variable server_count)
// here.

// Adding this allows this code to be identified in a browser debugger
//@ sourceURL=button_reaction_gather_device_facts.js

// args[0] correlates to server_{{ i + 1}}_cpus_available in server.html
// args[1] correlates to server_{{ i + 1}}_memory_available in server.html
// args[2] correlates to server_{{ i + 1}}_disk_space_available in server.htmlHolde
// args[3] correlates to server_{{ i + 1}}_hostname in server.html
// args[4] correlates to i (the server number) in server.html
// args[5] correlates to the word server or sensor in server.html or sensor.html respectively

{% if object.args[5] == 'server' %}
// This is modeled from https://www.geeksforgeeks.org/program-best-fit-algorithm-memory-management/
// server_memory_list (int array): A list of server instances and the memory available
//                          to each one
// num_servers (int): The number of servers in server_memory_list
// instance_size (int): The size of an Elasticsearch instance
// num_instances (int): The number of Elasticsearch instances
// server_cpus_list (int array): A list of server instances and the cpus available
//                          to each one
// cpus_per_instance (int): The number of CPUs which will be assigned per instance
// The purpose of this function is to ensure that when we calculate the recommended
// number of Elasticsearch instances that they can actually fit on the individual
// servers. For example, you may have a scenario where the total resource pool
// allows for 3 instances, but it is divided among 4 servers in a way which precludes
// allocation. This function will return false if it was unable to allocate the
// instances appropriately across the servers.
function elastic_fit(server_memory_list[], num_servers, instance_size, num_instances, server_cpus_list[], cpus_per_instance) {

  // Stores block id of the block allocated to a
  // process
  var allocation[num_instances];

  for (i=0; i<num_instances; i++)
  {
      // Find the best fit block for current process
      var bestIdx = -1;
      for (j=0; j<num_servers; j++)
      {
          if (server_memory_list[j] >= instance_size && server_cpu_list[j] >= cpus_per_instance)
          {
              if (bestIdx == -1)
                  bestIdx = j;
              else if (server_memory_list[bestIdx] > server_memory_list[j] || server_cpus_list[bestIdx] > server_cpus_list[j])
                  bestIdx = j;
          }
      }

      // If we could find a block for current process
      if (bestIdx != -1)
      {
          // allocate block j to p[i] process
          allocation[i] = bestIdx;

          // Reduce available memory on this server
          server_memory_list[bestIdx] -= instance_size;

          // Reduce processors available on this server
          server_cpus_list[bestIdx] -= cpus_per_instance;
      }
  }

  output = "\nProcess No.\tProcess Size\tBlock no.\n");
  for (i = 0; i < num_instances; i++)
  {
      output += "   " << i+1 << "\t\t" << instance_size << "\t\t";
      if (allocation[i] != -1)
          output += allocation[i] + 1;
      else
          output += "Not Allocated"
          //return false;
  }
  alert(output);
}
{% endif %}

$.getJSON("{{ url_for('_gather_device_facts') }}", { management_ip: $( 'input[name={{ object.field_id }}]' ).val() }, function(data){

  var current_total_cpus = data.cpus_available + parseInt($( "#{{ object.args[5] }}_cpus_available" ).text());
  $( "#{{ object.args[5] }}_cpus_available" ).replaceWith('<span id="{{ object.args[5] }}_cpus_available">' + current_total_cpus + '</span>');

  var current_total_memory = data.memory_available + parseFloat($( "#{{ object.args[5] }}_memory_available" ).text());
  $( "#{{ object.args[5] }}_memory_available" ).replaceWith('<span id="{{ object.args[5] }}_memory_available">' + current_total_memory.toFixed(2) + '</span>');

  current_total_system_cpus = data.cpus_available + parseInt($( "#system_cpus_available" ).text());
  $( "#system_cpus_available" ).replaceWith('<span id="system_cpus_available">' + current_total_system_cpus + '</span>');

  current_total_system_memory = data.memory_available + parseFloat($( "#system_memory_available" ).text());
  $( "#system_memory_available" ).replaceWith('<span id="system_memory_available">' + current_total_system_memory.toFixed(2) + '</span>');

  // args[0] correlates to server_{{ i + 1}}_cpus_available in server.html
  $( "#{{ object.args[0] }}" ).replaceWith(data.cpus_available);

  // args[1] correlates to server_{{ i + 1}}_memory_available in server.html
  $( "#{{ object.args[1] }}" ).replaceWith(data.memory_available.toFixed(2));

  var total_disk_space = 0;
  $.each( JSON.parse(data.disks), function( index, value ) {
    total_disk_space = value.size_gb + total_disk_space;
  });

  // args[2] correlates to server_{{ i + 1}}_disk_space_available in server.htmlHolde
  $( "#{{ object.args[2] }}" ).replaceWith(total_disk_space.toFixed(2));

  // args[3] correlates to server_{{ i + 1}}_hostname in server.html
  $( "#{{ object.args[3] }}" ).replaceWith(" - " + data.hostname);

  // args[4] correlates to i (the server number) in server.html
  $.get("{{ url_for('_ceph_drives_list') }}", { disks: data.disks, device_number: {{ object.args[4] }}, isServer: "{{ True if object.args[5] == 'server' else False }}" }, function(data){
    // The hide method is here because effects only work if the element
    // begins in a hidden state
    $( "#{{ [object.args[5] + '_ceph_drive_list', object.args[4]] | join('_') }}" ).html(data).hide().slideDown("slow");
  });

  // This causes the gather facts button and the number of servers button to be
  // disabled so that users can't accidentally blow away their own form data
  /*if(current_total_cpus > 0) {
    $( "#{{ object.button_id }}" ).prop( "disabled", true );
    $( "#{{ object.field_id }}" ).prop( "disabled", true );
    {% if object.args[5] == "server" %}
    $( "#{{ form.number_of_servers.button_id }}" ).prop( "disabled", true );
    $( "#{{ form.number_of_servers.field_id }}" ).prop( "disabled", true );
    {% else %}
    $( "#{{ form.number_of_sensors.button_id }}" ).prop( "disabled", true );
    $( "#{{ form.number_of_sensors.field_id }}" ).prop( "disabled", true );
    {% endif %}
  }*/

  // This section is for facts specific to only the sensor.
  {% if object.args[5] == 'sensor' %}
    $.get("{{ url_for('_display_monitor_interfaces') }}", { interfaces: JSON.stringify(data.potential_monitor_interfaces), instance_number: {{ object.args[4] }} }, function(data){
      // The hide method is here because effects only work if the element
      // begins in a hidden state
      $( "#{{ form.sensor_monitor_interface }}_{{ object.args[4] }}" ).html(data).hide().slideDown("slow");
    });

    // Configure Sensor Moloch Threads
    var moloch_threads = Math.round(current_total_cpus * (2/3));
    if (moloch_threads < 1) {
      moloch_threads = 1;
    }

    // Configure Sensor Bro Threads
    var bro_workers = Math.round(current_total_cpus * (1/3));
    if (bro_workers < 1) {
      bro_workers = 1;
    }

    $( "#{{ form.moloch_threads.field_id + '_' }}{{ object.args[4] }}" ).val(moloch_threads);
    $( "#{{ form.bro_workers.field_id + '_' }}{{ object.args[4] }}" ).val(bro_workers);

  {% endif %}

  // This section is for facts specific to only the server
  {% if object.args[5] == 'server' %}

  elastic_resource_percentage = $( "#{{ form.elastic_resource_percentage.field_id }}" ).val();
  elastic_recommended_cpus = $( "#{{ form.elastic_cpus_per_instance_ideal.field_id }}" ).val();
  elastic_cpu_to_mem_ratio = $( "#{{ form.elastic_cpus_to_mem_ratio.field_id }}" ).val();

  if(elastic_resource_percentage < 1 || elastic_resource_percentage > 99) {
    $( "#{{ form.elastic_resource_percentage.field_id }}" ).val({{ form.elastic_resource_percentage.default_value }});
  }

  // The total number of CPUs Elasticsearch could potentially use
  var elastic_available_cpus = Math.round(current_total_system_cpus * (elastic_resource_percentage/100));

  // The total amount of memory Elasticsearch could potentially use
  var elastic_available_memory = Math.round(current_total_system_memory * (elastic_resource_percentage/100));

  var elastic_memory_per_instance = 0; // The required memory per Elasticsearch instance
  var elastic_cpus_per_instance = 0; // The required CPUs per Elasticsearch instance
  var elastic_instances = 0; // The total number of Elasticsearch instances
  var elastic_memory_required = 0; // The total amount of RAM required for all Elasticsearch instances

  // This section is the algorithm that calculates the number of instances of master
  // and server that should be run on the system
  if(elastic_available_cpus < 3) {

    alert('FAIL - TO FEW CPUS')

  } else {

    if(elastic_available_cpus < elastic_recommended_cpus * 3) {

      alert('WARN NOT PRODUCTION READY');
      elastic_instances = 3;

      if(elastic_available_memory > 3 * elastic_cpu_to_mem_ratio) {

        alert('FAIL - NOT ENOUGH MEMORY');

      } else {

        elastic_memory_per_instance = Math.round((elastic_available_cpus * elastic_cpu_to_mem_ratio) / 3);
        elastic_cpus_per_instance = Math.round(elastic_available_cpus / 3);

      }

    } else {

      elastic_instances = Math.round(elastic_available_cpus / elastic_recommended_cpus);
      elastic_memory_required = elastic_instances * elastic_cpu_to_mem_ratio * elastic_recommended_cpus;

      if(elastic_memory_required < elastic_available_memory) {
        alert('FAIL - NOT ENOUGH MEMORY');
      }

      elastic_memory_per_instance = Math.round(elastic_memory_required / elastic_instances);

    }

    for(i = 0; i < parseInt($( "#{{ form.number_of_servers.field_id }}" ).val()); i++) {

    }

    elastic_fit(server_memory_list[], num_servers, instance_size, num_instances, server_cpus_list[], cpus_per_instance)

  }


  {% endif %}

});
