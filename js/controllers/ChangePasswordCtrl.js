/* 
 * Change password control
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* controller for signin and registration page */
OpenSiddurClientApp.controller(
  'ChangePasswordCtrl', 
  ['$scope', 'AuthenticationService', 'ErrorService', 
  function ($scope, AuthenticationService, ErrorService){
      $scope.currentPassword = "";
      $scope.newPassword = "";
      $scope.repeatPassword = "";
    
      $scope.changePassword = function() {
            AuthenticationService.changePassword($scope.currentPassword, $scope.newPassword)
            .success(function() {
                ErrorService.addAlert("Password changed", "success");
            })
            .error(function(data) {
                ErrorService.addApiError(data);
            });    
        };
  }]
);
