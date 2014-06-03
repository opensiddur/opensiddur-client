/* 
 * Controller for signin and registration page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.controller(
  'AuthenticationCtrl', 
  ['$scope', '$http', '$location', 'AuthenticationService', 'ErrorService',
  function ($scope, $http, $location, AuthenticationService, ErrorService){
    $http.defaults.useXDomain = true;
    
    who = AuthenticationService.whoami();
    $scope.loggedIn = Boolean(who.userName);
    
    $scope.signin = {
            userName : who.userName,
            password : who.password,
            rememberMe : $scope.loggedIn,
    };
    $scope.register = $scope.signin;
    $scope.register.repeatPassword = "";
    
    $scope.signin = function() {
        console.log("login")

        AuthenticationService.authenticate(
                $scope.signin.userName, $scope.signin.password,
                function(data, status, headers, config) {
                    AuthenticationService.login($scope.signin.userName, $scope.signin.password, $scope.signin.rememberMe);
                    $location.path("/about");
                },
                function(data, status, headers, config) {
                    ErrorService.addApiError(data);
                }
        );
      
    };
    $scope.register = function() {

        console.log("register")
        $http.post(
            host + "/api/user",  
            "<register><user>"+ $scope.register.userName + 
            "</user><password>"+$scope.register.password+
            "</password></register>")
            .success(
                    function(data, status, headers, config) {
                        AuthenticationService.login($scope.register.userName, $scope.register.password, $scope.register.rememberMe);
                        $scope.loggedIn = true;
                        $location.path("/profile/" + $scope.register.userName)
                    }
            )
            .error(
                    function(data, status, headers, config) {
                        ErrorService.addApiError(data);
                    }
            );
    
    };
    $scope.signout = function() {
        console.log("sign out");
        AuthenticationService.logout();
    };
    $scope.$on('AuthenticationService.update', 
        function( event, loggedIn, userName, password ) {
            $scope.loggedIn = loggedIn;
            $scope.signin.userName = userName;
            $scope.signin.password = password;
        }
    );
    
  }
  ]
);
