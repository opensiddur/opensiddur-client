/* edit segment properties dialog for simple editor
 *
 * Usage:
 * <os-edit-line-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editLineDialog" in EditorDataService
 *
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditLineModule.directive(
        'osEditLineDialogSimple',
        [
        'AccessService', 'EditorDataService',
        function( AccessService, EditorDataService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit line dialog (simple) controller");
                    $scope.AccessService = AccessService;
                    $scope.OKButton = function () {
                        $scope.line.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.line.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Line Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditLineDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditLineDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.line = EditorDataService.editLineDialog;
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editline/osEditLineDialogSimple.directive.html"
             };
        }
        ]
);


