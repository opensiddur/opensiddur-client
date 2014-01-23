/* Open Siddur query box directive
 *
 * To use: set a watch on queryModel.q and run the search when it changes. 
 * 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osQueryBox',
        [
         function() {
             return {
                 restrict : 'AE',
                 scope : {
                     "queryModel" : "=",
                 },
                 controller: ['$scope', function ($scope) {
                    $scope.intermediate = "";
                    $scope.search = function() {
                        if ($scope.intermediate != $scope.queryModel.q)
                            $scope.queryModel.q = $scope.intermediate;
                    };
                 }],
                 transclude : false,
                 templateUrl : "/js/directives/osQueryBox.html"
             };
         }
         ]
);
