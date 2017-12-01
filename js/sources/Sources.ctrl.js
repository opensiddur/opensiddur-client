/* 
 * controller for sources page 
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osSourcesModule.controller(
    'SourcesCtrl',
    ['$rootScope', '$location', '$route', '$routeParams', '$scope', 'SourceService',
    "AccessService", 'DialogService', "LanguageService", "LicensesService", 'AuthenticationService', 'ErrorService',
    function ($rootScope, $location, $route, $routeParams, $scope, SourceService,
    AccessService, DialogService, LanguageService, LicensesService, AuthenticationService, ErrorService) {
        $scope.DialogService = DialogService;
        $scope.LanguageService = LanguageService;
        $scope.supportedLicenses = $.extend(angular.copy(LicensesService.supportedLicenses), {"other" : "Other"});
        $scope.selectedLicense = "other";
        $scope.SourceService = SourceService;
        AccessService.reset();

        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            "supportedResponsibilities" : supportedResponsibilities,
            "monographScopes" : { 
                volume : "volume",
                issue : "issue",
                page : "pages",
                chapter : "chapters",
                part : "parts"
            },
            requiredExample : null,       // example of a required field
            newButton : function () {
                if ($location.path() == "/sources")
                    $route.reload();
                else 
                    $location.path( "/sources" );
                
            },
            newDocument : function () {
                SourceService.loadNew();
                AccessService.reset();
            },
            openDocument : function (selection) {
                $location.path( "/sources/" + decodeURIComponent(selection.split("/").pop()) );
                return true;
            },
            dialogCancel : function () {},
            setDocument : function( ) {
                var toDocument = $routeParams.resource;
                if (!toDocument) {
                    this.newDocument();
                }
                else {
                    SourceService.load(toDocument)
                    .then(
                        function() {
                            var lic = SourceService.content.biblStruct.note_asArray[0].ref._target;
                            if (lic && lic in $scope.supportedLicenses) {
                                $scope.selectedLicense = lic;
                            }
                            else {
                                $scope.selectedLicense = "other";
                            }
                        },
                        function(error) {
                            ErrorService.addApiError(error);
                            console.log("error loading", toDocument);
                        });
                }
            },
            saveDocument : function() {
                console.log("Save:", this);
                SourceService.save()
                .then(
                    function() {
                        $scope.sourcesForm.$setPristine();
                    },
                    function(error) {
                        ErrorService.addApiError(error);
                        console.log("error saving ", SourceService.resource);
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
                            SourceService.content.biblStruct.idno._type = "books.google.com";
                            SourceService.content.biblStruct.idno.__text = m[1];
                        }
                    }   
                    else if (this.url.match("archive.org")) {
                        var m = this.url.match(/\/(details|stream)\/([A-Za-z0-9_]+)/);
                        if (m) { 
                            SourceService.content.biblStruct.idno._type = "archive.org";
                            SourceService.content.biblStruct.idno.__text = m[2];
                        }
                    }
                    else {
                        this.error = "Unrecognized archive URL";
                    }
                }
            }
        };            
        $scope.saveButtonText = function() {
            return this.sourcesForm.$pristine ? ((SourceService.resource == "") ? "Unsaved, No changes" : "Saved" ) : "Save";
        };
        $scope.selectLicense = function(lic) {
            if (lic != "other" && lic in $scope.supportedLicenses) {
                SourceService.content.biblStruct.note_asArray[0].ref._target = lic;    
                SourceService.content.biblStruct.note_asArray[0].ref.__text = $scope.supportedLicenses[lic];
            }
        };
        $scope.editor.setDocument();
    }]
);
