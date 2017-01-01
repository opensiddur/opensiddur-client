/* edit anchor properties dialog for simple editor
 *
 * Usage:
 * <os-edit-anchor-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editAnchorDialog" in EditorDataService
 *
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditAnchorModule.directive(
        'osEditAnchorDialogSimple',
        [
        'EditorDataService',
        function( EditorDataService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit anchor dialog (simple) controller");

                    $scope.OKButton = function () {
                        $scope.anchor.callback("ok");
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.anchor.callback("cancel");
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Anchor Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditAnchorDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditAnchorDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.anchor = EditorDataService.editAnchorDialog;

                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editanchor/EditAnchorDialog.directive.html"
             };
        }
        ]
);


