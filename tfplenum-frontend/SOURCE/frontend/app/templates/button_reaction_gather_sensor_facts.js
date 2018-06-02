// This will contact the server, run the _server route, and the value provided
// here will be used in the server.html template as the loop count variable
// to determine how many server forms should be made. (IE if the user types
// 5 in Number of Servers it will be transfered as the variable server_count)
// here.
$.get("{{ url_for('_gather_sensor_facts') }}", { management_ip: $( 'input[name={{ object.field_id }}]' ).val() }, function(data){});
