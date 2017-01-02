/* edit conditional definitions dialog for simple editor
 *
 * Usage:
 * <os-edit-conditional-definitions-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editAnnotationDialog" in EditorDataService
 *
 * Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditConditionalDefinitionsModule.directive(
        'osEditConditionalDefinitionsDialogSimple',
        [
        'EditorDataService', 'TextService',
        function( EditorDataService, TextService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit conditional definitions dialog (simple) controller");

                    $scope.queryModel = { q: "" };
                    $scope.queryButton = function(query) {
                      // this function is called when a new query is initiated
                        console.log("query called:", query);
                    };

                    $scope.OKButton = function () {
                        $scope.note.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.note.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Conditional Definitions Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditConditionalDefinitionsDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditConditionalDefinitionsDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.condDefs = EditorDataService.editConditionalDefinitionsDialog;

                        //scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editconditionaldefinitions/EditConditionalDefinitionsDialog.directive.html"
             };
        }
        ]
);


