var osAuthenticationModule = angular.module('osClient.authentication', ['osClient.error', 'LocalStorageModule'])
    .constant("osAuthenticationConst", { 
        partial : {
            signin : "/js/authentication/SignIn.view.html",
            password : "/js/authentication/ChangePassword.view.html"
        }
    })
    ;
