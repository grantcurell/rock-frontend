// This will contact the server, run the _server route, and the value provided
// here will be used in the server.html template as the loop count variable
// to determine how many server forms should be made. (IE if the user types
// 5 in Number of Servers it will be transfered as the variable server_count)
// here.

// Adding this allows this code to be identified in a browser debugger
//@ sourceURL=button_reaction_gather_server_facts.js

$.getJSON("{{ url_for('_gather_server_facts') }}", { management_ip: $( 'input[name={{ object.field_id }}]' ).val() }, function(data){
  var current_total_cpus = parseInt($( "#server_cpus_available" ).text());
  current_total_cpus = data.cpus_available + current_total_cpus;
  $( "#server_cpus_available" ).replaceWith('<span id="server_cpus_available">' + current_total_cpus + '</span>');
  var current_total_memory = parseFloat($( "#server_memory_available" ).text());
  current_total_memory = data.memory_available + current_total_memory;
  $( "#server_memory_available" ).replaceWith('<span id="server_memory_available">' + current_total_memory.toFixed(2) + '</span>');

  // args[0] correlates to server_{{ i + 1}}_cpus_available in server.html
  $( "#{{ object.args[0] }}" ).replaceWith(data.cpus_available);

  // args[1] correlates to server_{{ i + 1}}_memory_available in server.html
  $( "#{{ object.args[1] }}" ).replaceWith(data.memory_available.toFixed(2));

  var total_disk_space = 0;
  $.each( JSON.parse(data.disks), function( index, value ) {
    total_disk_space += value.size_gb;
  });

  // args[2] correlates to server_{{ i + 1}}_disk_space_available in server.html
  $( "#{{ object.args[2] }}" ).replaceWith(total_disk_space.toFixed(2));

  // args[3] correlates to server_{{ i + 1}}_hostname in server.html
  $( "#{{ object.args[3] }}" ).replaceWith(" - " + data.hostname);

  // This will contact the server, run the _ceph_drives_list route, and the value provided
  // here will be used in the server.html template as the loop count variable
  // to determine how many server forms should be made. (IE if the user types
  // 5 in Number of Servers it will be transfered as the variable server_count)
  // here.
  $.get("{{ url_for('_ceph_drives_list') }}", { device_count: Object.keys(JSON.parse(data.disks)).length, disks: data.disks }, function(data){
    // The hide method is here because effects only work if the element
    // begins in a hidden state
    $( "#server_ceph_drive_list" ).html(data).hide().slideDown("slow");
  });


  // This causes the gather facts button and the number of servers button to be
  // disabled so that users can't accidentally blow away their own form data
  /*if(current_total_cpus > 0) {
    $( "#{{ object.button_id }}" ).prop( "disabled", true );
    $( "#{{ object.field_id }}" ).prop( "disabled", true );
    $( "#{{ form.number_of_servers.button_id }}" ).prop( "disabled", true );
    $( "#{{ form.number_of_servers.field_id }}" ).prop( "disabled", true );
  }*/

});
