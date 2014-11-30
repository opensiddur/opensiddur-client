/* REST API wrapper
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

OpenSiddurClientApp.factory( 
    'RestApi', 
    ['$resource', 'XsltService',
    function( $resource, XsltService ) {
        var getApi = {
            method : 'GET',
            isArray : false,
            transformResponse : function (data) {
                return { "xml" : data };
            }
            };
        var putApi = {
            method : 'PUT',
            isArray : false,
            headers : { "Content-Type" : "application/xml" },
            transformResponse : function (data) {
                return { "xml" : data };
            }
            };
        var putPostJsonApi = function(meth) { return {
            method : meth,
            isArray : false,
            headers : { "Content-Type" : "application/xml" },
            transformResponse : function (data) {
                return { "xml" : data };
                },
            transformRequest : function(data) {
                var xmlData = x2js.json2xml(data);
                var cleanedXmlData = XsltService.transform('cleanupForm', xmlData);
                return cleanedXmlData;
                }
            };
        };
        var putJsonApi = putPostJsonApi("PUT");
        var postJsonApi = putPostJsonApi("POST");
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
            "/api/changes" : $resource(
                '/api/changes',
                {
                    "by" : "",
                    "type" : "",
                    "from" : "",
                    "to" : "",
                    "start" : 1,
                    "max-results" : 100
                },
                {
                    'getJSON': {
                        method : "GET",
                        transformResponse : function(data) {
                            var jdata = $.parseXML(data);
                            return $(".result", jdata).map(
                                function(i, result) {
                                    return {
                                        "resource" : $("a",result).html(),
                                        "api" : $("a",result).attr("href"),
                                        "changes" : $(".change",result).map(
                                            function(j, change) {
                                                return {
                                                    "who" : $(".who", change).html().replace(/^\/user\//, ""),
                                                    "timestamp" : new Date(Date.parse($(".when", change).html())),
                                                    "message" : $(".message", change).html()
                                                };
                                            }
                                        )
                                    };
                                } 
                            );
                        }
                    }
                }
            ),
            "/api/jobs" : $resource(
                '/api/jobs\/:job',
                {
                    job : ""
                },{
                    'get' : { // XML
                        method : "GET",
                        transformResponse : []
                    },
                    'getJSON' : {
                        method : "GET",
                        transformResponse : function(data) {
                            var js = x2js.xml_str2json(data);
                            var getInterval = function(startTime, endTime) {
                                var interval = new Date(endTime) - new Date(startTime);
                                var x = interval / 1000;
                                var seconds = (x % 60);
                                x /= 60;
                                var minutes = Math.round(x % 60);
                                x /= 60;
                                var hours = Math.round(x % 24);
                                x /= 24;
                                var days = Math.round(x);

                                return {
                                    "days": days,
                                    "hours": hours,
                                    "minutes" : minutes,
                                    "seconds" : seconds
                                };
                            };

                            var now = new Date().toString();

                            // map resource,stage to a completion timestamp
                            var finished = js.job.finish_asArray ? 
                                js.job.finish_asArray.map(
                                    function(f, i) { return [f._resource, f._stage, f._timestamp]; }
                                ).reduce(
                                    function(prev, current) { 
                                        prev[[current[0], current[1]]] = current[2]; 
                                        return prev; 
                                    } , {}
                                )
                                : {};
                            var failed = js.job._state == "failed";
                            var completed = js.job._state == "complete";

                            return {
                                "state" : js.job._state,
                                "processing_time" : getInterval(js.job._started, js.job._completed ? js.job._completed : js.job._failed ? js.job._failed : now), 
                                "error" : js.job.fail ? js.job.fail.__text : "",
                                "steps" : js.job.start_asArray ? (
                                    js.job.start_asArray.map(function(start, i) {
                                        var completionTime = finished[[start._resource, start._stage]];
                                        var rs = start._resource.replace(/(\/exist\/restxq)?\/api\/data\//, "")
                                            .split("/");
                                        return {
                                            "type" : rs[0],
                                            "resource" : decodeURI(rs[1]),
                                            "stage" : start._stage,
                                            "processing_time" : getInterval(start._timestamp, completionTime ? 
                                                completionTime : failed ? js.job._failed : now),
                                            "state" : completionTime ? "complete" : failed ? "failed" : "working"
                                        }
                                    })
                                ) : []
                            };
                        }
                    }
                }
            ),
            "/api/data/conditionals" : $resource(
                '/api/data/conditionals\/:resource',
                { 
                    resource : ""
                },
                {
                    'get' : getApi,
                    'put' : putApi,
                    'query' : queryApi
                }
            ),
            "/api/data/linkage" : $resource(
                '/api/data/linkage\/:resource',
                { 
                    resource : ""
                },
                {
                    'get' : getApi,
                    'put' : putApi,
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/linkage\/:resource"),
                    'setAccess' : setAccessApi("/api/data/linkage\/:resource")
                }
            ),
            "/api/data/notes" : $resource(
                '/api/data/notes\/:resource',
                { 
                    resource : ""
                },
                {
                    'get' : getApi,
                    'put' : putApi,
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/notes\/:resource"),
                    'setAccess' : setAccessApi("/api/data/notes\/:resource")
                }
            ),
            "/api/data/original" : $resource(
                '/api/data/original\/:resource',
                { 
                    resource : ""
                },
                {
                    'get' : getApi,
                    'put' : putApi,
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/original\/:resource"),
                    'setAccess' : setAccessApi("/api/data/original\/:resource"),
                    'backgroundCompile' : {
                        method : "POST",
                        url : "/api/data/original\/:resource\/combined",
                        params : {
                            "format" : "html",
                            "transclude" : "true"
                        },
                        transformResponse : function(data, headers) {
                            return {
                                "job" : headers("Location").replace("/exist/restxq/api/jobs/", ""),
                            };
                        }
                    },
                    'getCompiled' : {
                        method : "GET",
                        url : "/api/data/original\/:resource\/combined",
                        params : {
                            "transclude" : true
                        },
                        headers : {
                            "Accept" : "application/xhtml+xml"
                        },
                        transformResponse : function (data) {
                            return { "xml" : data };
                        }
                    }
                }
            ),
            "/api/data/sources" : $resource(
                '/api/data/sources\/:resource',
                { 
                    resource : ""
                },
                {   
                    'get' : getApi,
                    'put' : putApi,
                    'putJSON' : putJsonApi,
                    'postJSON' : postJsonApi,
                    'query' : queryApi
                }
            ),
            "/api/data/styles" : $resource(
                '/api/data/styles\/:resource',
                { 
                    resource : ""
                },
                {   
                    'get' : getApi,
                    'put' : putApi,
                    'query' : queryApi,
                    'getAccess' : getAccessApi("/api/data/styles\/:resource"),
                    'setAccess' : setAccessApi("/api/data/styles\/:resource")
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



