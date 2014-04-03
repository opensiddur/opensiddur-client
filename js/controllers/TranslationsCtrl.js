/* 
 * controller for translations page 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TranslationsCtrl',
    ['$scope', '$location', '$route', '$routeParams', 'AuthenticationService', 'ErrorService', 'IndexService', 
    function($scope, $location, $route, $routeParams, AuthenticationService, ErrorService, IndexService) {
        console.log("translations controller");
        IndexService.search.enable( "/api/data/linkage" );
        if ($routeParams.resource) {
            IndexService.search.collapse();
        }
        $scope.search = IndexService.search;
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : $routeParams.resource,
            // TODO: this is copied verbatim from TextsCtrl... need some serious refactoring
            access : {},
            accessModel : "public",
            setAccessModel : function() {
                this.accessModel = (this.isNew) ? "public" : (
                    (this.access.group == "everyone" && this.access.groupWrite) ? "public" : "restricted"
                );
            },
            saveAccessModel : function() {
                if (this.access.chmod && !this.isNew) {
                    if (this.accessModel == "public") {
                        this.access.groupWrite = true;
                        this.access.group = "everyone";
                    }
                    else {  // restricted
                        this.access.groupWrite = false;
                        this.access.group = "everyone";
                    }
                    RestApi["/api/data/linkage"].setAccess({
                            "resource" : decodeURI(this.currentDocument)
                        }, this.access, 
                        function() {}, 
                        function( data ) { 
                            ErrorService.addApiError(data);
                        }
                    );
                }
            },
            title : "",
            isNew : 1,
            newDocument : function() {
                console.log("New document:TBD");
            },
            setDocument : function() {
                var toDocument = this.currentDocument;
                if (!toDocument) {
                    this.newDocument();
                }
                else {
                    console.log("Load: TBD");
                }
            },
            saveDocument : function() {
                console.log("Save: TBD");
            },
            newButton : function() {
                if ($location.path() == "/translations")
                    $route.reload();
                else 
                    $location.path("/translations");
            },
            saveDocument : function() {
                console.log("TBD");
            }
        };

        $scope.saveButtonText = function() {
            return this.trForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        $scope.$watch("search.selection",
            function(selection) { 
                var resourceName = selection.split("/").pop();
                if (resourceName && resourceName != $scope.editor.currentDocument)
                    $location.path( "/translations/" + resourceName );
            }
        );

        $scope.editor.setDocument();
    }
    ]
);
