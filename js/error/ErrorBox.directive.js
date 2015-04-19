/*
 * error message directive
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
osErrorModule.directive(
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
                 templateUrl : "/js/error/ErrorBox.directive.html"
             };
         }
         ]
);
