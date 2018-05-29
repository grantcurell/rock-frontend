
$( document ).ready(function() {

  // Server events: this function handles when a user presses submit on the
  // number of servers button.
  // See: https://api.jquery.com/click/
  $('#{{ form.number_of_servers.button_id }}').click(function (event) {
    // Using [0] here because when you use $( "#form_servers" ) you get a jQuery
    // selection set. To access the DOM properties you have to select the first
    // item. checkValidity is an HTML5 built in function we are calling against
    // the element.
    if ($( "#{{ form.number_of_servers.form_name }}" )[0].checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      // This will contact the server, run the _server route, and the value provided
      // here will be used in the server.html template as the loop count variable
      // to determine how many server forms should be made. (IE if the user types
      // 5 in Number of Servers it will be transfered as the variable server_count)
      // here.
      $.get("{{ url_for('_server') }}", { server_count: $( 'input[name={{ form.number_of_servers.field_id }}]' ).val() }, function(data){
        // The hide method is here because effects only work if the element
        // begins in a hidden state
        $( "#server_accordion" ).html(data).hide().slideDown("slow");
      });
    }
    $( "#{{ form.number_of_servers.form_name }}" ).addClass('was-validated');
  });

  // Sensors events: this function handles when a user presses submit on the
  // number of sensors button. See the function above for an explanation of the
  // different parts.
  $('#{{ form.number_of_sensors.button_id }}').click(function (event) {
    if ($( "#{{ form.number_of_sensors.form_name }}" )[0].checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      alert("HERE")
    } else {
      $.get("{{ url_for('_server') }}", { server_count: $( 'input[name={{ form.number_of_sensors.field_id }}]' ).val() }, function(data){
        $( "#server_accordion" ).html(data).hide().slideDown("slow");
      });
    }
    $( "#{{ form.number_of_sensors.form_name }}" ).addClass('was-validated');
  });
});
