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
  $( "#{{ object.args[0] }}" ).replaceWith(data.cpus_available);
  $( "#{{ object.args[1] }}" ).replaceWith(data.memory_available.toFixed(2));
});
