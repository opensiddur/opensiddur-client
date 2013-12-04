/* 
 * controller for sources page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'SourcesCtrl',
    ['$scope', '$http', 'XsltService',
    function ($scope, $http, XsltService) {
        $scope.editor = {
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
            newDocument : function () {
                //this.currentDocument = "";
                $scope.editor.isAnalytic = 0;
                $scope.editor.isSeries = 0;
                transformed = XsltService.transformString("sourceFormTemplate", "<tei:biblStruct xmlns:tei='http://www.tei-c.org/ns/1.0'/>"); 
                $scope.editor.content = x2js.xml2json(transformed);
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
                console.log("Save");
            }
        };            
        $scope.$watch("editor.currentDocument", 
            function(newDoc, oldDoc) {
                $scope.editor.setDocument(newDoc);
            }
        ); 
        $scope.editor.currentDocument = "";
    }]
);
