// This will contact the server, run the _server route, and the value provided
// here will be used in the server.html template as the loop count variable
// to determine how many server forms should be made. (IE if the user types
// 5 in Number of Servers it will be transfered as the variable server_count)
// here.
$.get("{{ url_for('_gather_host_facts') }}", { server_management_ip: $( 'input[name={{ text_input_field_id }}]' ).val() }, function(data){
  <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      Dropdown button
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      <a class="dropdown-item" href="#">Action</a>
      <a class="dropdown-item" href="#">Another action</a>
      <a class="dropdown-item" href="#">Something else here</a>
    </div>
  </div>
});
