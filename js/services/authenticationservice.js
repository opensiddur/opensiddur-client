/* Authentication service 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* Authentication service provides authentication info to 
 * controllers via the AuthenticationService.update message.
 */
OpenSiddurClientApp.service( 
  'AuthenticationService', 
  ['$rootScope', '$http', 'localStorageService',
  function( $rootScope, $http, localStorageSevice ) {
      savedUser = localStorageSevice.get('userName');
      savedPass = localStorageSevice.get('password');
      svc = {
           loggedIn: Boolean(savedUser),
           userName: savedUser,
           password: savedPass,
           rememberMe: Boolean(savedUser),
           login: function( userName, password, rememberMe ) {
             this.loggedIn = true;
             this.rememberMe = rememberMe;
             this.userName = userName;
             this.password = password;
             $http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode(this.userName + ':' + this.password);
             $http.defaults.withCredentials = true;
             $rootScope.$broadcast( 
                 'AuthenticationService.update', 
                 this.loggedIn,
                 this.userName,
                 this.password
             );
             if (rememberMe && (
                     savedUser != userName ||
                     savedPass != password)
                ) {
                 localStorageSevice.set('userName', userName);
                 localStorageSevice.set('password', password);
             }
           },
           logout: function () {
             this.loggedIn = false;
             this.userName = "";
             this.password = "";
             if (this.rememberMe) {
                 localStorageSevice.remove('userName');
                 localStorageSevice.remove('password');
             }
             $http.defaults.withCredentials = false;
             delete $http.defaults.headers.common.Authorization;
             $rootScope.$broadcast( 
                 'AuthenticationService.update', 
                 this.loggedIn,
                 this.userName,
                 this.password
             );
           },
           whoami: function() {
             return {
               'userName' : this.userName,
               'password' : this.password
             }
           }
      };
      
      // if there's already a user set by cookie, do the login
      // stuff immediately
      if (savedUser)
          svc.login(savedUser, savedPass, true);
      
      return svc;
  }
  ]
);


