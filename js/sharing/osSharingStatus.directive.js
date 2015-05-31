/*
 * sharing status directive
 *
 * Usage:
 * <os-sharing-status sharing-dialog="" />
 *
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
osSharingModule.directive(
        'osSharingStatus',
        ["AccessService",
         function(AccessService) {
             return {
                restrict : 'AE',
                scope : {
                    sharingDialog : "@",
                    chmodDisabled : "@",
                    relicenseDisabled : "@"
                },
                 controller: ['$scope', 'DialogService', function ($scope, DialogService) {
                    $scope.DialogService = DialogService;
                    $scope.AccessService = AccessService;
                 }],
                 transclude : false,
                 templateUrl : "/js/sharing/osSharingStatus.directive.html"
             };
         }
         ]
);

