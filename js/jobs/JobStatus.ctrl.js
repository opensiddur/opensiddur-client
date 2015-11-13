/* 
 * controller for job status page 
 * The job status page is used to show (statically) the status of a given job.
 *
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osJobsModule.controller(
  'JobStatusCtrl',
  ['$scope', '$location', '$routeParams', '$timeout', 'ErrorService', 'JobsService',
  function ($scope, $location, $routeParams, $timeout, ErrorService, JobsService) {
    console.log("Compile controller.");

    getStatus = function() {
        return JobsService.getJSON($scope.jobid) 
        .then(function (stat) { 
            $scope.status = stat;
            $scope.resource = decodeURIComponent(stat.resource.split("/").pop());
            if (stat.state != "complete") {
                // check status again in another second...
                $timeout(getStatus, 1000);
            }
        }, function (error) { 
            ErrorService.addApiError(error); 
        });
    };

    $scope.jobid = $routeParams.jobid;
    $scope.resource = "";
    $scope.status = {};

    getStatus();
  }]
);
