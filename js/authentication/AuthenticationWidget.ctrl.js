/* controller for login status widget 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
*/
osAuthenticationModule.controller(
  'AuthenticationWidgetCtrl',
  ['$scope', '$location', 'AuthenticationService',
  function ($scope, $location, AuthenticationService) {
    $scope.AuthenticationService = AuthenticationService;
    $scope.signout = function() {
        AuthenticationService.logout();
        $location.path('/signin');
    }
  }]
);
