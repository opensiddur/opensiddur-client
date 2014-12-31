/* 
 * Controller for signin and registration page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.controller(
  'AuthenticationCtrl', 
  ['$scope', '$location', 'AuthenticationService', 'ErrorService',
  function ($scope, $location, AuthenticationService, ErrorService){
    //$http.defaults.useXDomain = true;
    
    $scope.signin = {
            userName : AuthenticationService.userName,
            password : AuthenticationService.password,
            rememberMe : AuthenticationService.loggedIn
    };
    $scope.register = angular.copy($scope.signin);
    $scope.register.repeatPassword = "";
    
    $scope.signin = function() {
        console.log("login")

        AuthenticationService.authenticate($scope.signin.userName, $scope.signin.password)
        .success(function() {
            AuthenticationService.login($scope.signin.userName, $scope.signin.password, $scope.signin.rememberMe);
            $location.path("/about");
        })
        .error(function(data) {
            ErrorService.addApiError(data);
        });
    };
    $scope.register = function() {
        console.log("register");
        AuthenticationService.register($scope.register.userName, $scope.register.password, $scope.register.rememberMe)
        .success(
            function() {
                $location.path("/profile/" + $scope.register.userName)
            })
        .error(function(data) {
            ErrorService.addApiError(data);
        });
    };
    $scope.signout = function() {
        console.log("sign out");
        AuthenticationService.logout();
    }; 
  }]
);
