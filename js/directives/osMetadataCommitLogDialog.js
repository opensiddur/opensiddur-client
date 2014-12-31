/* View commit log or enter the next commit message 
 *
 * Usage:
 * <os-metadata-commit-log-dialog on-ok="" on-close="" title="" name="" accessModel="" />
 * on-ok runs when the OK button is pressed (it can cancel the OK), on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osMetadataCommitLogDialog',
        [
        'TextService',
        function( TextService ) {
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
                    console.log("In commit log metadata dialog controller");
                    $scope.commitMessage = { message : "" };
                    $scope.commitLog = [];
                    $scope.OKButton = function () {
                        if (!$scope.onOk() || $scope.onOk()($scope.respModel)) {
                            TextService.commitMessage($scope.commitMessage);
                        
                            $("#"+$scope.name).modal('hide');
                        }
                    };
                    $scope.CloseButton = function () {
                        if ($scope.onClose()) { $scope.onClose()(); }
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Commit Log";
                    }
                    
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osMetadataCommitLogDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osMetadataCommitLogDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.commitMessage = TextService.commitMessage();
                        scope.commitLog = TextService.commitLog();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osMetadataCommitLogDialog.html"
             };
        }
        ]
);


