/* GetAny service
    Gets the raw data from any API.
    Use this only if there is no other better option.

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later

*/
osGetAnyModule.factory("GetAnyService", [
    "$http", "$q", 
    function($http, $q) {
    return {
        get : function (api, resource) {
            return $http.get(api + "/" + encodeURIComponent(resource))
                .then(
                    function(response) {
                        return response.data
                    },
                    function (error) {
                        return $q.reject(error.data);
                    }
                );
        }
    };
}]);
