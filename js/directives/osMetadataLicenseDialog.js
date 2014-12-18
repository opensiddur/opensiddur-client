/* Insert internal link dialog
 *
 * Usage:
 * <os-metadata-license-dialog on-ok="" on-close="" title="" name="" accessModel="" />
 * on-ok runs when the OK button is pressed (it can cancel the OK), on-close runs when the dialog is canceled
 * name is an id, title is the header text
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osMetadataLicenseDialog',
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
                    console.log("In license metadata controller");
                    $scope.supportedLicenses = supportedLicenses;
                    $scope.OKButton = function () {
                        if (!$scope.onOk() || $scope.onOk()($scope.licenseModel)) {
                            TextService.license($scope.licenseModel);
                        
                            $("#"+$scope.name).modal('hide');
                        }
                    };
                    $scope.CloseButton = function () {
                        if ($scope.onClose()) { $scope.onClose()(); }
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "License";
                    }
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osMetadataLicenseDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osMetadataLicenseDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.licenseModel = TextService.license();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osMetadataLicenseDialog.html"
             };
        }
        ]
);


