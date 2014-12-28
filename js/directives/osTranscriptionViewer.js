/* Zoomable transcription viewer
 *
 * Usage:
 * <os-transcription-viewer source="" page="" name="" height=""/>
 * source is the name of the bibliographic source (resource)
 * page is the page (index) number
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osTranscriptionViewer',
        [
        'PageImageUrlService', 'SourceService', 'ErrorService',
        function( PageImageUrlService, SourceService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    source : "=",
                    page : "=",
                    name : "@",
                    height : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In transcription viewer controller");
                    $scope.panzoom = {
                        config : {},
                        model : {}
                    };
                    $scope.imageUrl = "";
                    $scope.pageUp = function() {
                        $scope.page += 1;
                        $scope.loadPageImage();
                    };
                    $scope.pageDown = function() {
                        $scope.page = ($scope.page > 1) ? $scope.page - 1 : 1;
                        $scope.loadPageImage();
                    };
                    $scope.loadPageImage = function() {
                        $scope.imageUrl = PageImageUrlService.getUrl($scope.sourceArchive, $scope.archiveId, $scope.page);
                    };
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.$watch("source", function(newSource) {
                        if (newSource) {
                            SourceService.load(newSource).then(function() {
                                console.log("Source loaded");
                                scope.sourceArchive = SourceService._content.biblStruct.idno._type;
                                scope.archiveId = SourceService._content.biblStruct.idno.__text;
                                scope.page = scope.page;
                                scope.loadPageImage();
                            });
                        }
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osTranscriptionViewer.html"
             };
        }
        ]
);


