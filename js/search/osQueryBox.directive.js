/* Open Siddur query box directive
 *
 * To use: set a watch on queryModel.q and run the search when it changes *or* use the callback function,
 * which takes a single parameter: callback(searchQuery)
 * queryModel.intermediate will contain the current content of the search box
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
                     "queryModel" : "=?",
                     "callback" : "=?"
                 },
                 controller: ['$scope', function ($scope) {
                     $scope.queryModel.intermediate = "";
                     $scope.search = function() {
                        if (typeof $scope.queryModel !== 'undefined' && $scope.queryModel.intermediate != $scope.queryModel.q) {
                            // set the queryModel variable if it hasn't changed and is defined
                            $scope.queryModel.q = $scope.queryModel.intermediate;
                        }
                        if (typeof $scope.callback !== 'undefined') {
                            // call the callback if it is available
                            $scope.callback($scope.queryModel.intermediate);
                        }

                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/search/osQueryBox.directive.html"
             };
         }
         ]
);
