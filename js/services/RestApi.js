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
                    var acc = $(data);
                    var you = acc.find("a\\:you");
                    var aclToJs = 
                        function ( cindex, context, attribute ) {
                            var c = $(context);
                            var name = c.text();
                            var write = c.attr(attribute);
                            return {
                                name : write 
                            };
                        };
                    var aclToJsW = function (cindex, context) { return aclToJs( cindex, context, "write"); }
                    var aclToJsR = function (cindex, context) { return aclToJs( cindex, context, "read"); }
                    return {
                        owner : acc.find("a\\:owner").text(),
                        group : acc.find("a\\:group").text(),
                        read : you.attr("read") == "true",
                        write : you.attr("write") == "true",
                        relicense : you.attr("relicense") == "true",
                        chmod : you.attr("chmod") == "true",
                        grantGroups : acc.find("a\\:grant-group").map(aclToJsW),
                        grantUsers : acc.find("a\\:grant-user").map(aclToJsW),
                        denyGroups : acc.find("a\\:deny-group").map(aclToJsR),
                        denyUsers : acc.find("a\\:deny-user").map(aclToJsR)
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



