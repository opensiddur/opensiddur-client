/* Annotations settings dialog
 * Allows selection of which annotations should be included in this and included files
 *
 * Usage:
 * <os-annotation-settings-dialog on-ok="" on-close="" title="" name=""/>
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osDialogSettingsAnnotationsModule.directive(
        'osAnnotationSettingsDialog',
        [
        'AccessService', 'ErrorService', 'SettingsService',
        function( AccessService, ErrorService, SettingsService ) {
            return {
                restrict : 'AE',
                scope : {
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In annotation settings dialog controller");

                    $scope.selectActiveAnnotation = function(annotation) {
                        $scope.selectedAnnotation = annotation;
                    };

                    $scope.setAnnotationState = function(ann, newState) {
                        ann.state = newState;
                    };

                    $scope.removeSelectedAnnotation = function() {
                        $scope.activeAnnotations.annotations.annotation_asArray = 
                            $scope.activeAnnotations.annotations.annotation_asArray.filter(function(a) {
                                return a.name != $scope.selectedAnnotation.name;
                            });
                        $scope.selectedAnnotation = null;
                    };

                    $scope.addSelectedNewAnnotation = function(newState) {
                        console.log("Adding " + $scope.selectedNewAnnotation);
                        var annName = decodeURIComponent($scope.selectedNewAnnotation.split("/").pop());
                        var newAnn = { name : annName , state : newState };
                        // if the annotation of the same name already exists, remove it
                        $scope.activeAnnotations.annotations.annotation_asArray = 
                            $scope.activeAnnotations.annotations.annotation_asArray.filter(function(a) {
                                return a.name != annName;
                            });

                        $scope.activeAnnotations.annotations.annotation_asArray.push(newAnn);
                    };
                    $scope.OKButton = function () {
                        $scope.activeAnnotations.annotations.annotation_asArray = 
                            $scope.activeAnnotations.annotations.annotation_asArray.map(function(a) {
                                a.name = encodeURIComponent(a.name);
                                return a;
                            });
                        $scope.activeAnnotations.annotations.annotation = $scope.activeAnnotations.annotations.annotation_asArray;
                        SettingsService.setActiveAnnotations($scope.activeAnnotations);
                        $scope.onOk()($scope.activeAnnotations);
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Annotation Settings";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h4").attr("id", scope.name + "_label");
                    elem.find(".osSettingsAnnotationsDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osSettingsAnnotationsDialog").attr("id", scope.name);

                    scope.AccessService = AccessService;
                    scope.activeAnnotations = {};
                    scope.selectedNewAnnotation = "";
                    scope.selectedAnnotation = null;

                    elem.on("shown.bs.modal", function() {
                        scope.activeAnnotations = SettingsService.getActiveAnnotations();
                        scope.activeAnnotations.annotations.annotation_asArray = 
                            scope.activeAnnotations.annotations.annotation_asArray.map(function(a) {
                                a.name = decodeURIComponent(a.name);
                                return a;
                            });
                        scope.selectedNewAnnotation = "";
                        scope.selectedAnnotation = null;
                    });


                 },
                 transclude : false,
                 templateUrl : "/js/dialog/settings/annotations/settingsAnnotationsDialog.directive.html"
             };
        }
        ]
);


