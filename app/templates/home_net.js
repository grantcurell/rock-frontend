if (home_net_count > 1){
    $( "#{{ object.form_name }}_outer_div" ).remove();
    home_net_count -= 1;

    validate_all();
    return;
}