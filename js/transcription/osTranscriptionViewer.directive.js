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
osTranscriptionWindowModule.directive(
        'osTranscriptionViewer',
        [
        'PageImageUrlService', 'SourceService', 'TranscriptionViewerService', 'ErrorService',
        function( PageImageUrlService, SourceService, TranscriptionViewerService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    name : "@",
                    height : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In transcription viewer controller");
                    $scope.TranscriptionViewerService = TranscriptionViewerService;

                    $scope.panzoom = {
                        config : {},
                        model : {}
                    };

                 }],
                 link: function(scope, elem, attrs, ctrl) {
                     TranscriptionViewerService.register(scope.name);
                    scope.$watch("source", function(newSource) {
                        if (newSource) {
                            TranscriptionViewerService.setSource(scope.name, newSource);
                        }
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/transcription/osTranscriptionViewer.directive.html"
             };
        }
        ]
);


