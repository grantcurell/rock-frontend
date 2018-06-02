// This will contact the server, run the _server route, and the value provided
// here will be used in the server.html template as the loop count variable
// to determine how many server forms should be made. (IE if the user types
// 5 in Number of Servers it will be transfered as the variable server_count)
// here.

// Adding this allows this code to be identified in a browser debugger
//@ sourceURL=button_reaction_gather_server_facts.js

$.getJSON("{{ url_for('_gather_server_facts') }}", { management_ip: $( 'input[name={{ object.field_id }}]' ).val() }, function(data){
  var items = [];
  $.each( data, function( key, val ) {
    items.push(val);
  });
  $( "#server_memory_available" ).replaceWith(items.join( "" ));
});
