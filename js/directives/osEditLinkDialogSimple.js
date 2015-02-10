/* edit link dialog for simple editor
 *
 * Usage:
 * <os-edit-link-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editLinkDialog" in EditorDataService
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osEditLinkDialogSimple',
        [
        'EditorDataService', 'ListingService', 'ErrorService',
        function( EditorDataService, ListingService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', 'ListingService', function ($scope, ListingService) {
                    console.log("In edit link dialog (simple) controller");
/*
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
                            var newSelection =  this.selection.replace(/^\/exist\/restxq\/api/, '');

                            if (this.selectedFile != newSelection) { // reset the content
                                this.content = "";
                                this.composedFragment = "";
                            }
                            // set the selected file
                            this.selectedFile = newSelection;                            
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
*/
                    $scope.OKButton = function () {
                        $scope.link.callback();
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Link Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditLinkDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditLinkDialogSimple").attr("id", scope.name);

/*
                    scope.$watch("links.selectedType", function (type) {
                        scope.allowedRange = scope.typesWithAllowedRanges.indexOf(type) >= 0;
                        scope.allowedFragment = scope.typesWithAllowedFragments.indexOf(type) >= 0;
                        if (type != scope.links.selectedType) {
                            scope.links.selection = "";
                        }
                    });
                    scope.$watch("links.selection", function (s) {
                        if (s == "") {
                            scope.links.content = "";
                            scope.links.selectedFile = "";                            
                            scope.links.composedFragment = "";
                            scope.links.composeLink();
                        }
                    });
                    scope.$watch("links.composedFragment", function (fragment) {
                        scope.links.composeLink();
                    });
*/
                    elem.on("shown.bs.modal", function () {
                        scope.link = EditorDataService.editLinkDialog;
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osEditLinkDialogSimple.html"
             };
        }
        ]
);


