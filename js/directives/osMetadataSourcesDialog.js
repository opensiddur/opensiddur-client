/* Show/set sources
 *
 * Usage:
 * <os-metadata-sources-dialog on-ok="" on-close="" title="" name="" accessModel="" />
 * on-ok runs when the OK button is pressed (it can cancel the OK), on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osMetadataSourcesDialog',
        [
        'SourceService', 'TextService',
        function( SourceService, TextService ) {
            var template = {
                title : "New source",
                source : "",
                scope : {
                    fromPage : 1,
                    toPage : 1
                },
                contents: {
                    content_asArray : []
                }
            };
            return {
                restrict : 'AE',
                scope : {
                    name : "@",
                    title : "@",
                    accessModel : "=",
                    onOk : "&",
                    onClose : "&"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In source metadata dialog controller");
                    $scope.viewer = {
                        page : 1
                    };
                    $scope.select = function(idx) {
                        $scope.selectedSource = idx; 
                        $scope.viewer.page = $scope.sourcesModel[idx].scope.fromPage;
                    };
                    $scope.addSource = function() {
                        $scope.sourcesModel.push(angular.copy(template));
                        $scope.select($scope.sourcesModel.length - 1);
                    };
                    $scope.removeSource = function() {
                        console.log("Remove source");
                        var oldIndex = $scope.selectedSource;
                        $scope.sourcesModel.splice($scope.selectedSource, 1);
                        $scope.select(oldIndex - 1);
                    };
                    $scope.fromPageChange = function() {
                        var selectedScope = $scope.sourcesModel[$scope.selectedSource].scope;
                        if (selectedScope.fromPage < 1) {
                            selectedScope.fromPage = 1;
                        }
                        if (selectedScope.fromPage > selectedScope.toPage) {
                            selectedScope.toPage = selectedScope.fromPage;
                        } 
                    };
                    $scope.toPageChange = function() {
                        var selectedScope = $scope.sourcesModel[$scope.selectedSource].scope;
                        if (selectedScope.toPage < 1) {
                            selectedScope.toPage = 1;
                        }
                        if (selectedScope.toPage < selectedScope.fromPage) {
                            selectedScope.fromPage = selectedScope.toPage;
                        } 

                    };
                    $scope.streamContentChanged = function() {
                        // whole stream is checked or unchecked
                        var s = $scope.sourcesModel[$scope.selectedSource].contents.stream;
                        if (s.streamChecked) {
                            for (var i = 0; i < s.id_asArray.length; i++) { 
                                s.id_asArray[i].checked = true;
                            }
                        }
                    }; 
                    $scope.sourcesModel = [];
                    
                    $scope.$watch("sourcesModel[selectedSource].source", function(s) {
                        if (s) {
                            // remove /exist/restxq/api/...
                            $scope.sourcesModel[$scope.selectedSource].source = $scope.sourcesModel[$scope.selectedSource].source.split("/").pop();
                        }
                    });
                    
                    $scope.OKButton = function () {
                        if (!$scope.onOk() || $scope.onOk()($scope.sourcesModel)) {
                            // remove unset sources
                            $scope.sourcesModel = $scope.sourcesModel.filter(function (s) {
                                return s.source.trim() != "";
                            });

                            TextService.sources($scope.sourcesModel);
                        
                            $("#"+$scope.name).modal('hide');
                        }
                    };
                    $scope.CloseButton = function () {
                        if ($scope.onClose()) { $scope.onClose()(); }
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Sources";
                    }
                    var isEmptySource = function (s) {
                        // is a sourceModel element considered empty?
                        return (s.source == "");
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osMetadataSourcesDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osMetadataSourcesDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.sourcesModel = TextService.sources();
                        var idContexts = TextService.listXmlIds(100, true);
                        for (var i = 0; i < scope.sourcesModel.length; i++) {
                            for (var j= 0; j < idContexts.length; j++) {
                                scope.sourcesModel[i].contents.stream.id_asArray[j].context = idContexts[j];
                            }
                        }
                        //scope.modelChanged(scope.respModel.length - 1);
                        scope.select(0); 
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osMetadataSourcesDialog.html"
             };
        }
        ]
);


