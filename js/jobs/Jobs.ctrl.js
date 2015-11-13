/* 
 * controller for jobs listing page
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osJobsModule.controller(
  'JobsCtrl',
  ['$scope', '$routeParams', 'JobsService', 'ErrorService', 
  function ($scope, $routeParams, JobsService, ErrorService) {
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
    JobsService.listJSON($scope.params.user, $scope.params.state, 
                        $scope.params.from, $scope.params.to, 
                        $scope.params.start, $scope.params["max-results"])
    .then(
        function (data) {
            $scope.jobs = data;
        },
        function (error) {
            ErrorService.addApiError(error);
        });
  }]
);
