/* edit segment properties dialog for simple editor
 *
 * Usage:
 * <os-edit-segment-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editSegmentDialog" in EditorDataService
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osEditSegmentDialogSimple',
        [
        'EditorDataService', 'LanguageService',
        function( EditorDataService, LanguageService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In edit segment dialog (simple) controller");
                    $scope.LanguageService = LanguageService;
                    $scope.OKButton = function () {
                        $scope.seg.callback(true);
                        $scope.onOk()();
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.seg.callback(false);
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Segment Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditSegmentDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditSegmentDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.seg = EditorDataService.editSegmentDialog;
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osEditSegmentDialogSimple.html"
             };
        }
        ]
);


