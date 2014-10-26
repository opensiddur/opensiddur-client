/* 
 * Recent changes control
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'RecentChangesCtrl', 
  ['$scope', '$http', '$location', '$routeParams', 'ErrorService', 'RestApi', 
  function ($scope, $http, $location, $routeParams, ErrorService, RestApi){
    console.log("Recent changes controller");
    $scope.searchParams = {
        by : $routeParams.userName,
        'max-results' : 100
    };

    editingLinks = {
        "original" : "texts",
        "sources" : "sources",
        "styles" : "styles",
        "users" : "contributors",
        "notes" : "annotations",
        "linkage" : "translations",
        "conditionals" : "conditionals"  
    };

    $scope.load = function() {
        RestApi["/api/changes"].getJSON(
            $scope.searchParams, 
            function(json) {
            $scope.changes = $.map(json, function(result) {
                var sp = result.api.replace("/exist/restxq/api/data/", "").split("/");
                result.editLink = "/" + editingLinks[sp[0]] + "/" + sp[1];
                return result; }
            );
            return $scope.changes;
        }, function(error) {
            ErrorService.addApiError(error);
        });
    };

    $scope.load();
  }]
);

