/* edit segment properties dialog for simple editor
 *
 * Usage:
 * <os-edit-div-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editDivDialog" in EditorDataService
 *
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditDivModule.directive(
        'osEditDivDialogSimple',
        [
        'AccessService', 'EditorDataService', 'LanguageService',
        function( AccessService, EditorDataService, LanguageService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit div dialog (simple) controller");
                    $scope.AccessService = AccessService;
                    $scope.LanguageService = LanguageService;
                    $scope.OKButton = function () {
                        $scope.div.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.div.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Division Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditDivDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditDivDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.div = EditorDataService.editDivDialog;
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editdiv/osEditDivDialogSimple.directive.html"
             };
        }
        ]
);


