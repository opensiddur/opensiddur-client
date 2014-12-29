/* Transcription window
 *
 * Usage:
 * <os-transcription-window active=""/>
 * active specifies whether the window is currently visible
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osTranscriptionWindow',
        [
        'TextService', 'SourceService', 'ErrorService',
        function( TextService, SourceService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    active : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In transcription window controller");

                    $scope.sources = [];
                    $scope.viewer = {
                        source : "",
                        page : 1
                    };
                    $scope.refresh = function() {
                        $scope.sources = TextService.sources();
                        if ($scope.sources.length > 0) {
                            $scope.currentSource = $scope.sources[0];
                            $scope.setSource();
                        }
                    };
                    $scope.setSource = function() {
                        $scope.viewer.source = $scope.currentSource.source;
                        $scope.viewer.page = parseInt($scope.currentSource.scope.fromPage);
                    };
                    $scope.currentSource = null;

                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.$watch("active", function(active) {
                        if (active) {
                            // just activated
                            scope.refresh();
                        }
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osTranscriptionWindow.html"
             };
        }
        ]
);


