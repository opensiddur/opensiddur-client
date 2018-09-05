/* edit settings properties dialog for simple editor
 *
 * Usage:
 * <os-edit-settings-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editSettingsDialog" in EditorDataService
 *
 * Copyright 2016,2018 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditSettingsModule.directive(
        'osEditSettingsDialogSimple',
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
                    console.log("In edit settings dialog (simple) controller");
                    $scope.query = {
                      q : "",
                      start : 1,
                      "max-results" : 100
                    };
                    $scope.newSetting = {
                      type : "",
                      name : "",
                      state : ""
                    };

                    $scope.stateValue = "";       // this is a temporary store for the state
                    $scope.setButton = function() {
                      $scope.settings.active.push(angular.copy($scope.newSetting));
                    };
                    $scope.unsetButton = function(toUnset) {
                      $scope.settings.active.splice($scope.settings.active.indexOf(toUnset),1);
                    };
                    $scope.OKButton = function () {
                        $scope.settings.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.settings.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Edit Settings";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditSettingsDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditSettingsDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.settings = EditorDataService.editSettingsDialog;
                        if (!("active" in scope.settings)) {
                          scope.settings.active = [];
                        } 
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editsettings/EditSettingsDialog.directive.html"
             };
        }
        ]
);


