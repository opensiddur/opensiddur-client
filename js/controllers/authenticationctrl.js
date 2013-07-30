/* 
 * Controller for signin and registration page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.controller(
  'AuthenticationCtrl', 
  ['$scope', '$http', '$location', 'AuthenticationService',
  function ($scope, $http, $location, AuthenticationService){
    $http.defaults.useXDomain = true;
    
    $scope.loggedIn = false;
    $scope.userName = "";
    $scope.password = "";
    $scope.errorMessage = "";
    
    $scope.signin = function() {
      console.log("login")
      
      $http.post(
        host + "/api/login",  
        "<login><user>"+ $scope.userName + 
        "</user><password>"+$scope.password+
        "</password></login>")
        .success(
            function(data, status, headers, config) {
              AuthenticationService.login($scope.userName, $scope.password);
              $scope.errorMessage = "";
              $scope.loggedIn = true;
              $location.path("/about")
            }
        )
        .error(
            function(data, status, headers, config) {
              $scope.errorMessage = getApiError(data);
            }
        );
      
      
    };
    $scope.register = function() {
      console.log("register")
      $http.post(
        host + "/api/user",  
        "<register><user>"+ $scope.userName + 
        "</user><password>"+$scope.password+
        "</password></register>")
        .success(
            function(data, status, headers, config) {
              AuthenticationService.login($scope.userName, $scope.password);
              $scope.errorMessage = "";
              $scope.loggedIn = true;
              $location.path("/profile/" + $scope.userName)
            }
        )
        .error(
            function(data, status, headers, config) {
              $scope.errorMessage = getApiError(data);
            }
        );
    
    };
    $scope.signout = function() {
      console.log("sign out");
      $http.post(host + "/api/logout", 
              "<logout/>"
      );
      $scope.loggedIn = false;
      AuthenticationService.logout();
    };
    $scope.$on('AuthenticationService.update', 
      function( event, loggedIn, userName, password ) {
        $scope.loggedIn = loggedIn;
        $scope.userName = userName;
        $scope.password = password;
      }
    );
    
  }
  ]
);
