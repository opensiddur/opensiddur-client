/* Open Siddur search box directive 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osSearchBox',
        [
         '$http',
         'SearchService',
         function($http, SearchService) {
             return {
                 restrict : 'A',
                 scope : {
                     sourceKey : "@sourceKey",
                     api : "@osSearchBox",
                     query : "=",
                     results : "="
                 },
                 controller: ['$scope', function ($scope) {
                     $scope.errorMessage = "";
                     $scope.search = function() {
                             console.log("Pressed search");
                             SearchService.query($scope.sourceKey, $scope.api, $scope.query.q)
                     }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                     // link function 
                     // here you should register listeners
                 },
                 transclude : true,
                 templateUrl : "/js/directives/ossearchbox.html"
             };
         }
         ]
);
