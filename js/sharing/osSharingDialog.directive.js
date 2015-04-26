/* Sharing dialog
 *
 * Usage:
 * <os-sharing-dialog title="" name="" is-new=""/>
 * name is an id, title is the header text
 *
 * Copyright 2013-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osSharingModule.directive(
        'osSharingDialog',
        [
        'AccessService', 'ErrorService',
        function( AccessService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    name : "@",
                    title : "@",
                    isNew : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In sharing dialog controller");
                    $scope.AccessService = AccessService;
                    $scope.saveAccessModel = function() {
                        var am = AccessService.simpleAccessModel($scope.accessType);
                        if (!$scope.isNew) {
                            am.save()
                            .error(function( data ) { 
                                ErrorService.addApiError(data);
                            });
                        }
                    };
                    
                    if (!$scope.title) {
                        $scope.title = "Sharing";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osSharingDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osSharingDialog").attr("id", scope.name);
                    elem.on("shown.bs.modal", function() {
                        scope.accessType = AccessService.simpleAccessModel();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/sharing/osSharingDialog.directive.html"
             };
        }
        ]
);


