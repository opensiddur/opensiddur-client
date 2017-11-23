/* 
 * controller for texts page, which is the generic XML editor 
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.controller(
    'TextsCtrl',
    ['$compile', '$scope', '$location', '$q', '$route', '$routeParams', '$timeout', '$window', 'XsltService',
    'AccessService', 'AnnotationsService', 'AuthenticationService', 'DialogService', 'EditorService', 'ErrorService',
    'LanguageService', 'TextService', 'TranscriptionViewerService', 'TranscriptionWindowService',
    function ($compile, $scope, $location, $q, $route, $routeParams, $timeout, $window, XsltService,
        AccessService, AnnotationsService, AuthenticationService, DialogService, EditorService, ErrorService,
        LanguageService, TextService, TranscriptionViewerService, TranscriptionWindowService) {
        console.log("Texts controller.");
        $scope.DialogService = DialogService;
        $scope.LanguageService = LanguageService;
        $scope.TranscriptionViewerService = TranscriptionViewerService;

        // state associated with the resource type
        $scope.resourceType = {
            "xtexts" : {
                path : "xtexts",
                type : "original",
                api : "/api/data/original",
                supportsAccess : true,
                supportsCompile : true,
                supportsTranscriptionView : true,
                defaultTitle : "New text",
                editorMode : "xml"
            },
            "texts" : {
                path : "texts",
                type : "original",
                api : "/api/data/original",
                supportsAccess : true,
                supportsCompile : true,
                supportsTranscriptionView : true,
                defaultTitle : "New text",
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
                editorMode : "css"
            },
            current : null,
            initAs : function (type) {
                this.current = this[type];
            }
        };
        $scope.resourceType.initAs($location.path().split("/")[1]);

        $scope.TextService = TextService;
        $scope.AccessService = AccessService;

        EditorService.addCKEditor("#ckeditorContainer", $scope);

        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
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
            editableText : function(setContent) {
                if (TextService._isFlat) return TextService.flatContent(setContent);
                else if ($scope.resourceType.current.editorMode == "css") return TextService.stylesheet(setContent);
                else return TextService.content(setContent);
            },
            makeDirty : function(whatsChanged) {
                $scope.textsForm.$setDirty();
                return true;
            },
            title : "",
            isNew : 1,  // isNew=1 indicates that the document has not yet been saved
            isLoaded : 0,    // isLoaded=1 indicates that a document is loaded and ready to edit 
            newTemplate : null, // this is filled in by the new function
            dialogCanceled : function() {
            },
            newDocumentSimple : function () {
                $scope.editor.newDocument(true);
            },
            newDocument : function(flat) {
                // this function is called when the OK button is pressed from the new dialog
                // $scope.newTemplate contains a JS object that has to be passed to the template function
                console.log("Start a new document");
                $scope.editor.isNew = 1;
                // default access rights for a new file
                AccessService.reset();
                // load a new document template
                if (!$scope.editor.newTemplate.template.source) {
                    // default the source (this should happen in new dialog, but isn't because of a bug with defaulting
                    $scope.editor.newTemplate.template.source = "/exist/restxq/api/data/sources/Born%20Digital";
                    $scope.editor.newTemplate.template.sourceTitle = "An Original Work of the Open Siddur Project";
                }
                TextService.newDocument($scope.resourceType.current.api, $scope.editor.newTemplate, flat || false);
                EditorService.addCKEditor("#ckeditorContainer", $scope);
                TranscriptionWindowService.refresh();
                $scope.editor.title = TextService.title()[0].text;
                $scope.editor.isLoaded = 1;
                $location.path("/texts/" + $scope.editor.title, false);

                setTimeout(
                    function() {
                        // work around for a bug where the text service is getting unsynced
                        TextService.flatContent(TextService.flatContent());
                        // work around a bug where the editor does not refresh after load
                        $scope.editor.codemirror.editor.refresh(); 
                        // set the form dirty only after the location change has occurred
                        $scope.textsForm.$setDirty();
                    }, 250
                );

            },
            openDocument : function( selection, useFlat ) {
                var resourceName = decodeURIComponent(selection.split("/").pop());  // try to prevent double-encoding
                if (resourceName && resourceName != TextService._resource) {
                    $location.path( "/" + $scope.resourceType.current.path + "/" + resourceName, false);
                    $scope.editor.setDocument(resourceName, false, useFlat || false);
                }
            },
            openDocumentSimple : function ( selection ) {
                $scope.editor.openDocument(selection,
                    $scope.resourceType.current.type == "original");    // only original docs can be edited simply
            },
            setDocument : function( toDocument, cursorLocation, useFlat ) {
                if (toDocument) {
                    TextService.load($scope.resourceType.current.api, toDocument, useFlat || false)
                    .then(function(ts) {
                        if ($scope.resourceType.current.supportsAccess) {
                            AccessService.load($scope.resourceType.current.api, toDocument)
                            .then(function() {
                                $scope.editor.codemirror.readOnly = !AccessService.access.write; 
                            },
                            function (error) {
                                ErrorService.addApiError(error);
                            });
                        }
                        $scope.editor.title = TextService.title()[0].text;
                        $scope.editor.isNew = 0;
                        $scope.editor.isLoaded = 1;
                        EditorService.addCKEditor("#ckeditorContainer", $scope);
                        TranscriptionWindowService.refresh();
                        setTimeout(
                            function() {
                                // work around for a bug where the text service is getting unsynced
                                TextService.flatContent(TextService.flatContent());
                                $scope.editor.codemirror.editor.refresh();
                                if (cursorLocation) {
                                    $scope.editor.codemirror.doc.setCursor(cursorLocation);
                                }
                                $scope.textsForm.$setPristine();
                            }, 250
                        );

                    },
                    function(error) {    // error function
                        ErrorService.addApiError(error);
                        console.log("error loading", toDocument);
                        TextService.setResource("", "");
                    });
                }
            },
            saveDocument : function () {
                console.log("Save:", this);
                AnnotationsService.saveAll()
                .then(function() {
                    return TextService.save()
                    .then(
                        function(ts) {   // success
                            if ($scope.editor.isNew) {
                                $scope.editor.isNew = 0;
                                // save the access model for the new document
                                if ($scope.resourceType.current.supportsAccess) {
                                    return AccessService.setResource(TextService._resourceApi, TextService._resource)
                                    .save()
                                    .then(null, function(error) {
                                        ErrorService.addApiError(error);
                                    });
                                 }
                            }
                        },
                        function(error) {
                            ErrorService.addApiError(error);
                            console.log("error saving ", TextService._resource);
                            return $q.reject(error);
                        });
                    },
                    function (error) { // error in saving annotation  
                        ErrorService.addApiError(error);
                        console.log("error saving annotations for ", TextService._resource);
                        return $q.reject(error);
                    }
                )
                .then(function() {
                    return $timeout(function() { 
                        $scope.textsForm.$setPristine(); 
                    }, 750);
                });
            },
            newButton : function () {
                if ($location.path() == "/"+$scope.resourceType.current.path)
                    $route.reload();
                else 
                    $location.path( "/"+$scope.resourceType.current.path );
            },
            compile : function () {
                $window.open("/compile/" + TextService._resource);
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
                    var content = TextService.content(); //$scope.editor.codemirror.doc.getValue();
                    var transformed = XsltService.transformString( xslt, content );
                    if (transformed) {
                        var str = XsltService.indentToString(transformed);
                        var jstr = $(str);
                        if (jstr.prop("tagName")=="PARSERERROR") {
                            ErrorService.addAlert("Unable to run the transform because the document could not be parsed. It probably contains some invalid XML.", "error");    
                        }
                        else {
                            TextService.content(str);
                        //$scope.$apply(); 
                        }
                        setTimeout(
                            function() { $scope.editor.codemirror.doc.setCursor(position) }, 250
                        );
                        //$scope.editor.ace.editor.clearSelection();
                    }
                },
                addIds : function () {
                    this.applyXslt( "/js/text/add-xml-id.xsl" );
                },
                segment : function () {
                    this.applyXslt ( "/js/text/auto-segment.xsl" );
                },
                wordify : function () {
                    this.applyXslt( "/js/text/wordify.xsl" );
                }
            }
        };
        $scope.$watch("helper.link.selection", function (newSelection) {
            $scope.helper.link.insertable = newSelection.replace(/^\/exist\/restxq\/api/, "")
        });

        $scope.editor.setDocument($routeParams.resource, false, $location.path().split("/")[1] == "texts");

    }]
);
