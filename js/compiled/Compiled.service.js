/* 
 * Compiled data service 
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osCompiledModule.factory(
    "CompiledService",
    ["$http", function($http) {
    return {
        get : function(resource) {
            return $http.get("/api/data/original/" + encodeURIComponent(resource) + "/combined",
                {
                    params : {
                        transclude : true
                    },
                    headers : {
                        "Accept" : "application/xhtml+xml"
                    }
                });
        }
    } 
}]);

