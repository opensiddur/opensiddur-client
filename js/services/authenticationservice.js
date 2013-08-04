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
  ['$rootScope', '$http', '$cookieStore',
  function( $rootScope, $http, $cookieStore ) {
      cookieUser = $cookieStore.get('userName');
      cookiePass = $cookieStore.get('password');
      svc = {
           loggedIn: Boolean(cookieUser),
           userName: cookieUser,
           password: cookiePass,
           rememberMe: Boolean(cookieUser),
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
                     cookieUser != userName ||
                     cookiePass != password)
                ) {
                 $cookieStore.put('userName', userName);
                 $cookieStore.put('password', password);
             }
           },
           logout: function () {
             this.loggedIn = false;
             this.userName = "";
             this.password = "";
             if (this.rememberMe) {
                 $cookieStore.remove('userName');
                 $cookieStore.remove('password');
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
      if (cookieUser)
          svc.login(cookieUser, cookiePass, true);
      
      return svc;
  }
  ]
);


