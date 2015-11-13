/* 
 * Change password control
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* controller for signin and registration page */
osAuthenticationModule.controller(
  'ChangePasswordCtrl', 
  ['$scope', 'AuthenticationService', 'ErrorService', 
  function ($scope, AuthenticationService, ErrorService){
      $scope.currentPassword = "";
      $scope.newPassword = "";
      $scope.repeatPassword = "";
    
      $scope.changePassword = function() {
            AuthenticationService.changePassword($scope.currentPassword, $scope.newPassword)
            .then(function() {
                ErrorService.addAlert("Password changed", "success");
            },
            function(error) {
                ErrorService.addApiError(error);
            });    
        };
  }]
);
