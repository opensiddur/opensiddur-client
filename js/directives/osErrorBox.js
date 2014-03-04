/*
 * error message directive
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.directive(
        'osErrorBox',
        [
         function() {
             return {
                 restrict : 'AE',
                 controller: ['$scope', 'ErrorService', function ($scope, ErrorService) {
                     $scope.messages = ErrorService.messages;
                     $scope.closeAlert = ErrorService.closeAlert;
                 }],
                 transclude : false,
                 templateUrl : "/js/directives/osErrorBox.html"
             };
         }
         ]
);
