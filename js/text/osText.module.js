var osTextModule = angular.module('osClient.text', ['osClient.error', 'osClient.xslt'])
    .constant("textConst", {
        partial : "/js/text/texts.view.html"
    }
    )
    ;
