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
                        query : { q : "" },             // active query
                        prevQuery : "",                 // last query
                        results : [],           // list of search results, JSON-ified li
                        done : false            // any more results available?
                    };
                    $scope.scroll = {
                        searchTimeOutSecs : 10,  // how much time to wait for a response before scrolling
                        nextStart : 1,
                        inProgress : 0           // timestamp of last scrolled search
                    };
                    $scope.nextSearch = function() {
                        console.log("nextSearch() called");
                        if (!$scope.search.done && 
                            (!$scope.scroll.inProgress || ($scope.scroll.inProgress - 
                                (new Date()/1000)) > $scope.scroll.searchTimeOutSecs )) {  
                            console.log("nextSearch() active: query=", $scope.search.query.q);
                            $scope.scroll.inProgress = new Date()/1000;
                            SearchService.query(
                                $scope.sourceKey, $scope.api, 
                                $scope.search.query.q, $scope.scroll.nextStart, 100
                            );
                        }
                    };
                    $scope.select = function(what) {
                        console.log("Selected:", what);
                        $scope.selection = what;
                    };
                    $scope.collapsed = 0;
                    $scope.toggleCollapse = function() {
                        $scope.collapsed = 1 - $scope.collapsed;
                    };
                    $scope.nextSearch();
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    // listen for search service
                    scope.$on('SearchService.complete_' + scope.sourceKey,
                        function(ev, results, start, maxResults) {
                            if (scope.search.prevQuery != scope.search.query.q) {
                                // new query
                                scope.search.prevQuery = scope.search.query.q;
                                scope.search.done = false;
                                scope.scroll.nextStart = 1;
                                scope.search.results = [];
                            }
                            console.log("Search complete received: results =", results, " start=", start, " maxResults=", maxResults, " length=", results.length);
                            if (start == 1) 
                                scope.search.results = results;        // clear previous results
                            else
                                scope.search.results = scope.search.results.concat(results);  // append to them
                            scope.search.done = results.length < 100;
                            scope.scroll.nextStart += 100;
                            scope.scroll.inProgress = 0;
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
