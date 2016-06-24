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
        'TextService', 'SourceService', 'TranscriptionViewerService', 'TranscriptionWindowService', 'ErrorService',
        function( TextService, SourceService, TranscriptionViewerService, TranscriptionWindowService, ErrorService ) {
            return {
                restrict : 'AE',
                controller: ['$scope', function ($scope) {
                    console.log("In transcription window controller");
                    $scope.TranscriptionViewerService = TranscriptionViewerService;
                    $scope.TranscriptionWindowService = TranscriptionWindowService;
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.$watch("TranscriptionViewerService.viewer['transcription-window'].shown", function(active) {
                        if (active) {
                            // just activated
                            TranscriptionWindowService.refresh();
                        }
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/transcription/osTranscriptionWindow.directive.html"
             };
        }
        ]
);


