/* 
 * controller for sources page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'SourcesCtrl',
    ['$rootScope', '$scope', '$http', 'XsltService', 'AuthenticationService',
    function ($rootScope, $scope, $http, XsltService, AuthenticationService) {
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            "supportedLanguages" : supportedLanguages, 
            "monographScopes" : { 
                volume : "volume",
                issue : "issue",
                page : "pages",
                chapter : "chapters",
                part : "parts"
            },
            currentDocument : "",   // document to load
            isAnalytic: 0,       // this bibliographic entry has an "analytic" section
            isSeries : 0,        // this entry has a "series" section
            isNew : 1,           // this entry is a new document 
            content : null,  
            /* determine if any text nodes in any elements in documentPart have any data in the elements. Does not check attributes */
            hasData : function(documentPart) {
                hd = false;
                for (var child in documentPart) {
                    if (documentPart.hasOwnProperty(child)) {
                        if (child.match("_asArray$")) {
                            hd = hd || this.hasData(child);
                        }
                    }
                }
                return hd || documentPart.__text;
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
            newDocument : function () {
                //this.currentDocument = "";
                $scope.editor.isNew = 1;
                $scope.editor.isAnalytic = 0;
                $scope.editor.isSeries = 0;
                transformed = XsltService.transformString("sourceFormTemplate", "<tei:biblStruct xmlns:tei='http://www.tei-c.org/ns/1.0'/>"); 
                $scope.editor.content = x2js.xml2json(transformed);
                $scope.editor.content.biblStruct.monogr.title_asArray[0].__text = "New Bibliography Entry";
                $scope.sourcesForm.$setPristine();
            },
            setDocument : function(toDocument) {
                if (toDocument == "") {
                    this.newDocument();
                }
                else {
                        $http.get(toDocument)
                            .success(
                                function(data) {
                                    transformed = XsltService.transformString("sourceFormTemplate", data);
                                    $scope.editor.content = x2js.xml2json(transformed);
                                    $scope.editor.isAnalytic = $scope.editor.hasData($scope.editor.content.biblStruct.analytic) ? 1 : 0;
                                    $scope.editor.isSeries = $scope.editor.hasData($scope.editor.content.biblStruct.series) ? 1 : 0;
                                    $scope.editor.isNew = 0;
                                    $scope.errorMessage = "";
                                    $scope.sourcesForm.$setPristine();
                                    //$scope.editor.currentDocument = toDocument;
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
                
                var httpOperation = (this.isNew) ? $http.post : $http.put;
                var url = (this.isNew) ? "/api/data/sources" : $scope.editor.currentDocument;
                httpOperation(url, indata, {
                        transformRequest : function(data) {
                            var xmlData = x2js.json2xml(data);
                            console.log('transformed to XML:', xmlData);
                            var cleanedXmlData = XsltService.transform('cleanupForm', xmlData);
                            console.log('cleaned up:', cleanedXmlData);
                            return cleanedXmlData;
                        }
                    })
                    .success(function(data, statusCode, headers) {
                        $scope.sourcesForm.$setPristine();
                        if ($scope.editor.isNew) {
                            // add to the search results listing
                            $rootScope.$broadcast("ListBox.Append_sources", 
                                [x2js.xml_str2json("<li class='result'><a class='document' href='"+headers('Location')+"'>"+$scope.editor.content.biblStruct.monogr.title_asArray[0].__text+"</a></li>").li]
                            );
                            $scope.editor.isNew = false;
                        };
                    })
                    .error(function(data) {
                        $scope.errorMessage = getApiError(data);
                        console.log("error saving", url);
                    });
            }
        };            
        $scope.saveButtonText = function() {
            return this.sourcesForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };
        $scope.$watch("editor.currentDocument", 
            function(newDoc, oldDoc) {
                $scope.editor.setDocument(newDoc);
            }
        ); 
        $scope.editor.currentDocument = "";
    }]
);
