/* index page controller
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'IndexCtrl',
  ['$scope', 'IndexService', 
  function ($scope, IndexService) {
    console.log("Index controller.");

    $scope.search = IndexService.search;
  }]
);

