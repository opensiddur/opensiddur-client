/* Set titles 
 *
 * Usage:
 * <os-metadata-title-dialog on-ok="" on-close="" title="" name="" />
 * on-ok runs when the OK button is pressed (it can cancel the OK), on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osMetadataTitleDialog',
        [
        'AccessService', 'TextService',
        function( AccessService, TextService ) {
            var template = {
                text : "",
                lang : "",
                subText : "",
                subLang : ""
            };

            return {
                restrict : 'AE',
                scope : {
                    name : "@",
                    title : "@",
                    onOk : "&",
                    onClose : "&"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In title metadata controller");
                    $scope.AccessService = AccessService;
                    $scope.supportedLanguages = supportedLanguages;
                    $scope.OKButton = function () {
                        if (!$scope.onOk() || $scope.onOk()($scope.titleModel)) {
                            TextService.title($scope.titleModel);
                        
                            $("#"+$scope.name).modal('hide');
                        }
                    };
                    $scope.CloseButton = function () {
                        if ($scope.onClose()) { $scope.onClose()(); }
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Titles";
                    }
                    var isEmptyTm = function (t) {
                        // is a titleModel element considered empty?
                        return (t.text == "" && t.subText == "");
                    }
                    $scope.modelChanged = function(index) {
                        var tm = $scope.titleModel;
                        if (index == tm.length - 1 && !isEmptyTm(tm[index])) {
                            tm.push(angular.copy(template));
                        }
                        else if (index < tm.length -1) {
                            var allEmpty = true;
                            var firstEmpty = -1;
                            for (var i = 1;  i < tm.length; i++) {
                                if (!isEmptyTm(tm[i])) firstEmpty = -1;
                                else if (firstEmpty == -1) firstEmpty = i;
                            }
                            if (firstEmpty > 0) {
                                for (var i = tm.length - 1; i > firstEmpty ;i--) tm.pop();
                            }
                        }
                    };
                    
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osMetadataTitleDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osMetadataTitleDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.titleModel = TextService.title();
                        scope.modelChanged(scope.titleModel.length - 1);    // always append an empty title
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osMetadataTitleDialog.html"
             };
        }
        ]
);


