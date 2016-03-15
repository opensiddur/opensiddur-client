/* edit conditions properties dialog for simple editor
 *
 * Usage:
 * <os-edit-conditions-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editConditionsDialog" in EditorDataService
 *
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditConditionsModule.directive(
        'osEditConditionsDialogSimple',
        [
        'EditorDataService', 'ConditionalsService', 'LanguageService', 'TextService', 
        function( EditorDataService, ConditionalsService, LanguageService, TextService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit conditions dialog (simple) controller");
                    $scope.exampleButtonText = {
                      false : "Examples >",
                      true : "< Examples"
                    };
                    $scope.exampleButtonState = false;
                    $scope.toggleExamples = function() {
                      $scope.exampleButtonState = !$scope.exampleButtonState;
                    };
                    $scope.parseError = undefined;
                    $scope.parseSuccess = function() {
                      try {
                        $scope.parseError = "";
                        return ConditionalsService.parse($scope.conditions.active[0].__text);
                      }
                      catch (e) {
                        $scope.parseError = e.message;
                      }
                    };
                    $scope.RemoveButton = function() {
                        $scope.conditions.callback("remove");
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.OKButton = function () {
                        $scope.conditions.callback("ok");
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.conditions.callback("cancel");
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Edit Conditions";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditConditionsDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditConditionsDialogSimple").attr("id", scope.name);

                    scope.LanguageService = LanguageService;

                    elem.on("shown.bs.modal", function () {
                        scope.parseError = undefined;
                        scope.conditions = EditorDataService.editConditionsDialog;
                        if (!("active" in scope.conditions)) {
                          scope.conditions.active = [];
                        } 
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editconditions/EditConditions.directive.html"
             };
        }
        ]
);

