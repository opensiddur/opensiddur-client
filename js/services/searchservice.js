/* Search service 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
/* Search service provides search and list results to 
 * controllers via the SearchService.query() function
 * Broadcast SearchService.error_[source] on error (with errorMessage) and
 * SearchService.complete_[source] on completion (with: JSON search results as array, start and maxResults)
 */
OpenSiddurClientApp.service( 
    'SearchService', 
    ['$rootScope', '$http',
    function( $rootScope, $http) {
        svc = {
            list: function( sourceKey, api) {
                query( sourceKey, api);
            },
            query: function( sourceKey, api, q, start, maxResults ) {
                if (!start)
                    start = 1;
                if (!maxResults)
                    maxResults = 100;
                if (!q)
                    q = "";
                console.log("search service: q='", q, "'");
                $http.get(
                           host + api,
                           {
                                params : {
                                    "q" : q,
                                    "start" : start,
                                    "max-results" : maxResults
                                } 
                           }
                   )
                   .success (function(data) {
                      results = $($.parseXML(data)).find(".results");
                      // this is a bit ugly. There's got to be a better way to do this:
                      jsTransformed = x2js.xml_str2json($(results).parent().html());
                      // ul is returned for no query, ol for query
                      ls = (jsTransformed.ul) ? jsTransformed.ul.li_asArray : jsTransformed.ol.li_asArray;
                      $rootScope.$broadcast(
                        'SearchService.complete_' + sourceKey,
                        ls === undefined ? [] : ls,
                        start,
                        maxResults
                      )
                   })
                   .error(function(data) { 
                      errorMessage = getApiError(data);
                      $rootScope.$broadcast(
                        'SearchService.error_' + sourceKey,
                        errorMessage
                      );
                   } );
           }
      };
      
      return svc;
  }
  ]
);



