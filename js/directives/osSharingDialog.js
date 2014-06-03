/* Sharing dialog
 *
 * Usage:
 * <os-sharing-dialog api="" access-model="" current-document="" is-new="" title="" name=""/>
 * name is an id, title is the header text
 *
 * Copyright 2013-2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osSharingDialog',
        [
        'RestApi', 'ErrorService',
        function( RestApi, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    api : "=",
                    accessModel : "=",
                    currentDocument : "=",
                    isNew : "=",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In sharing dialog controller");
                    $scope.setAccessType = function() {
                        this.accessType = (this.isNew) ? "public" : (
                            (this.accessModel.group == "everyone" && this.accessModel.groupWrite) ? "public" : "restricted"
                        );
                    };
                    $scope.setAccessType();
                    $scope.saveAccessModel = function() {
                        if (this.accessModel.chmod && !this.isNew) {
                            if (this.accessType == "public") {
                                this.accessModel.groupWrite = true;
                                this.accessModel.group = "everyone";
                            }
                            else {  // restricted
                                this.accessModel.groupWrite = false;
                                this.accessModel.group = "everyone";
                            }
                            RestApi[this.api].setAccess({
                                    "resource" : this.currentDocument
                                }, this.accessModel, 
                                function() {}, 
                                function( data ) { 
                                    ErrorService.addApiError(data);
                                }
                            );
                        }
                    }; 
                    if (!$scope.title) {
                        $scope.title = "Sharing";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h3").attr("id", scope.name + "_label");
                    elem.find(".osSharingDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osSharingDialog").attr("id", scope.name);

                 },
                 transclude : false,
                 templateUrl : "/js/directives/osSharingDialog.html"
             };
        }
        ]
);


