/* controller for login status widget 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
*/
OpenSiddurClientApp.controller(
  'AuthenticationWidgetCtrl',
  ['$scope', '$location', 'AuthenticationService',
  function ($scope, $location, AuthenticationService) {
      who = AuthenticationService.whoami();
      $scope.loggedIn = Boolean(who.userName);
      $scope.userName = who.userName;
    
      $scope.signout = function() {
          AuthenticationService.logout();
          $location.path('/signin');
      }

      $scope.$on('AuthenticationService.update', 
          function( event, loggedIn, userName, password ) {
              $scope.loggedIn = loggedIn;
              $scope.userName = userName;
          }
      );
  }]
);
