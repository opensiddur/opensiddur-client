/* Set responsibility credits 
 *
 * Usage:
 * <os-metadata-resp-dialog on-ok="" on-close="" title="" name="" accessModel="" />
 * on-ok runs when the OK button is pressed (it can cancel the OK), on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osMetadataRespDialog',
        [
        'TextService',
        function( TextService ) {
            var template = {
                respText : "",
                respType : "",
                respName : "",
                respRef : ""
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
                    console.log("In resp metadata controller");
                    $scope.supportedResponsibilities = supportedResponsibilities;
                    $scope.selectedContributor = { name : "", ref : "" };
                    $scope.OKButton = function () {
                        if (!$scope.onOk() || $scope.onOk()($scope.respModel)) {
                            TextService.responsibility($scope.respModel);
                        
                            $("#"+$scope.name).modal('hide');
                        }
                    };
                    $scope.CloseButton = function () {
                        if ($scope.onClose()) { $scope.onClose()(); }
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.setResponsibility = function(index) {
                        $scope.respModel[index].respName = $scope.selectedContributor.name;
                        $scope.respModel[index].respRef = $scope.selectedContributor.ref.replace("/exist/restxq/api", "");
                        $scope.modelChanged(index);
                    };
                    $scope.removeResponsibility = function(index) {
                        $scope.respModel[index] = angular.copy(template);
                        if (!(index == 0 && $scope.respModel.length == 1)) {
                            $scope.respModel.splice(index, 1);
                        }
                        $scope.modelChanged(index);
                    };
                    if (!$scope.title) {
                        $scope.title = "Responsibility credits";
                    }
                    var isEmptyRsp = function (t) {
                        // is a respModel element considered empty?
                        return (t.respName == "");
                    }
                    $scope.modelChanged = function(index) {
                        var rm = $scope.respModel;
                        if (index == rm.length - 1 && (rm.length == 0 || !isEmptyRsp(rm[index]))) {
                            rm.push(angular.copy(template));
                        }
                        else if (index < rm.length -1) {
                            var firstEmpty = -1;
                            for (var i = 0;  i < rm.length; i++) {
                                if (!isEmptyRsp(rm[i])) firstEmpty = -1;
                                else if (firstEmpty == -1) firstEmpty = i;
                            }
                            if (firstEmpty >= 0) {
                                for (var i = rm.length - 1; i > firstEmpty ;i--) rm.pop();
                            }
                        }
                    };
                    
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osMetadataRespDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osMetadataRespDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.respModel = TextService.responsibility();
                        scope.modelChanged(scope.respModel.length - 1);
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osMetadataRespDialog.html"
             };
        }
        ]
);


