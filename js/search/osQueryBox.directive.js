/* Open Siddur query box directive
 *
 * To use: set a watch on queryModel.q and run the search when it changes *or* use the callback function,
 * which takes a single parameter: callback(searchQuery)
 * 
 * Open Siddur Project
 * Copyright 2013-2014,2017 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osSearchModule.directive(
        'osQueryBox',
        [
         function() {
             return {
                 restrict : 'AE',
                 scope : {
                     "queryModel" : "=",
                     "callback" : "="
                 },
                 controller: ['$scope', function ($scope) {
                    $scope.intermediate = "";
                    $scope.search = function() {
                        if ($scope.intermediate != $scope.queryModel.q) {
                            $scope.queryModel.q = $scope.intermediate;
                            if (typeof $scope.callback !== 'undefined') {
                                $scope.callback($scope.intermediate);
                            }
                        }
                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/search/osQueryBox.directive.html"
             };
         }
         ]
);
