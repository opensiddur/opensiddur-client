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
  ['$rootScope', '$http', 
  function( $rootScope, $http ) {
    return {
       loggedIn: false,
       userName: "",
       password: "",
       login: function( userName, password ) {
         this.loggedIn = true;
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
       },
       logout: function () {
         this.loggedIn = false;
         this.userName = "";
         this.password = "";
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
  }
  ]
);


