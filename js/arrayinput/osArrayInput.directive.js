/* Expanding array input directive
 *
 * Input that expands into an array
 *
 * Usage:
 * <div os-array-input="=arrayName" maxn="@number" name="@name" placeholder="@placeholder" 
 *      label="" />
 *
 * Open Siddur Project
 * Copyright 2013,2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osArrayInputModule.directive(
    'osArrayInput',
    [
    function() {
        return {
            restrict : 'AE',
            scope : {
                array : "=osArrayInput",
                child : "@",
                name : "@",
                placeholder : "@",
                label : "@"
            },
            compile : function (elem, attrs) {
                if (attrs["child"]) {
                    $("input", elem).attr("data-ng-model", "element[child].__text");
                    $("input", elem).attr("data-ng-show", "$index == 0 || array[$index - 1][child].__text || element[child].__text");
                }
            },
            link : function(scope, elem, attrs, ctrl) {

            },
            transclude : false,
            templateUrl : "/js/arrayinput/osArrayInput.directive.html"    
        }
    }
    ]
);
