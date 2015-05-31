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
    "ErrorService", "TranslationsService",
    function(ErrorService, TranslationsService) {
        return {
            restrict : "AE",
            scope : {
                ngModel : "=",
                selected : "="
            },
            link : function(scope, elem, attrs, ctrl) {
                scope.onDropStartBlocks = function($data, $event) {
                    // this function is called when a segment is dropped on an empty set of blocks
                    TranslationsService.insertEmptyBlock()
                        .insertIntoBlock($data, TranslationsService.blocks[0]);
                };
                scope.onDropInsertIntoBlock = function(block, $data, $event) {
                    // this function is called when a segment is dropped on an existing block
                    if (!TranslationsService.insertIntoBlock($data, block)) {
                        ErrorService.addAlert("The selected segment cannot be inserted in that position.\n" +
                            "(1) Segments must be inserted in order and \n" +
                            "(2) A translation block cannot contain segments that are both before and after an external pointer.\n"+
"(3) The segment must not already be in a block.", "info");
                    }
                };
                scope.onDragRemoveFromBlock = function(block, $data, $event) {
                    // this function is called when a segment is dragged away from the block
                    TranslationsService.removeFromBlock($data, block);
                };
                scope.insertBlock = function(block, direction) {
                    TranslationsService.insertEmptyBlock(block, direction);
                };
                scope.removeBlock = function(block) {
                    TranslationsService.removeBlock(block);
                };
            },
            transclude : false,
            templateUrl : "/js/translations/TranslationBlock.directive.html"
        } 
    }
]);
