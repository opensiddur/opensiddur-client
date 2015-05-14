/* Translation segment
    Represents the JSON form of a segment

    Usage:
    &lt;os-translation-segment
        ng-model="segment"
        &gt;&lt;/os-translation-segment&gt;

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
    
*/
translationsModule.directive("osTranslationSegment", [
    function() {
        return {
            restrict : "AE",
            scope : {
                ngModel : "="
            },
            link : function(scope, elem, attrs, ctrl) {
            },
            transclude : false,
            templateUrl : "/js/translations/TranslationSegment.directive.html"
        } 
    }
]);
