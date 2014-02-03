/* REST API wrapper
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.factory( 
    'RestApi', 
    ['$resource', 'XsltService',
    function( $resource, XsltService ) {
        var queryApi = {
            method : 'GET',
            params : { 
                q : "",
                start : 1,
                'max-results' : 100
            },
            isArray : false,
            transformResponse : function( data ) {
                return $( $.parseXML( data ) )
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
        };
        var getAccessApi = function( urlBase ) { 
            return {
                method : 'GET',
                url : urlBase + "/access",
                params : { },
                isArray : false,
                transformResponse : function( data ) {
                    js = x2js.xml_str2json(data);
                    return {
                        owner : js.access.owner.__text,
                        group : js.access.group.__text,
                        read : js.access.you._read == "true",
                        write : js.access.you._write == "true",
                        relicense : js.access.you._relicense == "true",
                        chmod : js.access.you._chmod == "true"
                    };
                }
            };
        };

        return {
            "/api/data/original" : $resource(
                '/api/data/original\/:resource',
                { 
                    resource : ""
                },
                {
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/original\/:resource")
                }
            ),
            "/api/data/sources" : $resource(
                '/api/data/sources\/:resource',
                { 
                    resource : ""
                },
                {
                    'query' : queryApi
                }
            ),
            "/api/user" : $resource(
                "/api/user\/:resource",
                {
                    resource : ""
                },
                {
                    "getJson" : {
                        method : "GET",
                        transformResponse: function(data, headers) {
                            xsltTransformed = XsltService.transformString('profileFormTemplate', data);
                            jsTransformed = x2js.xml2json(xsltTransformed);
                            return jsTransformed;
                        }
                    },
                    "query" : queryApi,
                    'getAccess' : getAccessApi("/api/user\/:resource")
                }
            )
        };
  }
  ]
);



