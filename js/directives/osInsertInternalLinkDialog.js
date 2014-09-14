/* Insert internal link dialog
 *
 * Usage:
 * <os-insert-internal-link-dialog content="" on-ok="" on-close="" title="" name="" allow-range=""/>
 * on-ok runs when the OK button is pressed, on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osInsertInternalLinkDialog',
        [
        'ErrorService',
        function( ErrorService ) {
            return {
                restrict : 'AE',
                scope : {
                    content : "=",
                    onOk : "&",
                    onClose : "&",
                    name : "@",
                    title : "@",
                    allowRange : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In insert internal link dialog controller");
                    $scope.updateIds = 0;
                    $scope.links = {
                        composed : ""
                    };                    

                    $scope.OKButton = function () {
                        $scope.onOk()($scope.links.composed);
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $scope.onClose()();
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Insert Internal Link";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-header h3").attr("id", scope.name + "_label");
                    elem.find(".osInsertInternalLinkDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osInsertInternalLinkDialog").attr("id", scope.name);
                    elem.on("shown", function() { scope.updateIds += 1; });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osInsertInternalLinkDialog.html"
             };
        }
        ]
);


