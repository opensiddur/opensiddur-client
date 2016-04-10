/* edit link dialog for simple editor
 *
 * Usage:
 * <os-edit-link-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editLinkDialog" in EditorDataService
 *
 * Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditLinkModule.directive(
        'osEditLinkDialogSimple',
        [
        'EditorDataService', 'TextService', 'ErrorService',
        function( EditorDataService, TextService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit link dialog (simple) controller");
                    $scope.selectLinkType = function(linkType) {
                        if (linkType == "internal") {
                            $scope.link.dataTargetBase = "";
                            $scope.external.content = TextService.syncFlat();
                        }
                    };
                    $scope.resetExternal = function() {
                        $scope.external = {
                            selection : "/api/data/original/" + $scope.link.dataTargetBase,
                            content : TextService.syncFlat()
                        };
                    };
                    $scope.selectFile = function(fileSelection, clearIds) {
                        console.log("Selected: " + fileSelection);
                        $scope.link.dataTargetBase = fileSelection.replace("/exist/restxq/api/data/original/", "");
                        TextService.get("/api/data/original", decodeURIComponent($scope.link.dataTargetBase))
                        .then(function(data) {
                            $scope.external.content = data;
                            if (clearIds) {
                                $scope.link.dataTargetFragment = "";
                            }
                        },
                        function (err) {
                            ErrorService.addApiError(err);
                        });
                    };
                    $scope.OKButton = function () {
                        $scope.link.callback("ok");
                        $scope.onOk()();
                        $scope.resetExternal();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.link.callback("close");
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.RefreshButton = function() {
                        $scope.link.callback("refresh");
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Link Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditLinkDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditLinkDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.link = EditorDataService.editLinkDialog;
                        scope.resetExternal();
                        if (scope.link.dataTargetBase) {
                            scope.selectFile(scope.link.dataTargetBase, false);
                        }
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editlink/osEditLinkDialogSimple.directive.html"
             };
        }
        ]
);


