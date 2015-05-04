/* 
 * AngularJS app
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
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


// list of licenses supported by the app
var supportedLicenses = {
    "http://www.creativecommons.org/publicdomain/zero/1.0" : "Creative Commons Zero 1.0",
    "http://www.creativecommons.org/licenses/by/4.0" : "Creative Commons Attribution 4.0",
    "http://www.creativecommons.org/licenses/by-sa/4.0" : "Creative Commons Attribution-ShareAlike 4.0",
    "http://www.creativecommons.org/licenses/by/3.0" : "Creative Commons Attribution 3.0 Unported",
    "http://www.creativecommons.org/licenses/by-sa/3.0" : "Creative Commons Attribution-ShareAlike 3.0 Unported"
};

// list of all responsibility types supported by the app
var supportedResponsibilities = {
    "ann" : "Annotated by",
    "fac" : "Scanned by",
    "fnd" : "Funded by",
    "mrk" : "Markup edited by",
    "pfr" : "Proofread by",
    "spn" : "Sponsored by",
    "trc" : "Transcribed by",
    "trl" : "Translated by"
};


/* retrieve an API error return value and return the string */
var getApiError = function(data) {
  return $($.parseXML(data)).find("message").text();
}

var OpenSiddurClientApp = 
  angular.module(
      'OpenSiddurClientApp',
      [
       'ngCkeditor',
       'ngRoute',
       'ngResource',
       'ngSanitize',
       //'LocalStorageModule',
       'infinite-scroll',
       'ui.codemirror',
       'unsavedChanges',
       // Open Siddur specific modules
       'osAuthentication',
       'osError',
       'osCompiled',
       'osCompiler',
       'osGlobalData',
       'osJobs',
       'osProfile',
       'osRecentChanges',
       'osSearch',  // a dependency of dialogs, can be moved when completely modularized
       'osIdList',  // ditto
       'osDialog.New', // ditto
       'osDialog.Open', // ditto
       'osDialog.InternalLink', // ditto
       'osDialog.ExternalLink', // ditto
       'osDialog.Metadata.Commit', //ditto
       'osDialog.Metadata.License', // ditto
       'osDialog.Metadata.Resp', // ditto
       'osDialog.Metadata.Sources', // ditto
       'osDialog.Metadata.Title', // ditto
       'osSharing',
       'osSources',
       'osText',
       'osTranscriptionWindow', // a dependency of the text module, can be moved when completely modularized
       'osXslt' // probably won't be needed when completely modularized
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

// allow external URLs from Internet Archive, Google Books, and Wikimedia Commons to be loaded
OpenSiddurClientApp.config(
    ['$sceDelegateProvider', 
    function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Internet Archive
            'https://archive.org/stream/**',
            // Google Books embedding
            'http://books.google.com/books**',
            // Wikimedia Commons
            'http://upload.wikimedia.org/wikipedia/commons/thumb/**'
        ]);
    }]
);

OpenSiddurClientApp.config(
  ['$routeProvider', '$locationProvider', 
    'osAuthenticationConst', 'osJobsConst', 'osCompiledConst', 'osCompilerConst', 'osProfileConst', 'osRecentChangesConst', 'osSourcesConst',
  function($routeProvider, $locationProvider, 
    osAuthenticationConst, osJobsConst, osCompiledConst, osCompilerConst, osProfileConst, osRecentChangesConst, osSourcesConst) {
    $locationProvider.html5Mode(true).hashPrefix("!");
    $routeProvider
      .when('/changes/:userName?', {templateUrl: osRecentChangesConst.partial, controller: "RecentChangesCtrl"})
      .when('/compile/:resource', {templateUrl: osCompilerConst.partial, controller: "CompileCtrl"})
      .when('/compiled/:resource', {templateUrl: osCompiledConst.partial, controller: "CompiledCtrl"})
      .when('/contributors/:userName?', {templateUrl: osProfileConst.partial, controller: "ProfileCtrl"})
      .when('/jobs/:userName', {templateUrl: osJobsConst.partial.jobs, controller: "JobsCtrl"})
      .when('/jobstatus/:jobid', {templateUrl: osJobsConst.partial.jobstatus, controller: "JobStatusCtrl"})
      .when('/signin', {templateUrl: osAuthenticationConst.partial.signin, controller: "AuthenticationCtrl"})
      .when('/sources/:resource?', {templateUrl: osSourcesConst.partial, controller: "SourcesCtrl"})
      .when('/styles/:resource?', {templateUrl: '/partials/texts.html', controller: "TextsCtrl"})
      .when('/texts/:resource?', {templateUrl: '/partials/texts.html', controller: "TextsCtrl"})
      .when('/annotations/:resource?', {templateUrl: '/partials/texts.html', controller: "TextsCtrl"})
      .when('/translations/:resource?', {templateUrl: '/partials/translations.html', controller: "TranslationsCtrl"})
      .when('/conditionals/:resource?', {templateUrl: '/partials/texts.html', controller: "TextsCtrl"})
      .when('/profile/:userName', {templateUrl: osProfileConst.partial, controller: "ProfileCtrl"})
      .when('/changepassword', {templateUrl: osAuthenticationConst.partial.password, controller: "ChangePasswordCtrl"})
      .when('/about', {templateUrl: '/partials/about.html', controller: "AboutCtrl"})
      .otherwise({redirectTo: '/about'});
  }
]);

// this is required to make $location.path() have a parameter to prevent reloading
OpenSiddurClientApp.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

/* this section of code from http://stackoverflow.com/questions/22944932/angularjs-resource-how-to-disable-url-entity-encoding 
 * is intended to replace the encodeURIComponent() used in $http with one that is RFC-3986 compliant
 * code for that function is from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 */
var realEncodeURIComponent = window.encodeURIComponent;
window.encodeURIComponent = function(str) {
    return realEncodeURIComponent(str).replace(/[,!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
}; 
/*
OpenSiddurClientApp.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function($q) {
    var realEncodeURIComponent = window.encodeURIComponent;
    return {
      'request': function(config) {
         window.encodeURIComponent = function(str) {
              return realEncodeURIComponent(str).replace(/[,!'()*]/g, function(c) {
                return '%' + c.charCodeAt(0).toString(16);
              });
         }; 
         return config || $q.when(config);
      },
      'response': function(config) {
         window.encodeURIComponent = realEncodeURIComponent;
         return config || $q.when(config);
      }
    };
  });
}]);
*/
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

