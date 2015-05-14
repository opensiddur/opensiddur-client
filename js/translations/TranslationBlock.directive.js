/* Translation block directive. 
    Represents a draggable block of aligned JSON segments

    Usage:
    &lt;os-translation-block
        ng-model="block"
        &gt;&lt;/os-translation-block&gt;

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
    
*/
translationsModule.directive("osTranslationBlock", [
    function() {
        return {
            restrict : "AE",
            scope : {
                ngModel : "=",
                selected : "="
            },
            link : function(scope, elem, attrs, ctrl) {
            },
            transclude : false,
            templateUrl : "/js/translations/TranslationBlock.directive.html"
        } 
    }
]);
