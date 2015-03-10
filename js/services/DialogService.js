/*
 * common shared dialog functions
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.service( 
    'DialogService', 
    [
    function( ) {
        return {
            open : function(dialog) {
                $("#"+dialog).modal({
                    backdrop: "static"  // prevent dialog from closing when click outside the area
                });
            }
        };
    }
    ]
);



