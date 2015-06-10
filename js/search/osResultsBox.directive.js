/* Results box directive
 * Display results, notify the caller of the selection and whether the end of the results set has been reached 
 *
 * Usage:
 * <div data-os-results-box=""
        results="" 
        selection=""
        selection-description=""
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
osSearchModule.directive(
        'osResultsBox',
        [
        function( ) {
            return {
                restrict : 'AE',
                scope : {
                    results : "=",
                    selection : "=",
                    selectionDescription : "=?",
                    end : "="
                },
                link: function(scope, elem, attrs) {
                    scope.parentElement = elem;
                },
                controller: ['$scope', function ($scope) {
                    console.log("In results box controller");
                    if (!$scope.selectionDescription) $scope.selectionDescription = "";
                    $scope.endReached = function() {
                        console.log("endReached() called");
                        if (!$scope.end) { 
                            $scope.end = true;
                        }
                    };
                    $scope.select = function(what, title, index) {
                        console.log("Selected:", what);
                        // clear existing selections
                        $scope.parentElement.find("tr").removeClass("info");
                        // set the selected class
                        $scope.parentElement.find("tr").eq(index).addClass("info"); 

                        $scope.selection = what;
                        $scope.selectionDescription = title;
                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/search/osResultsBox.directive.html"
             };
        }
        ]
);
