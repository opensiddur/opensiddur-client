var osProfileModule = angular.module('osProfile', ['osTruncate', 'osAuthentication', 'osError', 'osXslt'])
    .constant("osProfileConst", { 
        partial : "/js/profile/Profile.view.html"
    })
    ;
