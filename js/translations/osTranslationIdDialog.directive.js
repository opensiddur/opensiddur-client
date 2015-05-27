/* View or edit translation id
 *
 * Usage:
 * <os-translation-id-dialog name="" ></os-translation-id-dialog>
 *
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
translationsModule.directive(
        'osTranslationIdDialog',
        [
        'AccessService', 'TranslationsService',
        function( AccessService, TranslationsService ) {
            return {
                restrict : 'AE',
                scope : {
                    name : "@",
                },
                controller: ['$scope', function ($scope) {
                    $scope.AccessService = AccessService;
                    $scope.translationId =  "" ;
                    $scope.OKButton = function () {
                        TranslationsService.translationId($scope.translationId);
                    
                        $("#"+$scope.name).modal('hide');
                    };
                    $scope.CloseButton = function () {
                        $("#"+$scope.name).modal('hide');
                    };
                    if (!$scope.title) {
                        $scope.title = "Set translation identifier";
                    }
                    
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    elem.find(".modal-title").attr("id", scope.name + "_label");
                    elem.find(".osTranslationIdDialog").attr("aria-labelledBy", scope.name + "_label");
                    elem.find(".osTranslationIdDialog").attr("id", scope.name);
                    elem.on("show.bs.modal", function() {
                        scope.translationId = TranslationsService.translationId();
                    });
                 },
                 transclude : false,
                 templateUrl : "/js/translations/osTranslationIdDialog.directive.html"
             };
        }
        ]
);


