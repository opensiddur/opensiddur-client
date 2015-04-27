var osSourcesModule = angular.module('osSources', ['osAuthentication', 'osError', 'osGlobalData', 'osSharing', 'osTruncate', 'osXslt'])
    .constant("osSourcesConst", { 
        partial : "/js/sources/Sources.view.html"
    })
    ;
