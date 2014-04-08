/* Results box directive
 * Display results, notify the caller of the selection and whether the end of the results set has been reached 
 *
 * Usage:
 * <div data-os-results-box=""
        results="" 
        selection=""
        end="" />
 * 
 * end : Boolean => end of the scroll has been reached. Set this to false when you add more search results.
 *      keep it true if there are no more search results
 * 
 * The search results should be in the form:
 * [{   title : "", 
        url : ""
        contexts : [{
                        previous : "",
                        match : "",
                        following : ""   
                   },...] 
    }, ...]
 *
 * Selection will be a url.
 *
 * Copyright 2013-2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osResultsBox',
        [
        function( ) {
            return {
                restrict : 'AE',
                scope : {
                    results : "=",
                    selection : "=",
                    end : "="
                },
                link: function(scope, elem, attrs) {
                    scope.parentElement = elem;
                },
                controller: ['$scope', function ($scope) {
                    console.log("In results box controller");
                    $scope.endReached = function() {
                        console.log("endReached() called");
                        if (!$scope.end) { 
                            $scope.end = true;
                        }
                    };
                    $scope.select = function(what, index) {
                        console.log("Selected:", what);
                        // clear existing selections
                        $scope.parentElement.find("tr").removeClass("info");
                        // set the selected class
                        $scope.parentElement.find("tr").eq(index).addClass("info"); 

                        $scope.selection = what;
                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/directives/osResultsBox.html"
             };
        }
        ]
);
