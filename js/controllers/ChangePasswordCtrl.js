/* 
 * Change password control
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* controller for signin and registration page */
OpenSiddurClientApp.controller(
  'ChangePasswordCtrl', 
  ['$scope', '$http', '$location', 'AuthenticationService', 'ErrorService', 'IndexService',
  function ($scope, $http, $location, AuthenticationService, ErrorService, IndexService){
      // turn off the index search service
      IndexService.search.collapsed = true;
      IndexService.search.api = "";

      who = AuthenticationService.whoami();
      $scope.userName = who.userName; 
      $scope.realCurrentPassword = who.password;
      $scope.currentPassword = "";
      $scope.newPassword = "";
      $scope.repeatPassword = "";
    
      $scope.changePassword = function() {
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
                                        ErrorService.addAlert("Password changed", "success");
                                    }
                            )
                            .error(
                                    function(data, status, headers, config) {
                                        ErrorService.addApiError(data);
                                    }
                            );    
                },
                function(data, status, headers, config) {
                    ErrorService.addApiError(data);
                }
          );
      };
  }]
);
