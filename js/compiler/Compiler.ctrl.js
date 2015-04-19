/* 
 * controller for compile page 
 * The compile page is used to compile a single document in the background and display its status
 * If the page is called as /compile/<resource>, it will initiate the compilation, display the status, 
 * then when the document has finished compiling, redirect to /compiled/<resource>. 
 *
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osCompilerModule.controller(
  'CompileCtrl',
  ['$scope', '$location', '$routeParams', '$timeout', 'ErrorService', 'JobsService',
  function ($scope, $location, $routeParams, $timeout, ErrorService, JobsService) {
    console.log("Compile controller.");

    getStatus = function() {
        JobsService.getJSON($scope.compilation.job)
        .success(function (stat) { 
            $scope.status = stat;
            if (stat.state == "complete") {
                console.log("Complete. Now redirect to /compiled/" + $scope.resource);
                $location.path("/compiled/" + $scope.resource);
            }
            else if (stat.state == "failed") {
                console.log("Compile failed");
            }
            else {
                // check status again in another second...
                $timeout(getStatus, 1000);
            }
        })
        .error(
            function (data) { 
                ErrorService.addApiError(data); 
            }
        );
    };

    $scope.resource = $routeParams.resource;
    $scope.status = {};

    JobsService.start($scope.resource)
    .success(
        function (data, httpStatus, headers) { 
            $scope.compilation = { job : headers("Location").replace("/exist/restxq/api/jobs/", "") }; // TODO: jobservice.start transform response is never called 
            getStatus(); 
        })
    .error(function(data) { 
        ErrorService.addApiError(data); 
    });
  }]
);
