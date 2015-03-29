/* 
 * controller for texts page, which is the generic XML editor 
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TextsCtrl',
    ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'XsltService', 
    'AccessService', 'AuthenticationService', 'DialogService', 'ErrorService', 'RestApi',
    'LanguageService', 'TextService',
    function ($scope, $location, $route, $routeParams, $timeout, $window, XsltService, 
        AccessService, AuthenticationService, DialogService, ErrorService, RestApi,
        LanguageService, TextService) {
        console.log("Texts controller.");
        $scope.DialogService = DialogService;
        $scope.LanguageService = LanguageService;

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

        // this should be in $scope.editor, but ng-ckeditor will not allow it to be (see line 73)
        $scope.ckeditorOptions = {
            autoParagraph : false,
            contentsCss : "/css/simple-editor.css",
            customConfig : "/js/ckeditor/config.js",    // points to the plugin directories
            enterMode : CKEDITOR.ENTER_P,
            entities : false,   // need XML entities, but not HTML entities...
            extraPlugins : "language,tei-p,tei-ptr,tei-seg",
            fillEmptyBlocks : false,
            language : "en",
            language_list : LanguageService.getCkeditorList(),
            readOnly : !AccessService.access.write,
            toolbar : "basic",
            toolbar_full : [],
            toolbarGroups : [
                { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
                { name: 'opensiddur', groups : [ 'opensiddur' ] },
                { name: 'editing',     groups: [ 'find', 'selection' ] },
                { name: 'insert' },
                //{ name: 'forms' },
                //{ name: 'tools' },
                { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
                //{ name: 'others' },
                //'/',
                //{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                //{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                //{ name: 'styles' },
                //{ name: 'colors' },
                //{ name: 'about' }
            ],
            removeButtons : 'Paste,PasteFromWord',  
            allowedContent :
                "a[href,data-target-base,data-target-fragment,target](tei-ptr);"+
                "p[!id](tei-seg,tei-p,layer-p,layer,start,end);" +
                "*[id,lang,dir,data-*]"
        };
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            ckeditorChanged : function() {
                var lang = TextService.language().language;
                var dir = LanguageService.getDirection(lang);
                try {
                    var htmlElement = CKEDITOR.instances.editor1.document.getDocumentElement().$;
                    htmlElement.setAttribute("lang", lang);
                    htmlElement.setAttribute("dir", dir);
                }
                catch (err) {
                    console.log("CKEDITOR instance does not exist. Could be an issue.");
                }
            }, 
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
                $scope.editor.title = TextService.title()[0].text;
                $scope.editor.isLoaded = 1;
                $location.path("/texts/" + $scope.editor.title, false);
                // work around a bug where the editor does not refresh after load
                setTimeout(
                    function() { 
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
                $scope.editor.openDocument(selection, true);
            },
            setDocument : function( toDocument, cursorLocation, useFlat ) {
                if (toDocument) {
                    TextService.load($scope.resourceType.current.api, toDocument, useFlat || false)
                    .success(function(ts) {
                        if ($scope.resourceType.current.supportsAccess) {
                            AccessService.load($scope.resourceType.current.api, toDocument)
                            .success(function() {
                                $scope.editor.codemirror.readOnly = !AccessService.access.write; 
                            })
                            .error(function (error) {
                                ErrorService.addApiError(error);
                            });
                        };
                        $scope.editor.title = TextService.title()[0].text;
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

                    })
                    .error(function(error) {    // error function
                        ErrorService.addApiError(error);
                        console.log("error loading", toDocument);
                        TextService.setResource("", "");
                    });
                }
            },
            saveDocument : function () {
                console.log("Save:", this);
                TextService.save()
                    .success(function(data, statusCode, headers) {   // success
                        $scope.textsForm.$setPristine();
                        if ($scope.editor.isNew) {
                            $scope.editor.isNew = 0;
                            // save the access model for the new document
                            if ($scope.resourceType.current.supportsAccess) {
                                AccessService.setResource(TextService._resourceApi, TextService._resource)
                                .save()
                                .error(function(error) {
                                    ErrorService.addApiError(error);
                                });
                             }
                        }
                    })
                    .error(function(error) {
                        ErrorService.addApiError(error);
                        console.log("error saving ", TextService._resource);
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
            },
            transcriptionViewer : false
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

        $scope.editor.setDocument($routeParams.resource, false, false);

    }]
);
