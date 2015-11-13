/* Authentication service 
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osAuthenticationModule.factory( 
  'AuthenticationService', 
  ['$rootScope', '$http', '$q', 'localStorageService',
  function( $rootScope, $http, $q, localStorageSevice ) {
      savedUser = localStorageSevice.get('userName');
      savedPass = localStorageSevice.get('password');
      svc = {
           loggedIn: Boolean(savedUser),
           userName: savedUser,
           password: savedPass,
           rememberMe: Boolean(savedUser),
           // authenticate, but do not log in 
           // return a promise to the response
           authenticate : function ( userName, password ) {
               return $http.post(
                   "/api/login",
                   "<login><user>"+ userName + 
                   "</user><password>"+ password+
                   "</password></login>",
                   {
                       params : {
                           "auth-only" : "true"
                       }
                   })
                .then(
                    function(response) { 
                        return response.data;
                    },
                    function(error) {
                        return $q.reject(error.data); 
                    });
           },
           login: function( userName, password, rememberMe ) {
               var toUtf8 = function(s) {
                    // HTTP Basic auth for funky characters only works if they're in UTF-8 encoding
                    return unescape(encodeURIComponent(s));
                };
               this.loggedIn = true;
               this.rememberMe = rememberMe;
               this.userName = userName;
               this.password = password;
               $http.defaults.headers.common.Authorization = 'Basic ' + Base64.encode(toUtf8(this.userName) + ':' + toUtf8(this.password));
               $http.defaults.withCredentials = true;
               if (rememberMe && (
                       savedUser != userName ||
                       savedPass != password)
               ) {
                   localStorageSevice.set('userName', userName);
                   localStorageSevice.set('password', password);
               }
                return this;
           },
           logout: function () {
               this.loggedIn = false;
               this.userName = "";
               this.password = "";
             
               if (this.rememberMe) {
                   localStorageSevice.remove('userName');
                   localStorageSevice.remove('password');
               }
             
               //send HTTP request to log out. Ignore errors.
               $http.post(
                       "/api/logout", 
                       "<logout/>"
               );
               
               // set future HTTP requests to remove credentials
               $http.defaults.withCredentials = false;
               delete $http.defaults.headers.common.Authorization;
                return this;
           },
           changePassword : function(oldPassword, newPassword) {
                var thiz = this;
                var userName = this.userName;
                return this.authenticate(userName, oldPassword)
                .then(function() {
                    return $http.post(
                        "/api/user",  
                        "<change-password><user>"+ userName + 
                        "</user><password>"+newPassword+
                        "</password></change-password>")
                        .then(function() {
                            return thiz.login(userName, newPassword, thiz.rememberMe);
                        }, function(error) { 
                            return $q.reject(error.data); 
                        } );
                    });
            },
            register : function(userName, password, rememberMe) {
                var thiz = this;
                return $http.post(
                    "/api/user",  
                    "<register><user>"+userName + 
                    "</user><password>"+password+
                    "</password></register>")
                    .then(function() {
                        return thiz.login(userName, password, rememberMe);
                    }, function(error) { 
                        return $q.reject(error.data); 
                    } );

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


