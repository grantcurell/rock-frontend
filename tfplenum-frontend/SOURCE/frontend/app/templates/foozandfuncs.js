/*
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    // See https://stackoverflow.com/questions/32922445/js-array-prototype-filter-call-can-someone-explain-me-how-this-piece-of-code
    // for a nice explanation of what's going on here. I just modified the bootstrap
    // code here: https://getbootstrap.com/docs/4.1/components/forms/#custom-styles
    var validation = Array.prototype.filter.call(forms, function(form) {
      $('#{{ form.number_of_servers.button_id }}').on('click', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      })
    });
  }, false);
})();
*/

$( document ).ready(function() {
  // See: https://api.jquery.com/click/
  $('#{{ form.number_of_servers.button_id }}').click(function (event) {
    // Using [0] here because when you use $( "#form_servers" ) you get a jQuery
    // selection set. To access the DOM properties you have to select the first
    // item. checkValidity is an HTML5 built in function we are calling against
    // the element.
    if ($( "#form_servers" )[0].checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    $( "#form_servers" ).addClass('was-validated');
  });
});
