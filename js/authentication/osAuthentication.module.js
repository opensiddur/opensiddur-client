var osAuthenticationModule = angular.module('osAuthentication', ['osError', 'LocalStorageModule'])
    .constant("osAuthenticationConst", { 
        partial : {
            signin : "/js/authentication/SignIn.view.html",
            password : "/js/authentication/ChangePassword.view.html"
        }
    })
    ;
