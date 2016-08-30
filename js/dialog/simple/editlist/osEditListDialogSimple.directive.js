/* edit list properties dialog for simple editor
 *
 * Usage:
 * <os-edit-list-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editListDialog" in EditorDataService
 *
 * Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditListModule.directive(
        'osEditListDialogSimple',
        [
        'AccessService', 'EditorDataService', 'ListService',
        function( AccessService, EditorDataService, ListService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit list dialog (simple) controller");
                    $scope.list = {};
                    $scope.writable = AccessService.access.write;
                    $scope.OKButton = function () {
                        $scope.list.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.list.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };

                    $scope.DeleteList = function(layerId) {
                        ListService.removeListLayer(layerId);
                        $scope.list.allListIds = ListService.getListLayers();
                        $scope.list.updateAllCallback();
                    };

                    $scope.ListExists = function(newLayerId) {
                        if ("list" in $scope && "allListIds" in $scope.list)
                            return $scope.list.allListIds.indexOf(newLayerId) > 0;
                        else return false;
                    };
                    $scope.RenameList = function(oldLayerId, newLayerId) {
                        ListService.renameListLayer(oldLayerId, newLayerId);
                        $scope.list.allListIds = ListService.getListLayers();
                        $scope.list.id = newLayerId;
                        $scope.list.updateAllCallback();
                    };
                    $scope.NewList = function(newLayerId) {
                        ListService.addListLayer(newLayerId);
                        $scope.list.allListIds = ListService.getListLayers();
                        $scope.list.id = newLayerId;
                        $scope.list.updateAllCallback();
                    };

                    if (!$scope.title) {
                        $scope.title = "List Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditListDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditListDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.list = EditorDataService.editListDialog;
                        scope.list.allListIds = ListService.getListLayers();
                        scope.list.idOther = "";
                        scope.writable = AccessService.access.write;
                        scope.$apply();

                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editlist/osEditListDialogSimple.directive.html"
             };
        }
        ]
);


