/* edit link dialog for simple editor
 *
 * Usage:
 * <os-edit-link-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editLinkDialog" in EditorDataService
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osEditLinkDialogSimple',
        [
        'EditorDataService', 'ListingService', 'TextService', 'ErrorService',
        function( EditorDataService, ListingService, TextService, ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', 'ListingService', function ($scope, ListingService) {
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
                        .success(function(data) {
                            $scope.external.content = data;
                            if (clearIds) {
                                $scope.link.dataTargetFragment = "";
                            }
                        })
                        .error(function (err) {
                            ErrorService.addApiError(err);
                        });
                    };
                    $scope.OKButton = function () {
                        $scope.link.callback(true);
                        $scope.onOk()();
                        $scope.resetExternal();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.link.callback(false);
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
                 templateUrl : "/js/directives/osEditLinkDialogSimple.html"
             };
        }
        ]
);


