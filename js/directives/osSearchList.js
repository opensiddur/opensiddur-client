/* Query box and list box directive
 *
 * Usage:
 * <os-search-list api="" selection=""/>
 *
 * Copyright 2013 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osSearchList',
        [
        'RestApi',
        function( RestApi ) {
            return {
                restrict : 'AE',
                scope : {
                    api : "=",
                    selection : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In search list controller");
                    $scope.query = { 
                        q : "", 
                        start : 1, 
                        'max-results' : 100 
                    };
                    $scope.results = [];
                    $scope.resultsEnd = false; 
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.$watch("query.q", function( q ) {
                        // query has changed, rerun search
                        scope.results = [];

                        RestApi.query({
                                api : scope.api, 
                                q : q, 
                                start : 1, 
                                'max-results' : 100
                            },
                            function( searchResults ) {
                                scope.query.start += 100;
                                scope.results = scope.results.concat( searchResults );
                                scope.resultsEnd = searchResults.length < 100;
                            }
                        );
                    });
                    scope.$watch("resultsEnd", function( e ) {
                        // reached end of query
                        if (e) {
                            RestApi.query({
                                api : scope.api, 
                                q : scope.query.q, 
                                start : scope.query.start, 
                                'max-results' : scope.query['max-results']},
                                function( searchResults ) {
                                    scope.query.start += 100;
                                    scope.results = scope.results.concat( searchResults );
                                    scope.resultsEnd = searchResults.length < 100;
                                }
                            );
                        } 
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osSearchList.html"
             };
        }
        ]
);

