/* Expanding array input directive
 *
 * Input that expands into an array
 *
 * Usage:
 * <div os-array-input="=arrayName" maxn="@number" name="@name" placeholder="@placeholder" 
 *      label="" />
 *
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein, efraim@opensiddur.org
 */
OpenSiddurClientApp.directive(
    'osArrayInput',
    [
    function() {
        return {
            restrict : 'AE',
            scope : {
                array : "=osArrayInput",
                name : "@",
                placeholder : "@",
                label : "@"
            },
            controller : ['$scope', function($scope) {
                
            }],
            link : function(scope, elem, attrs, ctrl) {

            },
            transclude : false,
            templateUrl : "/js/directives/osarrayinput.html"    
        }
    }
    ]
);
