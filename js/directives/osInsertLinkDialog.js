/* Insert link dialog
 *
 * Usage:
 * <os-insert-link-dialog on-ok="" on-close="" title="" name=""/>
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osInsertLinkDialog',
        [
        'RestApi', 'ErrorService',
        function( RestApi, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In insert link dialog controller");

                    $scope.links = {
                        selectedType : "/api/data/original",
                        types : {
                            "/api/data/notes" : "Annotations",
                            "/api/user" : "Contributor",
                            "/api/data/original" : "Original text",
                            "/api/data/sources" : "Source",
                            "/api/data/conditionals" : "Conditional"
                        },
                        selection : "",
                        selectedFile : "",
                        selectFile : function () {
                            this.selectedFile = this.selection.replace(/^\/exist\/restxq\/api/, '');
                        }
                    };                    

                    $scope.OKButton = function () {
                        $scope.onOk()($scope.links.selectedFile);
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Insert Link";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h3").attr("id", scope.name + "_label");
                    elem.find(".osInsertLinkDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osInsertLinkDialog").attr("id", scope.name);

                 },
                 transclude : false,
                 templateUrl : "/js/directives/osInsertLinkDialog.html"
             };
        }
        ]
);


