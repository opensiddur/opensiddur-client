/* 
 * Controller for nav bar 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'NavbarCtrl',
  ['$scope', '$route', '$location', '$routeParams', 
  function ($scope, $route, $location, $routeParams) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    $scope.isActive = function( loc ) {
        return $location.path().indexOf(loc) == 0;
    };
  }]
);
