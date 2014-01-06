/* 
 * controller for texts page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$http', 'XsltService', 'AuthenticationService', 'AccessService',
    function ($scope, $http, XsltService, AuthenticationService, AccessService) {
        console.log("Texts controller.");
        $scope.errorMessage = "";
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            title : "",
            currentDocument : null,
            content : "",
            access : {},
            title : "",
            isNew : 1,
            newDocument : function() {
                console.log("Start a new document");
                this.title = "New";
                $scope.editor.isNew = 1;
                $scope.editor.content = "";
                $scope.editor.access = {
                    owner : AuthenticationService.userName,
                    group : AuthenticationService.userName,
                    read : true, 
                    write : true,
                    relicense : true,
                    chmod : true
                }
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
                                // the access data is needed outside of angular, so just using the promise object 
                                // is less practical.
                                $scope.editor.access = {
                                    owner : undefined,
                                    group : undefined,
                                    read : undefined,
                                    write : undefined,
                                    relicense : undefined,
                                    chmod : undefined
                                };
                                AccessService.get(toDocument).then(function(a) { 
                                    $scope.editor.access = a;
                                });
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
