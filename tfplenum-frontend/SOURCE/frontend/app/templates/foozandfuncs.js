$.validator.setDefaults( {
	submitHandler: function () {
		alert( "submitted!" );
	}
} );

$( document ).ready( function () {
	$( "#form_sensor" ).validate( {
		rules: {
			{{ form.number_of_sensors.id }}: {
				required: true
			},
		},
		messages: {
			{{ form.number_of_sensors.id }}: {
				minlength: "Your username must consist of at least 2 characters"
			},
		},
		errorElement: "div",
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "invalid-feedback" );
		  error.insertAfter( element.next( $(".input-group-append") ));
		},
		highlight: function ( element, errorClass, validClass ) {
			$( element ).parents( $( ".input-group mb-3" ) ).addClass( "has-error" ).removeClass( "has-success" );
		},
		unhighlight: function (element, errorClass, validClass) {
			$( element ).parents( $( ".input-group mb-3" ) ).addClass( "has-success" ).removeClass( "has-error" );
		}
	} );
} );
