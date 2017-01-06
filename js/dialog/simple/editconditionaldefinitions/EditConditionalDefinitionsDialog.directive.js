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
        'ConditionalDefinitionsService', 'EditorDataService', 'LanguageService', 'TextService',
        function( ConditionalDefinitionsService, EditorDataService, LanguageService, TextService ) {
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


                    $scope.LanguageService = LanguageService;

                    $scope.queryResults = [];
                    $scope.selectedQueryResult = "";
                    $scope.queryEnd = false;
                    $scope.queryButton = function(query) {
                      // this function is called when a new query is initiated
                        ConditionalDefinitionsService.query(query).
                            then(function(results) {
                                $scope.queryResults = results;
                        });
                    };

                    $scope.definitions = [];
                    $scope.resultSelected = function(conditionalUri, description) {
                        var resourceSplits = conditionalUri.split("/");
                        ConditionalDefinitionsService.load(resourceSplits[resourceSplits.length - 1]).then(
                            function(defs) {
                                // defs contains the definitions for the current loaded resource
                                $scope.definitions = defs;
                            }
                        )
                    };

                    $scope.defaultsByType = function(type) {
                        return (type == "yes-no-maybe") ?
                            ["YES", "NO", "MAYBE"] : ["ON", "OFF"];

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


