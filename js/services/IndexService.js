/* index page service
 * maintains some global state
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service( 
    'IndexService', 
    [
    function( ) {
        return {
            search : {
                api : "",               // which API to search
                collapsed : false,       // search bar collapsed or shown
                selection : ""          // current search selection
            }
        };
    }
    ]
);




