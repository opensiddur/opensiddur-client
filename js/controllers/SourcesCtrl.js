/* 
 * controller for sources page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'SourcesCtrl',
    ['$rootScope', '$location', '$route', '$routeParams', '$scope', 'RestApi', 'XsltService', 
    "AccessService", 'DialogService', 'AuthenticationService', 'ErrorService',
    function ($rootScope, $location, $route, $routeParams, $scope, RestApi, XsltService, 
    AccessService, DialogService, AuthenticationService, ErrorService) {
        $scope.DialogService = DialogService;
        AccessService.reset();

        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            "supportedLanguages" : supportedLanguages, 
            "supportedResponsibilities" : supportedResponsibilities,
            "monographScopes" : { 
                volume : "volume",
                issue : "issue",
                page : "pages",
                chapter : "chapters",
                part : "parts"
            },
            currentDocument : $routeParams.resource,   // document to load
            isAnalytic: 0,       // this bibliographic entry has an "analytic" section
            isSeries : 0,        // this entry has a "series" section
            isNew : !($routeParams.resource),           // this entry is a new document 
            content : null,
            requiredExample : null,       // example of a required field
            /* determine if any text nodes in any elements in documentPart have any data in the elements. Does not check attributes */
            hasData : function(documentPart) {
                var hd = false;
                for (var child in documentPart) {
                    if (documentPart.hasOwnProperty(child)) {
                        if (child.match("_asArray$")) {
                            hd = documentPart[child].map(
                                function (ch) { return $scope.editor.hasData(ch); }
                            ).reduce(function (prev, curr) { return prev || curr; } , hd);
                        }
                    }
                }
                return hd || Boolean(documentPart.__text);
            },
            clearData : function(documentPart) {
                for (var child in documentPart) {
                    if (documentPart.hasOwnProperty(child)) {
                        if (child.match("_asArray$")) {
                            this.clearData(child);
                        }
                        else if (child != "_type" && (child == "__text" || child.match("^_[^_]"))) {
                            documentPart[child] = "";
                        }
                    }
                }
            },
            newButton : function () {
                if ($location.path() == "/sources")
                    $route.reload();
                else 
                    $location.path( "/sources" );
                
            },
            newDocument : function () {
                //this.currentDocument = "";
                $scope.editor.isNew = 1;
                $scope.editor.isAnalytic = 0;
                $scope.editor.isSeries = 0;
                transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString("sourceFormTemplate", "<tei:biblStruct xmlns:tei='http://www.tei-c.org/ns/1.0'/>")); 
                $scope.editor.content = x2js.xml_str2json(transformed);
                //$scope.editor.content.biblStruct.monogr.title_asArray[0].__text = "New Bibliography Entry";
                //$scope.sourcesForm.$setPristine();
                AccessService.reset();
            },
            setDocument : function( ) {
                var toDocument = $scope.editor.currentDocument;
                if (!toDocument) {
                    this.newDocument();
                }
                else {
                        RestApi["/api/data/sources"].get({ "resource" : toDocument },
                            function(data) {    // success function
                                var data = data.xml;
                                var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString("sourceFormTemplate", data));
                                $scope.editor.content = x2js.xml_str2json(transformed);
                                $scope.editor.isAnalytic = $scope.editor.hasData($scope.editor.content.biblStruct.analytic) ? 1 : 0;
                                $scope.editor.isSeries = $scope.editor.hasData($scope.editor.content.biblStruct.series) ? 1 : 0;
                                $scope.editor.isNew = 0;
                                //$scope.sourcesForm.$setPristine();
                            },
                            function(error) {
                                ErrorService.addApiError(error.data.xml);
                                console.log("error loading", toDocument);
                                $scope.editor.currentDocument = "";
                            }
                        );
                }
                
            },
            saveDocument : function() {
                console.log("Save:", this);
                var indata = angular.fromJson(angular.toJson(this.content));     // need to remove $$hashkey
                if (!this.isAnalytic) {
                    // clear the data from the analytic section (__text and _* except _type)
                    this.clearData(indata.biblStruct.analytic);
                }
                if (!this.isSeries) {
                    // clear the data from the series section
                    this.clearData(indata.biblStruct.series);
                }
                
                var httpOperation = (this.isNew) ? 
                    RestApi["/api/data/sources"].postJSON : 
                    RestApi["/api/data/sources"].putJSON;
                var resource = (this.isNew) ? "" : $scope.editor.currentDocument;
                httpOperation({
                        "resource" : resource 
                    }, 
                    indata, 
                    function(data, headers) {   //success function
                        $scope.sourcesForm.$setPristine();
                        if ($scope.editor.isNew) {
                            // add to the search results listing
                            
                            var newDocName = decodeURI(headers("Location").split("/").pop());
                            $scope.editor.isNew = false;
                            $scope.editor.currentDocument = newDocName;
                        }
                    },
                    function(error) {
                        ErrorService.addApiError(error.data.xml);
                        console.log("error saving ", resource);
                    }
                );
            },
            archiveIdHelper: {
                url: "",
                error : "",
                setArchiveId : function() {
                    this.error = "";
                    if (this.url.match("books.google.com")) {
                        var m = this.url.match(/id=([A-Za-z0-9_]+)/);
                        if (m) { 
                            $scope.editor.content.biblStruct.idno._type = "books.google.com"; 
                            $scope.editor.content.biblStruct.idno.__text = m[1]; 
                        }
                    }   
                    else if (this.url.match("archive.org")) {
                        var m = this.url.match(/\/(details|stream)\/([A-Za-z0-9_]+)/);
                        if (m) { 
                            $scope.editor.content.biblStruct.idno._type = "archive.org"; 
                            $scope.editor.content.biblStruct.idno.__text = m[2]; 
                        }
                    }
                    else {
                        this.error = "Unrecognized archive URL";
                    }
                }
            }
        };            
        $scope.saveButtonText = function() {
            return this.sourcesForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        $scope.selection = "/exist/restxq/api" + ($scope.editor.isNew ? "" : ("/" + $routeParams.resource));
        
        var selectionWatchCtr = 0;
        $scope.$watch("selection", 
            function( selection ) {
                if (!selectionWatchCtr) {
                    selectionWatchCtr++;
                }
                else if (selection) {
                    $location.path( "/sources/" + decodeURIComponent(selection.split("/").pop()) );
                }
            }
        ); 

        $scope.editor.setDocument();
    }]
);
