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
                controller: ['$scope', 'RestApi', function ($scope, RestApi) {
                    console.log("In insert link dialog controller");

                    $scope.typesWithAllowedRanges = ["/api/data/original"];
                    $scope.typesWithAllowedFragments = [
                            "/api/data/notes",
                            "/api/data/original",
                            "/api/data/conditionals"
                    ];


                    $scope.links = {
                        selectedType : "/api/data/original",
                        types : {
                            "/api/data/notes" : "Annotations",
                            "/api/user" : "Contributor",
                            "/api/data/original" : "Original text",
                            "/api/data/sources" : "Source",
                            "/api/data/conditionals" : "Conditional"
                        },
                        content : "",
                        selection : "",
                        selectedFile : "",
                        composedFragment : "",
                        allowedFragment : false,    // set by a watch on selectedType
                        allowedRange : false,       // set by a watch on selectedType
                        selectFile : function () {
                            // set the selected file
                            this.selectedFile = this.selection.replace(/^\/exist\/restxq\/api/, '');
                            // if a fragment is allowed, load the content
                            if ($scope.typesWithAllowedFragments.indexOf(this.selectedType) >= 0) {
                                RestApi[this.selectedType].get(
                                    { resource : decodeURI(this.selection.replace("\/exist\/restxq" + this.selectedType + "/", "")) },  // TODO: need to standardize when URIs are encoded!
                                    function(content) {
                                        $scope.links.content = content.xml;
                                    } );
                            } 
                            this.composeLink();
                        },
                        composeLink : function() {
                            this.composedLink = this.selectedFile + (this.composedFragment || "");
                            return this.composedLink;
                        }
                    };                    

                    $scope.OKButton = function () {
                        $scope.links.composeLink();
                        $scope.onOk()($scope.links.composedLink);
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


                    scope.$watch("links.selectedType", function (type) {
                        scope.allowedRange = scope.typesWithAllowedRanges.indexOf(type) >= 0;
                        scope.allowedFragment = scope.typesWithAllowedFragments.indexOf(type) >= 0;
                    });
                    scope.$watch("links.composedFragment", function (fragment) {
                        scope.links.composeLink();
                    });

                 },
                 transclude : false,
                 templateUrl : "/js/directives/osInsertLinkDialog.html"
             };
        }
        ]
);


