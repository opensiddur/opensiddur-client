/* REST API wrapper
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.factory( 
    'RestApi', 
    ['$resource',
    function( $resource ) {
        return $resource(
            ':api',
            { 
                q : "",
                start : 1,
                'max-results' : 100
            },
            {
                'query' : {
                    method : 'GET',
                    isArray : true,
                    transformResponse : function( data ) {
                        return $( $.parseXML( data ) )
                            .find( "li.result" )
                            .map( function( index, result ) {
                                var doc = $("a.document", result);
                                return {
                                    title : doc.html(),
                                    url : doc.attr("href"),
                                    contexts : doc.find(".context").map(
                                        function( cindex, context ) {
                                            return {
                                                previous : $(context, ".previous").html(),
                                                match : $(context, ".match").html(),
                                                following : $(context, ".following").html()
                                            }
                                        }
                                    )
                                };
                            });
                    }
                }
            }
        );
  }
  ]
);



