/* Transcription window
 *
 * Usage:
 * <os-transcription-window active=""/>
 * active specifies whether the window is currently visible
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTranscriptionWindowModule.directive(
        'osTranscriptionWindow',
        [
        'TextService', 'SourceService', 'TranscriptionViewerService', 'ErrorService',
        function( TextService, SourceService, TranscriptionViewerService, ErrorService ) {
            return {
                restrict : 'AE',
                controller: ['$scope', function ($scope) {
                    console.log("In transcription window controller");
                    $scope.TranscriptionViewerService = TranscriptionViewerService;
                    $scope.sources = [];
                    $scope.refresh = function() {
                        $scope.sources = TextService.sources();
                        if ($scope.sources.length > 0) {
                            $scope.currentSource = $scope.sources[0];
                            $scope.setSource();
                        }
                    };
                    $scope.setSource = function() {
                        TranscriptionViewerService.setSource($scope.currentSource.source).
                            then(function() {
                            TranscriptionViewerService.setPage(parseInt($scope.currentSource.scope.fromPage));
                        });
                    };
                    $scope.currentSource = null;

                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.$watch("TranscriptionViewerService.shown", function(active) {
                        if (active) {
                            // just activated
                            scope.refresh();
                        }
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/transcription/osTranscriptionWindow.directive.html"
             };
        }
        ]
);


