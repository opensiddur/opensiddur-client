/* 
 * controller for outlines page 
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osOutlinesModule.controller(
  'OutlinesCtrl',
  ['$scope', '$location', '$routeParams', 'AuthenticationService', 'ErrorService',
  function ($scope, $location, $routeParams, AuthenticationService, ErrorService) {
    console.log("Outlines controller.");

    $scope.AuthenticationService = AuthenticationService;
    $scope.resource = $routeParams.resource;
    $scope.title = "Temp";

    $scope.editor = {
      newButton : function() { console.log("New");},
      openDocument : function() { console.log("open"); },
      saveDocument : function() { console.log("save"); },
      dialogCancel : function() { }
    };

    $scope.saveButtonText = function() {
      return "Save";
    };
    console.log("resource=", $scope.resource);
  }]
);
