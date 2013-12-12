/* List box directive
 * List box that includes a search box, API call, and exports a selection
 *
 * Usage:
 * <div data-os-list-box="title" 
        source-key="unique key for search API" 
        api="list/search api to use" 
        selection="where to store API of selection"/>
 * 
 * Copyright 2013 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osListBox',
        [
        '$http',
        'SearchService',
        function($http, SearchService) {
            return {
                restrict : 'A',
                scope : {
                    sourceKey : "@",
                    title : "@osListBox",
                    api : "@",
                    selection : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In list box controller");
                    $scope.errorMessage = "";
                    $scope.search = {
                        query : "",             // active query
                        results : [],           // list of search results, JSON-ified li
                        done : false            // any more results available?
                    };
                    $scope.nextSearch = function() {
                        console.log("nextSearch() called");
                        if (!$scope.search.done) {  
                            console.log("nextSearch() active");
                            SearchService.query(
                                $scope.sourceKey, $scope.api, 
                                $scope.search.query, $scope.search.results.length + 1, 100
                            );
                        }
                    };
                    $scope.select = function(what) {
                        console.log("Selected:", what);
                        $scope.selection = what;
                    };
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    // listen for search service
                    scope.$on('SearchService.complete_' + scope.sourceKey,
                        function(ev, results, start, maxResults) {
                            console.log("Search complete received: results =", results, " start=", start, " maxResults=", maxResults);
                            if (start == 1) 
                                scope.search.results = results;        // clear previous results
                            else
                                scope.search.results = scope.search.results.concat(results);  // append to them
                            scope.search.done = results.length < 100;
                        }
                    );
                    scope.$on('ListBox.Append_' + scope.sourceKey,
                        function(ev, results) {
                            console.log("Manual append to list box =", results);
                            scope.search.results = scope.search.results.concat(results);  // append to them
                            // resort list
                            scope.search.results.sort(function(a, b) { return a.a.__text > b.a.__text ? 1 : -1});
                        }
                    );
                 },
                 transclude : true,
                 templateUrl : "/js/directives/oslistbox.html"
             };
        }
        ]
);
