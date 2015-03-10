/* Listing (list/search) service
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.factory(
    "ListingService",
    ["$http",
    function($http) {

        var defaultMaxResults = 100;

        return {
            get : function(api, start, maxResults) {
                return this.query(api, "", start, maxResults);
            },
            query : function(api, q, start, maxResults) {
                start = start || 1;
                maxResults = maxResults || defaultMaxResults;
                return $http.get(api, {
                    params : {
                        q : q,
                        start : start,
                        "max-results" : maxResults
                    },
                    transformResponse : function( data, headersGetter, httpStatus ) {
                        return (httpStatus >= 400) ? data : $( $.parseXML( data ) )
                            .find( "li.result" )
                            .map( function( index, result ) {
                                var doc = $("a.document", result);
                                return {
                                      title : doc.html(),
                                      url : doc.attr("href"),
                                      contexts : $(".context", result).map(
                                          function( cindex, context ) {
                                              return {
                                                  previous : $(".previous", context).html(),
                                                  match : $(".match", context).html(),
                                                  following : $(".following", context).html()
                                              }
                                          }
                                      )
                                  };
                              });
                    }
                    
                })
                
            }    
        };
    }]
);

