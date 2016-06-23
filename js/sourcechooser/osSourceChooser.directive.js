/* Show/set sources
 *
 * Usage:
 * <os-source-chooser sources-model="bibl..." list-ids="true|false" />
 * choose a set of sources
 *
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osSourceChooserModule.directive(
        'osSourceChooser',
        [
        'AccessService', 'SourceService', 'TextService', 'TranscriptionViewerService',
        function( AccessService, SourceService, TextService, TranscriptionViewerService ) {
            var template = {
                title : "New source",
                source : "",
                scope : {
                    fromPage : 1,
                    toPage : 1
                },
                contents: {
                    stream : { id_asArray : [] }
                }
            };
            return {
                restrict : 'AE',
                scope : {
                    sourcesModel : "=",
                    listIds : "@",
                    showEvent : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In source chooser controller");
                    $scope.AccessService = AccessService;
                    $scope.TranscriptionViewerService = TranscriptionViewerService;
                    $scope.select = function(idx) {
                        $scope.selectedSource = idx;
                        TranscriptionViewerService.setPage((idx >= 0) ? $scope.sourcesModel[idx].scope.fromPage : 1);
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
                        $scope.focusPageChange($scope.sourcesModel[$scope.selectedSource], selectedScope.fromPage);
                    };
                    $scope.toPageChange = function() {
                        var selectedScope = $scope.sourcesModel[$scope.selectedSource].scope;
                        if (selectedScope.toPage < 1) {
                            selectedScope.toPage = 1;
                        }
                        if (selectedScope.toPage < selectedScope.fromPage) {
                            selectedScope.fromPage = selectedScope.toPage;
                        } 
                        $scope.focusPageChange($scope.sourcesModel[$scope.selectedSource], selectedScope.toPage);
                    };
                    $scope.streamContentChanged = function() {
                        // whole stream is checked or unchecked
                        var s = $scope.sourcesModel[$scope.selectedSource].contents.stream;
                        if (s.streamChecked && "id_asArray" in s) {
                            for (var i = 0; i < s.id_asArray.length; i++) { 
                                s.id_asArray[i].checked = true;
                            }
                        }
                    };
                    $scope.focusPageChange = function (source, pageNum) {
                        TranscriptionViewerService.setSource(source.source).then(function() {
                            TranscriptionViewerService.setPage(pageNum);
                        });
                    };
                    var setSelections = function(selectionValue) {
                        var s = $scope.sourcesModel[$scope.selectedSource].contents.stream;
                        var idArray = s.id_asArray;
                        var nTrue = 0;
                        if (idArray) {
                            for (var i=0; i < idArray.length; i++) {
                                idArray[i].checked = selectionValue;
                                nTrue += (selectionValue == true) ? 1 : 0;
                            }
                            s.streamChecked = nTrue == idArray.length;
                        }
                    };
                    $scope.selectAll = function() {
                        setSelections(true);
                    };
                    $scope.clearAll = function() {
                        setSelections(false);
                    };
                    $scope.invertAll = function() {
                        var s = $scope.sourcesModel[$scope.selectedSource].contents.stream;
                        var idArray = s.id_asArray;
                        var nTrue = 0;
                        for (var i=0; i < idArray.length; i++) {
                            idArray[i].checked = !idArray[i].checked;    
                            nTrue += (idArray[i].checked) ? 1 : 0;
                        }
                        s.streamChecked = nTrue == idArray.length;
                    };
 
                    $scope.sourcesModel = [];
                    $scope.newSource = { source : "", title : "" }; 
                    $scope.$watch("newSource.source", function(s) {
                        if (s) {
                            // remove /exist/restxq/api/...
                            $scope.sourcesModel[$scope.selectedSource].source = $scope.newSource.source.split("/").pop();
                            $scope.sourcesModel[$scope.selectedSource].title = $scope.newSource.title;
                        }
                    });
                    
                    var isEmptySource = function (s) {
                        // is a sourceModel element considered empty?
                        return (s.source == "");
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.on(scope.showEvent, function() {
                        if (scope.listIds) {
                            var idContexts = TextService.listXmlIds(100, true);
                            for (var i = 0; i < scope.sourcesModel.length; i++) {
                                for (var j= 0; j < idContexts.length; j++) {
                                    scope.sourcesModel[i].contents.stream.id_asArray[j].context = idContexts[j];
                                }
                            }
                        }
                        // set up the template for new sources
                        template.contents.stream = angular.copy(scope.sourcesModel[0].contents.stream);
                        template.contents.stream.streamChecked = true;
                        if ("id_asArray" in template.contents.stream) {
                            for (var i = 0; i < template.contents.stream.id_asArray.length; i++) {
                                template.contents.stream.id_asArray[i].checked = true;
                            }
                        }

                        scope.select(0); 
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/sourcechooser/osSourceChooser.directive.html"
             };
        }
        ]
);


