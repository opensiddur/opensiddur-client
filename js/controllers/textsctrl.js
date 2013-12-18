/* 
 * controller for texts page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$http', 'XsltService', 'AuthenticationService',
    function ($scope, $http, XsltService, AuthenticationService) {
        console.log("Texts controller. Nothing to do here");
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : null,
            isNew : 0,
            newDocument : function() {
                console.log("Start a new document");
            }
        };
        $scope.saveButtonText = function() {
            return this.textsForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };
    }]
);
