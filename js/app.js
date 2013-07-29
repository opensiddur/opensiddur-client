/* 
 * AngularJS app
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
var host = "http://localhost:8080";

/* retrieve an API error return value and return the string */
var getApiError = function(data) {
  $($.parseXML(data)).find("message").text()
}

var OpenSiddurClientApp = 
  angular.module(
      'OpenSiddurClientApp',
      []);

OpenSiddurClientApp.config(
  ['$httpProvider', 
  function($httpProvider) {
    // for eXist to return application/xml by default.
    $httpProvider.defaults.headers.common['Accept'] = "application/xml, application/tei+xml, application/xhtml+xml, text/xml, text/html, text/plain, */*";
    // for CORS, see http://better-inter.net/enabling-cors-in-angular-js
    $httpProvider.defaults.headers.common['X-Requested-With'] = undefined;
  }
]);

OpenSiddurClientApp.config(
  ['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    // TODO: implement HTML5 mode
    // html5 mode requires the server to redirect all URLs to the root of the app
    $locationProvider.html5Mode(true).hashPrefix("!");
    $routeProvider
      .when('/signin', {templateUrl: 'partials/signin.html', controller: "AuthenticationCtrl"})
      .when('/profile/:userName', {templateUrl: 'partials/profile.html', controller: "ProfileCtrl"})
      .when('/about', {templateUrl: 'partials/about.html', controller: "AboutCtrl"})
      .otherwise({redirectTo: '/about'});
  }
]);

/* import XML as part of the DOM */
OpenSiddurClientApp.directive(
  'osXmlImport', 
  function ($http) {
  var directiveDefinitionObject = {
      restrict: 'A',
      scope : {
        source : '@osXmlImport',
        contenteditable : '@contenteditable',
        errorMessage : '='
      },
      link: function postLink(scope, elem, attrs) {
        // TODO: place this in an XSLT service!
        var teiToHtml = 
          "<xsl:stylesheet "+ 
          " xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\" "+ 
          " xmlns=\"http://www.w3.org/1999/xhtml\" "+
          " version=\"1.0\"> "+
          " <xsl:output method='xml' indent='yes'/> "+
          " " +
          " <xsl:template name='make-name'> "+
          "   <xsl:param name='string'/> "+
          "     <xsl:choose> "+
          "       <xsl:when test=\"contains($string, ':')\"> "+
          "         <xsl:value-of select=\"concat(substring-before($string, ':'), '-', substring-after($string, ':'))\"/> "+
          "       </xsl:when> "+
          "       <xsl:otherwise> "+
          "         <xsl:value-of select='$string'/>"+
          "       </xsl:otherwise> "+
          "     </xsl:choose> "+
          " </xsl:template> "+
          " " + 
          " <xsl:template match='@xml:lang'> " +
          "   <xsl:copy-of select='.'/> "+
          "   <xsl:attribute name='lang'><xsl:value-of select='.'/></xsl:attribute> "+
          " </xsl:template> " +
          " " +
          " <xsl:template match='@*'> "+
          "   <xsl:variable name='attr-name'> "+
          "     <xsl:call-template name='make-name'> " +
          "       <xsl:with-param name='string' select='name()'/> "+
          "     </xsl:call-template> "+
          "   </xsl:variable> "+
          "   <xsl:attribute name='data-{$attr-name}'> "+
          "     <xsl:value-of select='.'/> "+
          "   </xsl:attribute> "+
          " </xsl:template> "+
          " "+
          " <xsl:template match='*'> "+
          "   <xsl:variable name='elem-name'> " +
          "     <xsl:call-template name='make-name'> "+
          "       <xsl:with-param name='string' select='name()'/> "+
          "     </xsl:call-template> "+
          "   </xsl:variable> "+
          "   <div class='{$elem-name}'> "+
          "     <xsl:apply-templates select='@*'/> "+
          "     <xsl:apply-templates select='node()'/> "+
          "   </div> "+
          " </xsl:template> "+
          "</xsl:stylesheet>";
        var loadXml = function() {
          $http.get(host + scope.source)
            .success( function ( data, status, headers, config ) {
              var xslDomDoc = Sarissa.getDomDocument();
              xslDomDoc = (new DOMParser()).parseFromString(teiToHtml, "text/xml");  
              
              var dataDomDoc = Sarissa.getDomDocument();
              dataDomDoc = (new DOMParser()).parseFromString(data, "text/xml");
              
              var processor = new XSLTProcessor();
              processor.importStylesheet(xslDomDoc);
              
              var htmlDocument = 
                processor.transformToDocument(dataDomDoc);
              
              elem.append(htmlDocument.documentElement);
              
              if (scope.contenteditable) {
                scope.editor = 
                  CKEDITOR.inline(elem[0], {
                    extraPlugins : 'tei-idno',
                    allowedContent : {
                      div : {
                        classes : 'j-contributor, tei-idno',
                        attributes : 'xml:lang, lang, data-xml-id, data-type'
                      }
                    }
                    
                  });
              }
              else
                scope.editor = null;
            })
            .error( function ( data, status, headers, config ) {
              scope.errorMessage = getApiError(data);
            })
                
        }
        console.log("xml import directive found: import from " + scope.source)
        loadXml()
      }
    };
    return directiveDefinitionObject;
  });
