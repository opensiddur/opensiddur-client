/* 
 * controller for translations page 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
translationsModule.controller(
    'TranslationsCtrl',
    ['$scope', '$http', '$location', '$route', '$routeParams', '$q', 
    'AccessService', 'AuthenticationService', 'DialogService', 'ErrorService', 
    'TextService', 'TranslationsService', 
    function($scope, $http, $location, $route, $routeParams, $q, 
    AccessService, AuthenticationService, DialogService, 
    ErrorService, TextService, TranslationsService) {
        console.log("translations controller");
        
        $scope.DialogService = DialogService;
        $scope.AccessService = AccessService;
        $scope.AuthenticationService = AuthenticationService;
        $scope.TextService = TextService;
        $scope.TranslationsService = TranslationsService;
        $scope.selected = {
            left : 0,
            right : 0
        };
        var newDocument = function() {
            console.log("New document");

            // default access rights for a new file
            TranslationsService.loadNew()
            .success(function() {
                AccessService.reset();
                $scope.trForm.$setPristine();
            })
            .error(
                function(data) {
                    ErrorService.addApiError(data);
                }
            )
            
        };
        var setDocument = function() {
            var toDocument = $routeParams.resource;
            if (!toDocument) {
                newDocument();
            }
            else {
                console.log("Load from file");
                TranslationsService.load(toDocument)
                .success(function(data) {
                    AccessService.load("/api/data/linkage", toDocument)
                    .error(function(err) {
                        ErrorService.addApiError(err);
                    });
                    $scope.trForm.$setPristine();
                })
                .error(function(error) {   // error function
                    ErrorService.addApiError(error);
                    console.log("error loading " + toDocument);
                });
            }
        };
        $scope.newButton = function() {
            if ($location.path() == "/translations")
                $route.reload();
            else 
                $location.path("/translations");
        };
        $scope.openDocument = function(selection) {
            var resourceName = decodeURIComponent(selection.split("/").pop());
            if (resourceName && resourceName != TranslationsService.resource) {
                $location.path( "/translations/" + resourceName );
            }
        };
        $scope.saveDocument = function() {
            var isNew = !TextService.resource;
            TranslationsService.save()
            .success(function() {
                if (isNew) {
                    AccessService.setResource(TextService._resourceApi, TextService._resource)
                    .save()
                    .error(function(error) {
                        ErrorService.addApiError(error);
                    });
                }
                $scope.trForm.$setPristine();
            })
            .error(function(error) {
                ErrorService.addApiError(error);
            });
        };
        var cleanLink = function(link) {
            return decodeURIComponent(link.replace(/^\/exist\/restxq\/api\/data\/original\//, ""))
        };
        $scope.setLinkLeft = function(link) {
            TranslationsService.setLeft(cleanLink(link))
            .then(function() { $scope.trForm.$setDirty(); });
        };
        $scope.setLinkRight = function(link) {
            TranslationsService.setRight(cleanLink(link))
            .then(function() { $scope.trForm.$setDirty(); });
        };
        $scope.dialogCancel = function() {};

        $scope.saveButtonText = function() {
            return this.trForm.$pristine ? ((!TranslationsService.resource) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };
        $scope.$on("draggable:end", function() {
            $scope.trForm.$setDirty();
        });
        setDocument();
    }
    ]
);
