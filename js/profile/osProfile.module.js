var osProfileModule = angular.module('osClient.profile', ['osClient.truncate', 'osClient.authentication', 'osClient.error', 'osClient.xslt'])
    .constant("osProfileConst", { 
        partial : "/js/profile/Profile.view.html"
    })
    ;
