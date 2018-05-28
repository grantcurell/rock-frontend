$.validator.setDefaults( {
	submitHandler: function () {
		alert( "submitted!" );
	}
} );

$( document ).ready( function () {
	$( "#form_sensor" ).validate( {
		rules: {
			number_of_sensors: {
				required: true,
				minlength: 2
			},
		},
		messages: {
			number_of_sensors: {
				minlength: "Your username must consist of at least 2 characters"
			},
		},
		errorElement: "div",
		errorPlacement: function ( error, element ) {
			// Add the `help-block` class to the error element
			error.addClass( "invalid-feedback" );

			if ( element.prop( "type" ) === "checkbox" ) {
				error.insertAfter( element.parent( "label" ) );
			} else {
        // input-group-append is the class for the button we are appending
				error.insertAfter( element.next( $(".input-group-append") ));
			}
		},
		highlight: function ( element, errorClass, validClass ) {
			$( element ).parents( ".col-sm-5" ).addClass( "has-error" ).removeClass( "has-success" );
		},
		unhighlight: function (element, errorClass, validClass) {
			$( element ).parents( ".col-sm-5" ).addClass( "has-success" ).removeClass( "has-error" );
		}
	} );
} );
