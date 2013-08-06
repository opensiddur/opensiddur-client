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
          $scope.errorMessage = "";
          AuthenticationService.authenticate(
                $scope.userName, $scope.currentPassword,
                function(data, status, headers, config) {
                    $http.post(
                            host + "/api/user",  
                            "<change-password><user>"+ $scope.userName + 
                            "</user><password>"+$scope.newPassword+
                            "</password></change-password>")
                            .success(
                                    function(data, status, headers, config) {
                                        $scope.successMessage = "Password changed";
                                    }
                            )
                            .error(
                                    function(data, status, headers, config) {
                                        $scope.errorMessage = getApiError(data);
                                    }
                            );    
                },
                function(data, status, headers, config) {
                    $scope.errorMessage = getApiError(data);
                }
          );
      };
  }]
);
