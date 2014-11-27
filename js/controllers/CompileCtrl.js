/* 
 * controller for compile page 
 * The compile page is used to compile a single document in the background and display its status
 * If the page is called as /compile/<resource>, it will initiate the compilation, display the status, 
 * then when the document has finished compiling, redirect to /compiled/<resource>. 
 *
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'CompileCtrl',
  ['$scope', '$location', '$routeParams', '$timeout', 'ErrorService', 'RestApi',
  function ($scope, $location, $routeParams, $timeout, ErrorService, RestApi) {
    console.log("Compile controller.");

    getStatus = function() {
        RestApi["/api/jobs"].getJSON({"job" : $scope.compilation.job}, 
            function (stat) { 
                $scope.status = stat;
                if (stat.state == "complete") {
                    console.log("Complete. Now redirect to /compiled/" + $scope.resource);
                }
                else if (stat.state == "failed") {
                    console.log("Compile failed");
                }
                else {
                    // check status again in another second...
                    $timeout(getStatus, 1000);
                }
            },
            function (data) { ErrorService.addApiError(data); }
        )
    };

    $scope.resource = $routeParams.resource;
    $scope.status = {};

    RestApi["/api/data/original"].backgroundCompile({"resource" : $scope.resource}, "",
        function (data) { $scope.compilation = data; getStatus(); },
        function(data) { ErrorService.addApiError(data); }
    ) ;
  }]
);
