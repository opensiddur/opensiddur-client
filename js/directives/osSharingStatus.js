/*
 * sharing status directive
 *
 * Usage:
 * <os-sharing-status access-model="" sharing-dialog="" 
 *  chmod-disabled="true|false" relicense-disabled="true|false"/>
 *
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.directive(
        'osSharingStatus',
        [
         function() {
             return {
                restrict : 'AE',
                scope : {
                    accessModel : "=",
                    chmodDisabled : "@",
                    relicenseDisabled : "@",
                    sharingDialog : "@"
                },
                 controller: ['$scope', 'DialogService', function ($scope, DialogService) {
                    $scope.DialogService = DialogService;
                    if ($scope.chmodDisabled == undefined) {
                        $scope.chmodDisabled = false; 
                    };
                    if ($scope.relicenseDisabled == undefined) {
                        $scope.relicenseDisable = false;
                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/directives/osSharingStatus.html"
             };
         }
         ]
);

