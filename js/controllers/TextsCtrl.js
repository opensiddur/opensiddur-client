/* 
 * controller for texts page, which is the generic XML editor 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$location', '$route', '$routeParams', '$http', '$timeout', '$window', 'XsltService', 
    'AccessModelService', 'AuthenticationService', 'DialogService', 'ErrorService', 'RestApi',
    function ($scope, $location, $route, $routeParams, $http, $timeout, $window, XsltService, 
        AccessModelService, AuthenticationService, DialogService, ErrorService, RestApi) {
        console.log("Texts controller.");
        $scope.selection = "";
        $scope.DialogService = DialogService;

        // state associated with the resource type
        $scope.resourceType = {
            "texts" : {
                path : "texts",
                type : "original",
                api : "/api/data/original",
                supportsAccess : true,
                supportsCompile : true,
                supportsTranscriptionView : true,
                defaultTitle : "New text",
                documentTemplate : "templateNewOriginal",
                editorMode : "xml"
            },
            "conditionals" : {
                path : "conditionals",
                type : "conditionals",
                api : "/api/data/conditionals",
                supportsAccess : false,
                supportsCompile : false,
                supportsTranscriptionView : true,
                defaultTitle : "New conditional",
                documentTemplate : "templateNewConditionals",
                editorMode : "xml"
            },
            "annotations" : { 
                path : "annotations",
                type : "annotations",
                api : "/api/data/notes",
                supportsAccess : true,
                supportsCompile : false,
                supportsTranscriptionView : true,
                defaultTitle : "New annotations",
                documentTemplate : "templateNewAnnotations",
                editorMode : "xml"
            },
            "styles" : { 
                path : "styles",
                type : "styles",
                api : "/api/data/styles",
                supportsAccess : true,
                supportsCompile : false,
                supportsTranscriptionView : false,
                defaultTitle : "New style",
                documentTemplate : "templateNewStyle",
                editorMode : "css"
            },
            current : null,
            initAs : function (type) {
                this.current = this[type];
            }
        };
        $scope.resourceType.initAs($location.path().split("/")[1]);

        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : $routeParams.resource,
            codemirrorOptions : {
                lineWrapping : true,
                lineNumbers : true,
                mode : $scope.resourceType.current.editorMode,
                tabSize : 4,
                indentUnit : 4,
                indentWithTabs : false,
                readOnly : !AuthenticationService.loggedIn,  // controlled by logged in state and access.write 
                autoCloseTags : {
                    whenClosing : true,
                    whenOpening : false
                },
                rtlMoveVisually : false
            },
            content : "",
            loadedContent : "",     // this has to be saved for revert or for when non-XML editing needs to be done as a subset of the XML
            access : AccessModelService.default(AuthenticationService.userName),
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
                    RestApi[$scope.resourceType.current.api].setAccess({
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
            isNew : 1,  // isNew=1 indicates that the document has not yet been saved
            isLoaded : 0,    // isLoaded=1 indicates that a document is loaded and ready to edit 
            newTemplate : null, // this is filled in by the new function
            newCanceled : function() {
            },
            newDocument : function() {
                // this function is called when the OK button is pressed from the new dialog
                // $scope.newTemplate contains a JS object that has to be passed to the template function
                console.log("Start a new document");
                $scope.editor.isNew = 1;
                $scope.editor.content = "";
                $scope.editor.loadedContent = "";
                // default access rights for a new file
                $scope.editor.access = AccessModelService.default(AuthenticationService.userName);
                // load a new document template
                var documentTemplate = $scope.resourceType.current.documentTemplate;
                if (!$scope.editor.newTemplate.template.source) {
                    // default the source (this should happen in new dialog, but isn't because of a bug with defaulting
                    $scope.editor.newTemplate.template.source = "/exist/restxq/api/data/sources/Born%20Digital";
                }
                var templateParameters = x2js.json2xml($scope.editor.newTemplate);
                var strdoc = XsltService.indentToString(XsltService.transform(documentTemplate, templateParameters));
                $scope.editor.loadedContent = strdoc;
                $scope.editor.content = 
                    ($scope.resourceType.current.editorMode == "xml") ? strdoc : 
                        // at the moment, the only other option is css
                        $("j\\:stylesheet", strdoc).html(); 
                $scope.editor.title = $("tei\\:title[type=main]", strdoc).html();
                $scope.editor.isLoaded = 1;
                $scope.textsForm.$setDirty();
                // work around a bug where the editor does not refresh after load
                setTimeout(
                    function() { $scope.editor.codemirror.editor.refresh(); }, 250
                );
            },
            setDocument : function( cursorLocation ) {
                var toDocument = this.currentDocument;

                if (!toDocument) {
                    /* don't do this:
                    setTimeout(
                        function() { DialogService.open('newDialog'); }, 500
                    );
                    */
                    // nothing to do here...
                }
                else {
                    $http.get($scope.resourceType.current.api + "/" + toDocument,
                        { headers : { "Accept": "application/xml" } } ) 
                        .success(
                            function(data) {
                                if ($scope.resourceType.current.supportsAccess) {
                                    $scope.editor.access = RestApi[$scope.resourceType.current.api].getAccess({
                                        "resource" : decodeURI(toDocument)
                                    }, function( access ) {
                                        $scope.editor.setAccessModel();
                                        if (!access.write)
                                            $scope.editor.codemirror.readOnly = true; 
                                    });
                                };
                                
                                $scope.editor.loadedContent = XsltService.serializeToStringTEINSClean(XsltService.transformString( "originalTemplate", data ));
                                
                                $scope.editor.content = ($scope.resourceType.current.editorMode == "xml") ? 
                                    $scope.editor.loadedContent
                                    : $("j\\:stylesheet", data).html(); 
                                $scope.editor.title = $("tei\\:title[type=main]", data).html();
                                $scope.editor.isNew = 0;
                                $scope.editor.isLoaded = 1;
                                $scope.textsForm.$setPristine();
                                setTimeout(
                                    function() { 
                                        $scope.editor.codemirror.editor.refresh(); 
                                        if (cursorLocation) {
                                            $scope.editor.codemirror.doc.setCursor(cursorLocation);
                                        }
                                    }, 250
                                );

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
                var url = $scope.resourceType.current.api + ((this.isNew) ? "" : ("/" + $scope.editor.currentDocument));
                var content = $scope.editor.codemirror.doc.getValue();
                var transformed = 
                    ($scope.resourceType.current.editorMode=="xml") ?
                        XsltService.transformString( "originalBeforeSave", content ) :
                        XsltService.transformString("styleBeforeSave", $scope.editor.loadedContent, 
                            { "style" : content});
                if (transformed) {
                    var indata = XsltService.serializeToStringTEINSClean(transformed);
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
                                    $scope.editor.isNew = 0;
                                    $scope.editor.currentDocument=headers('Location').replace("/exist/restxq"+$scope.resourceType.current.api+"/", "");
                                    // save the access model for the new document
                                    if ($scope.resourceType.current.supportsAccess) {
                                        $scope.editor.saveAccessModel();
                                    }
                                };
                                // reload the document to get the change log in there correctly
                                // add a 1s delay to allow the server some processing time before reload
                                setTimeout(
                                    function() { 
                                        $scope.editor.setDocument($scope.editor.codemirror.doc.getCursor()); 
                                    }, 1000
                                );
                            })
                            .error(function(data) {
                                ErrorService.addApiError(data);
                                console.log("error saving", url);
                            });
                    }
                }
            },
            newButton : function () {
                if ($location.path() == "/"+$scope.resourceType.current.path)
                    $route.reload();
                else 
                    $location.path( "/"+$scope.resourceType.current.path );
            },
            compile : function () {
                $window.open("/compile/" + $scope.editor.currentDocument);
            },
            loaded : function( _editor ) {
                console.log("editor loaded");
                $scope.editor.codemirror = {
                    editor : _editor,
                    doc : _editor.getDoc()
                };
                $scope.editor.codemirror.doc.markClean();
            },
            transcriptionViewer : false
        };
        $scope.saveButtonText = function() {
            return this.textsForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        var selectionWatchCtr = 0;
        $scope.$watch("selection",
            function( selection ) { 
                if (!selectionWatchCtr) {
                    selectionWatchCtr++;
                }
                else {
                    var resourceName = selection.split("/").pop();
                    if (resourceName && resourceName != $scope.editor.currentDocument)
                        $location.path( "/" + $scope.resourceType.current.path + "/" + resourceName );
                }
            }
        );

        $scope.helper = {
            link : {
                selectedType : $scope.resourceType.current.api,
                types : {
                    "/api/data/notes" : "Annotations",
                    "/api/user" : "Contributor",
                    "/api/data/original" : "Original text",
                    "/api/data/sources" : "Source",
                    "/api/data/conditionals" : "Conditional"
                },
                selection : "",
                insertable : "",
                insert : function (link) {
                    $timeout(function() { $scope.editor.codemirror.doc.replaceSelection(link, "end"); });
                    $scope.textsForm.$setDirty();
                },
                cancel : function() { ; }
            },
            xml : {
                getSelectedXmlIdRange : function () {
                    // return the (complete) elements and ids that are in the current selection
                    // can be filtered for a particular element type
                    var selection = $scope.editor.codemirror.doc.getSelection();
                    var elements = [];
                    selection.replace(/\<([^\>\s]+)[^\>]*xml:id=\"([^\"]+)\"/g, 
                        function(match, element, id) {
                            elements.push({ "element": element, "id": id });
                    });
                    return elements;
                },
                applyXslt : function ( xslt ) {
                    var position = $scope.editor.codemirror.doc.getCursor();
                    var content = $scope.editor.codemirror.doc.getValue();
                    var transformed = XsltService.transformString( xslt, content );
                    if (transformed) {
                        var str = XsltService.indentToString(transformed);
                        var jstr = $(str);
                        if (jstr.prop("tagName")=="PARSERERROR") {
                            ErrorService.addAlert("Unable to run the transform because the document could not be parsed. It probably contains some invalid XML.", "error");    
                        }
                        else {
                            $scope.editor.content = str;
                        //$scope.$apply(); 
                        }
                        setTimeout(
                            function() { $scope.editor.codemirror.doc.setCursor(position) }, 250
                        );
                        //$scope.editor.ace.editor.clearSelection();
                    }
                },
                addIds : function () {
                    this.applyXslt( "addXmlId" );
                },
                segment : function () {
                    this.applyXslt ( "autoSegment" );
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
