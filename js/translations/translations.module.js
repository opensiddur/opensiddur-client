var translationsModule = angular.module("osClient.translations", ["osClient.authentication", "osClient.error", "osClient.text", "osClient.truncate", "osClient.xslt"])
    .constant("translationsConst", {
        partial : "/js/translations/translations.view.html"
    });
