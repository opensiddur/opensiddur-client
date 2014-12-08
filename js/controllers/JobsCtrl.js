/* 
 * controller for jobs listing page
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'JobsCtrl',
  ['$scope', '$routeParams', 'RestApi', 'ErrorService', 
  function ($scope, $routeParams, RestApi, ErrorService) {
    console.log("Jobs controller for ", $routeParams.userName);
    $scope.jobs = [];    
    $scope.params = {
        user : $routeParams.userName,
        state : "",
        from : "",
        to : "",
        start : 1,
        "max-results" : 100
    };
    RestApi["/api/jobs"].listJSON($scope.params,
        function (data) {
            $scope.jobs = data;
        },
        function (error) {
            ErrorService.addApiError(error.data);
        }
    );
  }]
);
