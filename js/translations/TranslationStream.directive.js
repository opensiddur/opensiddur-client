/* Translation stream directive. 
    Represents a draggable stream of elements of the JSON form of a segment

    Usage:
    &lt;os-translation-stream 
        ng-model="array-of-segments"
        selected="variable-to-hold-selected-segment"
        &gt;&lt;/os-translation-stream&gt;

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
    
*/
translationsModule.directive("osTranslationStream", [
    function() {
        return {
            restrict : "AE",
            scope : {
                ngModel : "=",
                selected : "="
            },
            controller : ['$scope', function($scope) {
                $scope.select = function(idx) {
                    $scope.selected = idx;
                }
            }],
            link : function(scope, elem, attrs, ctrl) {
            },
            transclude : false,
            templateUrl : "/js/translations/TranslationStream.directive.html"
        } 
    }
]);
