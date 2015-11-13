/* 
 * Compiled data service 
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osCompiledModule.factory(
    "CompiledService",
    ["$http", "$q",
    function($http, $q) {
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
                })
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(error) {
                        return $q.reject(error.data);
                    }
                );
        }
    } 
}]);

