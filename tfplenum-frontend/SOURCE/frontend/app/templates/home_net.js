
// We need to increment the home net count because we have just added another
home_net_count += 1;

$.get("{{ url_for('_render_home_net') }}", { home_net_count: home_net_count}, function(data){

  // This line gets the HTML inside the template field in sensor.html and then
  // appends it to the div for home net.
  $( "#{{ form.home_net.field_id + '_div' }}" ).append( data );

});
