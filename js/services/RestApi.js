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
                            var permission = c.attr(attribute);
                            return {
                                "group" : name,
                                "value" : permission 
                            };
                        };
                    var aclToJsW = function (cindex, context) { return aclToJs( cindex, context, "write"); }
                    var aclToJsR = function (cindex, context) { return aclToJs( cindex, context, "read"); }
                    var flatten = function ( arrayOfObjects ) {
                        var obj = {};
                        for (var i = 0; i < arrayOfObjects.length; i++) {
                            obj[arrayOfObjects[i].group] = arrayOfObjects[i].value;
                        }
                        return obj;
                    };
                    return {
                        owner : acc.find("a\\:owner").text(),
                        group : acc.find("a\\:group").text(),
                        groupWrite : acc.find("a\\:group").attr("write") == "true",
                        worldRead : acc.find("a\\:world").attr("read") == "true",
                        worldWrite : acc.find("a\\:world").attr("write") == "true",
                        read : you.attr("read") == "true",
                        write : you.attr("write") == "true",
                        relicense : you.attr("relicense") == "true",
                        chmod : you.attr("chmod") == "true",
                        grantGroups : flatten(acc.find("a\\:grant-group").map(aclToJsW)),
                        grantUsers : flatten(acc.find("a\\:grant-user").map(aclToJsW)),
                        denyGroups : flatten(acc.find("a\\:deny-group").map(aclToJsR)),
                        denyUsers : flatten(acc.find("a\\:deny-user").map(aclToJsR))
                    };
                }
            };
        };

        var setAccessApi = function( urlBase ) { 
            return {
                method : 'PUT',
                url : urlBase + "/access",
                params : { },
                isArray : false,
                transformRequest : function( acc ) {
                    var grantGroups =
                        (acc.grantGroups) ? 
                            $.map(acc.grantGroups, function ( i, group ) {
                                return "<a:grant-group write='"+acc.grantGroups[group]+"'>"+group+"</a:grant-group>";
                            }).join("") : "";
                    var grantUsers = 
                        (acc.grantUsers) ? 
                            $.map(acc.grantUsers, function ( i, user ) {
                                return "<a:grant-user write='"+acc.grantUsers[user]+"'>"+user+"</a:grant-user>";
                            }).join("") : "";
                    var denyGroups =
                        (acc.denyGroups) ? 
                            $.map(acc.denyGroups, function ( i, group ) {
                                return "<a:deny-group read='"+acc.denyGroups[group]+"'>"+group+"</a:deny-group>";
                            }).join("") : "";
                    var denyUsers =
                        (acc.denyUsers) ? 
                            $.map(acc.denyUsers, function ( i, user ) {
                                return "<a:deny-user read='"+acc.denyUsers[user]+"'>"+user+"</a:deny-user>";
                            }).join("") : "";
                    var grants = 
                        (grantGroups || grantUsers) ?
                            "<a:grant>"+ grantGroups + grantUsers + "</a:grant>" :
                            "";
                    var denies = 
                        (denyGroups || denyUsers) ?
                            "<a:deny>"+ denyGroups + denyUsers + "</a:deny>" :
                            "";
                    return (
                        "<a:access xmlns:a='http://jewishliturgy.org/ns/access/1.0'>" +
                            "<a:owner>" + acc.owner + "</a:owner>" +
                            "<a:group write='"+ acc.groupWrite +"'>" + acc.group + "</a:group>" +
                            "<a:world read='"+ acc.worldRead + "' write='" + acc.worldWrite + "'/>" + 
                            grants +
                            denies +
                        "</a:access>"
                    );
            
                    
                }
            };
        };

        return {
            "/api/data/conditionals" : $resource(
                '/api/data/conditionals\/:resource',
                { 
                    resource : ""
                },
                {
                    'query' : queryApi
                }
            ),
            "/api/data/linkage" : $resource(
                '/api/data/linkage\/:resource',
                { 
                    resource : ""
                },
                {
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/linkage\/:resource"),
                    'setAccess' : setAccessApi("/api/data/linkage\/:resource")
                }
            ),
            "/api/data/original" : $resource(
                '/api/data/original\/:resource',
                { 
                    resource : ""
                },
                {
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/original\/:resource"),
                    'setAccess' : setAccessApi("/api/data/original\/:resource")
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
                    "getAccess" : getAccessApi("/api/user\/:resource")
                }
            )
        };
  }
  ]
);



