/*
 * error message service
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.service( 
    'ErrorService', 
    [
    function( ) {
        return {
            messages : [],
            addApiError : function ( message ) {
                this.addAlert( $( $.parseXML( message ) ).find( "message" ).text(), "error");
            },
            addAlert : function( message, level ) {
                this.messages.push( { 'message' : message, 'level' : level } );
            },
            closeAlert : function ( num ) {
                this.messages.splice( num, 1 );
            }
        };
    }
    ]
);



