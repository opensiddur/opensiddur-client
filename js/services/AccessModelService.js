/*
 * shared storage of default access models 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.service( 
    'AccessModelService', 
    [
    function( ) {
        return {
            "default" : function(userName) {
                // default access model, dependent on login state (userName == "" or undefined for not logged in)
                return {
                    owner : userName,
                    group : "everyone",
                    worldRead : true,
                    worldWrite : false,
                    read : true,
                    write : Boolean(userName),
                    relicense : Boolean(userName),
                    chmod : Boolean(userName),
                    grantGroups : [],
                    grantUsers :[],
                    denyGroups : [],
                    denyUsers : []

                } 
            }
        };
    }
    ]
);



