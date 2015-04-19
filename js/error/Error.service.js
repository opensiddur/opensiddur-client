/*
 * error message service
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
osErrorModule.service( 
    'ErrorService', 
    [
    function( ) {
        return {
            messages : [],
            addApiError : function ( message ) {
                this.addAlert(
                    $.makeArray( 
                        $( "message", $.parseXML( message ) ).map(
                            function( i, x ) { return $(x).text().trim(); }
                        )
                    ).join("<br/>"), "error");
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



