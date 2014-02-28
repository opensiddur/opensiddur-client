/* 
 * controller for texts page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$location', '$route', '$routeParams', '$http', '$window', 'XsltService', 
    'AuthenticationService', 'IndexService', 'ErrorService', 'RestApi',
    function ($scope, $location, $route, $routeParams, $http, $window, XsltService, 
        AuthenticationService, IndexService, ErrorService, RestApi) {
        console.log("Texts controller.");
        IndexService.search.enable( "/api/data/original" );
        if ($routeParams.resource) {
            IndexService.search.collapse();
        }
        $scope.search = IndexService.search;


        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : $routeParams.resource,
            codemirrorOptions : {
                lineWrapping : true,
                lineNumbers : true,
                mode : 'xml',
                tabSize : 4,
                indentUnit : 4,
                indentWithTabs : false,
                readOnly : !AuthenticationService.loggedIn,  // controlled by logged in state and access.write 
                autoCloseTags : {
                    whenClosing : true,
                    whenOpening : false
                }
            },
            content : "",
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
                    RestApi["/api/data/original"].setAccess({
                            "resource" : this.currentDocument
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
                console.log("Start a new document");
                this.title = "New text";
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
                };
                // load a new document template
                documentTemplate = "/templates/original.xml";
                $http.get(documentTemplate) 
                    .success(
                        function(data) {
                            $scope.editor.content = XsltService.serializeToString(XsltService.transformString( "originalTemplate", data )); 
                            $scope.editor.title = "New text";
                            $scope.textsForm.$setPristine();
                        }
                    )
                    .error(
                        function(data) {
                            ErrorService.addApiError(data);
                            console.log("error loading", documentTemplate);
                        }
                    )
                
            },
            setDocument : function( cursorLocation ) {
                var toDocument = this.currentDocument;

                if (!toDocument) {
                    this.newDocument();
                }
                else {
                    $http.get("/api/data/original/" + toDocument) 
                        .success(
                            function(data) {
                                $scope.editor.access = RestApi["/api/data/original"].getAccess({
                                    "resource" : toDocument
                                }, function( access ) {
                                    $scope.editor.setAccessModel();
                                    if (!access.write)
                                        $scope.editor.codemirror.readOnly = true; 
                                });
                                
                                $scope.editor.content = XsltService.serializeToString(XsltService.transformString( "originalTemplate", data )); 
                                $scope.editor.title = $("tei\\:title[type=main]", data).html();
                                $scope.editor.isNew = 0;
                                $scope.textsForm.$setPristine();

                                if (cursorLocation) {
                                    //$scope.$apply(); 
                                    $scope.editor.codemirror.doc.setCursor(cursorLocation);
                                    //$scope.editor.ace.editor.clearSelection();
                                }
                            }
                        )
                        .error(
                            function(data) {
                                ErrorService.addApiError(data);
                                console.log("error loading", toDocument);
                                $scope.editor.currentDocument = "";
                            }
                        )
                }
            },
            saveDocument : function () {
                console.log("Save:", this);
                var httpOperation = (this.isNew) ? $http.post : $http.put;
                var url = "/api/data/original" + ((this.isNew) ? "" : ("/" + $scope.editor.currentDocument));
                var content = $scope.editor.codemirror.doc.getValue();
                var indata = XsltService.serializeToString(
                    XsltService.transformString( "originalBeforeSave", content ));
                jindata = $(indata);
                if (jindata.prop("tagName") == "PARSERERROR") {
                    ErrorService.addAlert("Unable to save because the document could not be parsed. It probably contains some invalid XML.", "error");    
                }
                else if ($("tei\\:title[type=main]", jindata).text().length == 0 && 
                        $("tei\\:title[type=main]", jindata).children().length == 0) {
                    ErrorService.addAlert("A main title is required!", "error");
                }
                else {
                    httpOperation(url, indata)
                        .success(function(data, statusCode, headers) {
                            $scope.textsForm.$setPristine();
                            if ($scope.editor.isNew) {
                                // add to the search results listing
                                IndexService.search.addResult({
                                    title:  $( "tei\\:title[type=main]", indata).html(), 
                                    url : headers('Location'),
                                    contexts : []
                                });

                                $scope.editor.isNew = 0;
                                $scope.editor.currentDocument=headers('Location').replace("/exist/restxq/api/data/original/", "");
                                // save the access model for the new document
                                $scope.editor.saveAccessModel();
                            };
                            // reload the document to get the change log in there correctly
                            $scope.editor.setDocument($scope.editor.codemirror.doc.getCursor());
                        })
                        .error(function(data) {
                            ErrorService.addApiError(data);
                            console.log("error saving", url);
                        });
                }
            },
            newButton : function () {
                if ($location.path() == "/texts")
                    $route.reload();
                else 
                    $location.path( "/texts" );
            },
            compile : function () {
                // TODO: give this a nice loading/compiling/info interface.
                $window.open("/api/data/original/" + $scope.editor.currentDocument + "/combined?transclude=true");
            },
            loaded : function( _editor ) {
                console.log("editor loaded");
                $scope.editor.codemirror = {
                    editor : _editor,
                    doc : _editor.getDoc()
                };
                $scope.editor.codemirror.doc.markClean();
            }
        };
        $scope.saveButtonText = function() {
            return this.textsForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        $scope.$watch("search.selection",
            function( selection ) { 
                var resourceName = selection.split("/").pop();
                if (resourceName && resourceName != $scope.editor.currentDocument)
                    $location.path( "/texts/" + resourceName );
            }
        );

        $scope.helper = {
            link : {
                selectedType : "/api/data/original",
                types : {
                    "/api/user" : "Contributor",
                    "/api/data/original" : "Original text",
                    "/api/data/sources" : "Source"
                },
                selection : "",
                insertable : "",
                insert : function () {
                    $scope.editor.codemirror.doc.replaceSelection(this.insertable, "end");
                }
            },
            xml : {
                applyXslt : function ( xslt ) {
                    var position = $scope.editor.codemirror.doc.getCursor();
                    var transformed = XsltService.transformString( xslt, $scope.editor.content );
                    var str = XsltService.serializeToString(transformed);
                    var jstr = $(str);
                    if (jstr.prop("tagName")=="PARSERERROR") {
                        ErrorService.addAlert(jstr.html(), "error");
                    }
                    else {
                        $scope.editor.content = str;
                    //$scope.$apply(); 
                    }
                    $scope.editor.codemirror.doc.setCursor(position);
                    //$scope.editor.ace.editor.clearSelection();
                },
                addIds : function () {
                    this.applyXslt( "addXmlId" );
                },
                wordify : function () {
                    this.applyXslt( "wordify" );
                }
            }
        };
        $scope.$watch("helper.link.selection", function (newSelection) {
            $scope.helper.link.insertable = newSelection.replace(/^\/exist\/restxq\/api/, "")
        });

        $scope.editor.setDocument();

    }]
);
