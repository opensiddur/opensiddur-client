/* Access API service
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service(
    'AccessService',
    ['$http',
    function( $http ) {
        svc = {
            // find the access privileges for the current user to api
            // return a promise to an object: { owner, group, read, write, repermission, relicense }
            get : function(api) {
                return $http.get(api + "/access").then(
                    function(response) {
                        js = x2js.xml_str2json(response.data);
                        return {
                            owner : js.access.owner.__text,
                            group : js.access.group.__text,
                            read : js.access.you._read == "true",
                            write : js.access.you._write == "true",
                            relicense : js.access.you._relicense == "true",
                            chmod : js.access.you._chmod == "true"
                        };
                    },
                    function(response) {
                        console.log("Access call failed:", response.data);
                        return {
                            owner : null,
                            group : null,
                            read : null,
                            write : null,
                            relicense : null,
                            chmod : null
                        };
                    }
                )
            }
        };
        return svc;
    }]
);
