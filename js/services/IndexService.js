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
                expand : function() { this.collapsed = false; },
                collapse : function() { this.collapsed = true; },
                disable : function() {
                    this.api = "";
                    this.collapsed = true;
                    this.selection = "";
                },
                enable : function( api ) {
                    this.api = api;
                    this.collapsed = false;
                    this.selection = "";
                },
                addResult : function ( result ) {   // manually add a result
                    searchScope = angular.element(".osSearchList").scope();
                    searchScope.results = searchScope.results.concat(result);
                },
                api : "",               // which API to search
                collapsed : false,       // search bar collapsed or shown
                selection : ""          // current search selection
            }
        };
    }
    ]
);




