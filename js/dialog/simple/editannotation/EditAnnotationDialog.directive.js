/* edit annotation properties dialog for simple editor
 *
 * Usage:
 * <os-edit-annotation-simple-dialog on-ok="" on-close="" title="" name=""  />
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 * Data is transfered via "editAnnotationDialog" in EditorDataService
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
dialogSimpleEditAnnotationModule.directive(
        'osEditAnnotationDialogSimple',
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
                    console.log("In edit annotation dialog (simple) controller");
                    $scope.LanguageService = LanguageService;
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
                        $scope.title = "Annotation Properties";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osEditAnnotationDialogSimple").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osEditAnnotationDialogSimple").attr("id", scope.name);

                    elem.on("shown.bs.modal", function () {
                        scope.note = EditorDataService.editAnnotationDialog;
                        scope.$apply();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/dialog/simple/editannotation/EditAnnotationDialog.directive.html"
             };
        }
        ]
);


