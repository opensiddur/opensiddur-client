/* Transcription window
 *
 * Usage:
 * <os-transcription-window model="" />
 * model specifies where the data content is coming from (containing tei:bibl/tei:biblScope) 
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osTranscriptionWindow',
        [
        'RestApi', 'ErrorService',
        function( RestApi, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    model : "=",
                    active : "="
                },
                controller: ['$scope', 'RestApi', 'XsltService', function ($scope, RestApi, XsltService) {
                    console.log("In transcription window controller");
                    var x2js_simple = new X2JS({ "arrayAccessForm" : "property", "emptyNodeForm" : "text" });   


                    /* read the content and find sources from tei:bibl/tei:ptr[@type=bibl]; 
                     * read the sources and find their titles, concat that to any scope
                     * put the list in $scope.sources as 
                     * { 'index' :, 'uri' : , 'title':, 'scanUrl' :,  'scopeStart':, 'scopeEnd': }
                     */
                    $scope.sources = [];
                    $scope.refresh = function() {
                        var src = XsltService.transformString("extractTranscriptionLinks", $scope.model);
                        $scope.sources = x2js_simple.xml2json(src).sources.source_asArray.map(
                                function (src, idx) {
                                    src.index = idx;
                                    return src;
                                }
                            );
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


