/* 
 * Recent changes control
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osRecentChangesModule.controller(
  'RecentChangesCtrl', 
  ['$scope', '$http', '$location', '$routeParams', 'ErrorService', 'RecentChangesService', 
  function ($scope, $http, $location, $routeParams, ErrorService, RecentChangesService){
    console.log("Recent changes controller");
    $scope.searchParams = RecentChangesService.params();
    $scope.searchParams.by = $routeParams.userName;

    $scope.load = function() {
        RecentChangesService.load($scope.searchParams)
        .then(
            function(json) {
                $scope.changes = json;
            },
            function(error) {
                ErrorService.addApiError(error);
            });
    };

    $scope.load();
  }]
);

