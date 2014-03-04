/* 
 * AngularJS app
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
var host = "";
var x2js = new X2JS({ "arrayAccessForm" : "property", "emptyNodeForm" : "object" });   

// deferred bootstrap until after Saxon is loaded
var windowName = window.name;
window.name = "NG_DEFER_BOOTSTRAP!" + window.name;
var onSaxonLoad = function() {
    window.name = windowName;
    angular.resumeBootstrap();
};


// list of all languages supported by the app
var supportedLanguages = {
    "en" : "English",
    "he" : "עברית (Hebrew)",
    "arc" : "ארמית (Aramaic)"
};

/* retrieve an API error return value and return the string */
var getApiError = function(data) {
  return $($.parseXML(data)).find("message").text();
}

var OpenSiddurClientApp = 
  angular.module(
      'OpenSiddurClientApp',
      ['ngRoute',
       'ngResource',
       'ngSanitize', 
       'LocalStorageModule',
       'infinite-scroll',
       'ui.codemirror'
      ]);

OpenSiddurClientApp.config(
  ['$httpProvider', 
  function($httpProvider) {
    // for eXist to return application/xml by default.
    $httpProvider.defaults.headers.common['Accept'] = "application/xml, application/tei+xml, application/xhtml+xml, text/xml, text/html, text/plain, */*";
    // for CORS, see http://better-inter.net/enabling-cors-in-angular-js
    $httpProvider.defaults.headers.common['X-Requested-With'] = undefined;
    
    // all our requests are XML, not JSON
    $httpProvider.defaults.headers.post = { "Content-Type" : "application/xml" };
    $httpProvider.defaults.headers.put = { "Content-Type" : "application/xml" };
  }
]);

OpenSiddurClientApp.config(
  ['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix("!");
    $routeProvider
      .when('/contributors/:userName?', {templateUrl: '/partials/profile.html', controller: "ProfileCtrl"})
      .when('/signin', {templateUrl: '/partials/signin.html', controller: "AuthenticationCtrl"})
      .when('/sources/:resource?', {templateUrl: '/partials/sources.html', controller: "SourcesCtrl"})
      .when('/texts/:resource?', {templateUrl: '/partials/texts.html', controller: "TextsCtrl"})
      .when('/profile/:userName', {templateUrl: '/partials/profile.html', controller: "ProfileCtrl"})
      .when('/changepassword', {templateUrl: '/partials/changepassword.html', controller: "ChangePasswordCtrl"})
      .when('/about', {templateUrl: '/partials/about.html', controller: "AboutCtrl"})
      .otherwise({redirectTo: '/about'});
  }
]);

/* password check 
 * code from http://blog.brunoscopelliti.com/angularjs-directive-to-check-that-passwords-match 
 */
OpenSiddurClientApp.directive(
  'osPwCheck', 
  [
   function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.osPwCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
   }
  ]
);

