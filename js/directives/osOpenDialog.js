/* Open dialog
 *
 * Usage:
 * <os-open-dialog api="" selection="" title="" name=""/>
 * name is an id, title is the header text
 *
 * Copyright 2013-2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osOpenDialog',
        [
        'RestApi',
        function( RestApi ) {
            return {
                restrict : 'AE',
                scope : {
                    api : "=",
                    selection : "=",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In open dialog controller");
                    $scope.query = { 
                        q : "", 
                        start : 1, 
                        'max-results' : 100 
                    };
                    $scope.OKButton = function() {
                        $scope.selection = $scope.lastSelected;
                        $("#"+$scope.name).modal('hide');
                    }; 
                    $scope.CloseButton = function() {
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.lastSelected = "";
                    $scope.inProgress = false;
                    $scope.results = [];
                    $scope.resultsEnd = true;       // force no scrolling until first load 
                    if (!$scope.title) {
                        $scope.title = "Open";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osOpenDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osOpenDialog").attr("id", scope.name);

                    var addResults =
                        function( searchResults ) { 
                            // searchResults is some kind of promise object 
                            // there's got to be a better way to do this:
                            for (var i=0; i < searchResults.length; i++)
                                scope.results = scope.results.concat( searchResults[i] );
                            scope.resultsEnd = searchResults.length < scope.query['max-results'];
                            scope.query.start += scope.query['max-results'];
                            scope.inProgress = false;
                            console.log("at end of addresults, query.start=", scope.query.start);
                        };
                    var newSearch = function( ) {
                        // query has changed, rerun search
                        scope.results = [];
                        scope.query.start = 1;
                        scope.resultsEnd = true;

                        if (scope.api && !scope.inProgress) {
                            scope.inProgress = true;
                            RestApi[scope.api].query({
                                    q : scope.query.q, 
                                    start : 1, 
                                    'max-results' : 100
                                },
                                addResults
                            );
                        }
                    }
                    
                    scope.$watch("api", newSearch);

                    scope.$watch("query.q", newSearch);

                    scope.$watch("resultsEnd", function( e ) {
                        // reached end of query
                        if (scope.api && !scope.inProgress && e ) {
                            console.log("resultsEnd. query.start=", scope.query.start);

                            scope.inProgress = true;
                            RestApi[scope.api].query({
                                q : scope.query.q, 
                                start : scope.query.start, 
                                'max-results' : scope.query['max-results']},
                                addResults
                            );
                        } 
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osOpenDialog.html"
             };
        }
        ]
);

