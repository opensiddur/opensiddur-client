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
        console.log("Texts controller.");
        $scope.errorMessage = "";
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            title : "",
            currentDocument : null,
            content : "",
            isNew : 0,
            newDocument : function() {
                console.log("Start a new document");
                this.title = "New";
            },
            setDocument : function(toDocument) {
                if (toDocument == "") {
                    this.newDocument();
                }
                else {
                    $http.get(toDocument) 
                        .success(
                            function(data) {
                                /*
                                transformed = XsltService.transformString("teiToHtml", data);
                                console.log(transformed);
                                $scope.editor.content = (new XMLSerializer()).serializeToString(transformed);
                                */
                                $scope.editor.content = data; 
                                $scope.editor.title = $("tei\\:title[type=main]", data).html();
                                $scope.editor.isNew = 0;
                                $scope.errorMessage = "";
                                $scope.textsForm.$setPristine();
                            }
                        )
                        .error(
                            function(data) {
                                $scope.errorMessage = getApiError(data);
                                console.log("error loading", toDocument);
                                $scope.editor.currentDocument = "";
                            }
                        )
                }
            },
            loaded : function( _editor ) {
                this.ace = {
                    editor : _editor,
                    session : _editor.getSession(),
                    renderer : _editor.renderer
                };
            }
        };
        $scope.saveButtonText = function() {
            return this.textsForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        $scope.$watch("editor.currentDocument",
            function(newDoc, oldDoc) {
                $scope.editor.setDocument(newDoc);
            }
        );

        if ($scope.editor.loggedIn) {
            $scope.editor.currentDocument = "";
        }
    }]
);
