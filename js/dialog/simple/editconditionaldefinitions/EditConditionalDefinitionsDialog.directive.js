/* edit conditional definitions dialog for simple editor
 *
 * Usage:
 * <os-edit-conditional-definitions-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editConditionalDefinitionsDialog" in EditorDataService
 *
 * Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditConditionalDefinitionsModule.directive(
        'osEditConditionalDefinitionsDialogSimple',
        [
        'ConditionalDefinitionsService', 'EditorDataService', 'LanguageService', 'TextService',
        function( ConditionalDefinitionsService, EditorDataService, LanguageService, TextService ) {
            var initScope = function(scope) {
                // reinitialize the scope
                scope.condDefs = EditorDataService.editConditionalDefinitionsDialog;
                scope.definitions = [];
                scope.queryModel = {
                    q: "",
                    intermediate : ""
                };
                scope.queryResults = [];
                scope.queryEnd = false;
                scope.selectedQueryResult = "";
                scope.loadedResource = "";
            };

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

                    initScope($scope);

                    $scope.LanguageService = LanguageService;


                    $scope.queryButton = function(query) {
                      // this function is called when a new query is initiated
                        var doContinue = true;
                        if ($scope.loadedResource != "" && $scope.definitionForm.$dirty) {
                            doContinue = confirm("Continue without saving?")
                        }
                        if (doContinue) {
                            ConditionalDefinitionsService.query(query).then(function (results) {
                                $scope.queryResults = results;
                            });
                        }
                    };

                    $scope.resultSelected = function(conditionalUri) {
                        var resourceSplits = conditionalUri.split("/");
                        var resourceToLoad = resourceSplits[resourceSplits.length - 1];
                        ConditionalDefinitionsService.load(resourceToLoad).then(
                            function(defs) {
                                // defs contains a deep copy of the definitions for the current loaded resource
                                $scope.loadedResource = resourceToLoad;
                                $scope.definitions = $.extend(true, {}, defs);
                            }
                        )
                    };

                    $scope.defaultsByType = function(type) {
                        return (type == "yes-no-maybe") ?
                            ["YES", "NO", "MAYBE"] : ["ON", "OFF"];

                    };

                    /* feature editing*/
                    $scope.addFeature = function(def, position) {
                        var blankFeature = {
                            name : "",
                            description : {
                                lang : "en",
                                desc : ""
                            },
                            type : "yes-no-maybe",
                            default : {
                                value : "MAYBE",
                                expression : ""
                            }
                        };
                        if (!("feature_asArray" in def)) {
                            def["feature_asArray"] = [blankFeature];
                        }
                        else if (position == 0) {
                            def.feature_asArray.unshift(blankFeature);
                        }
                        else
                            def.feature_asArray.push(blankFeature);
                    };

                    $scope.removeFeature = function(def, f) {
                        var indexToRemove = def.feature_asArray.indexOf(f);
                        def.feature_asArray.splice(indexToRemove, 1);
                    };

                    /* buttons */

                    var save = function() {
                        if ($scope.loadedResource != "") {
                            ConditionalDefinitionsService.set($scope.loadedResource, $scope.definitions);
                            ConditionalDefinitionsService.saveAll().then(
                                function () {
                                },
                                function (err) {
                                    ErrorService.add(err.data);
                                }
                            );
                        }
                    };

                    $scope.SaveButton = function() {
                        save();
                    };

                    $scope.OKButton = function () {
                        save();
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        //$scope.condDefs.callback(false);

                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };

                    $scope.localConditional = function() {
                        // load the local type
                        ConditionalDefinitionsService.loadLocal().
                            then(
                                function(defs) {
                                    // defs contains a deep copy of the definitions for the current loaded resource
                                    var localResource = TextService.localSettings()["local-conditional-document"];
                                    $scope.resultSelected(localResource);
                                    console.log("definitions:", $scope.definitions);
                                }
                        );
                    };

                    $scope.newConditional = function(conditionalTypeName) {
                        // make a new conditional with the given name
                        ConditionalDefinitionsService.newDocument(conditionalTypeName).then(
                            function() {
                                return $scope.resultSelected(conditionalTypeName);
                            }
                        );
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
                        initScope(scope);
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editconditionaldefinitions/EditConditionalDefinitionsDialog.directive.html"
             };
        }
        ]
);


