var osSourcesModule = angular.module('osClient.sources', ['osClient.authentication', 'osClient.error', 'osClient.globalData', 'osClient.sharing', 'osClient.truncate', 'osClient.xslt'])
    .constant("osSourcesConst", { 
        partial : "/js/sources/Sources.view.html"
    })
    ;
