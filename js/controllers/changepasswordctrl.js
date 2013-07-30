/* 
 * Change password control
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* controller for signin and registration page */
OpenSiddurClientApp.controller(
  'ChangePasswordCtrl', 
  ['$scope', '$http', '$location', 'AuthenticationService',
  function ($scope, $http, $location, AuthenticationService){
      who = AuthenticationService.whoami();
      $scope.userName = who.userName; 
      $scope.realCurrentPassword = who.password;
      $scope.currentPassword = "";
      $scope.newPassword = "";
      $scope.repeatPassword = "";
      $scope.errorMessage = "";
      $scope.successMessage = "";
    
      $scope.changePassword = function() {
        $scope.successMessage = "";
        AuthenticationService.login($scope.userName, $scope.currentPassword);
        $http.post(
            host + "/api/user",  
            "<change-password><user>"+ $scope.userName + 
            "</user><password>"+$scope.newPassword+
            "</password></change-password>",
            {
                  headers: {
                    "Content-Type" : "application/xml"
                  }
            })
            .success(
                function(data, status, headers, config) {
                  AuthenticationService.login($scope.userName, $scope.newPassword);
                  $scope.successMessage = "Password changed";
                  $scope.errorMessage = "";
                }
            )
            .error(
                function(data, status, headers, config) {
                    AuthenticationService.login($scope.userName, $scope.realCurrentPassword);
                    $scope.successMessage = "";
                    $scope.errorMessage = getApiError(data);
                }
            );
          
      
      };
  }]
);
