/* 
 * controller for texts page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$rootScope', '$http', '$window', 'XsltService', 'AuthenticationService', 'AccessService',
    function ($scope, $rootScope, $http, $window, XsltService, AuthenticationService, AccessService) {
        console.log("Texts controller.");
        $scope.errorMessage = "";
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
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
                // default access rights for a new file
                $scope.editor.access = {
                    owner : AuthenticationService.userName,
                    group : AuthenticationService.userName,
                    read : true, 
                    write : true,
                    relicense : true,
                    chmod : true
                }
                // load a new document template
                documentTemplate = "/templates/original.xml";
                $http.get(documentTemplate) 
                    .success(
                        function(data) {
                            $scope.editor.content = data; 
                            $scope.editor.title = "New, Untitled";
                            $scope.errorMessage = "";
                            $scope.textsForm.$setPristine();
                        }
                    )
                    .error(
                        function(data) {
                            $scope.errorMessage = getApiError(data);
                            console.log("error loading", documentTemplate);
                        }
                    )
                
            },
            setDocument : function(toDocument) {
                if (!toDocument) {
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
                                $scope.editor.access = {};
                                AccessService.get(toDocument).then(
                                    function(result) { $scope.editor.access = result; return result; }
                                );
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
            saveDocument : function () {
                console.log("Save:", this);
                var httpOperation = (this.isNew) ? $http.post : $http.put;
                var url = (this.isNew) ? "/api/data/original" : $scope.editor.currentDocument;
                indata = $scope.editor.content;
                httpOperation(url, indata)
                    .success(function(data, statusCode, headers) {
                        $scope.textsForm.$setPristine();
                        if ($scope.editor.isNew) {
                            // add to the search results listing
                            $rootScope.$broadcast("ListBox.Append_texts", 
                                [x2js.xml_str2json("<li class='result'><a class='document' href='"+headers('Location')+"'>"+ $("tei\\:title[type=main]", indata).html()+"</a></li>").li]
                            );
                            $scope.editor.isNew = 0;
                            $scope.editor.currentDocument=headers('Location');
                        };
                    })
                    .error(function(data) {
                        $scope.errorMessage = getApiError(data);
                        console.log("error saving", url);
                    });

            },
            compile : function () {
                // TODO: give this a nice loading/compiling/info interface.
                $window.open($scope.editor.currentDocument + "/combined?transclude=true");
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
