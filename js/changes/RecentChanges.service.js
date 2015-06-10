/*
    Recent changes API service
    
    Open Siddur Project
    Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osRecentChangesModule.factory("RecentChangesService", [
    "$http", function($http) {
        var defaultParams = {
            by : "",
            type : "",
            from : "",
            to : "",
            start : 1,
            "max-results" : 100
        };

        var editingLinks = {
            "original" : "texts",
            "sources" : "sources",
            "styles" : "styles",
            "users" : "contributors",
            "notes" : "annotations",
            "linkage" : "translations",
            "conditionals" : "conditionals"  
        };

        var transformResponse = function(data, headers, httpStatus) {
            if (httpStatus >= 400 || data.match("<error")) {
                return data;
            }
            var jdata = $.parseXML(data);
            return $(".result", jdata).map(
                function(i, result) {
                    var api = $("a",result).attr("href").replace("/exist/restxq/api/data/", "");
                    var sp = api.split("/");
                    
                    return {
                        "resource" : $("a",result).html(),
                        "editLink" : "/" + editingLinks[sp[0]] + "/" + sp[1],
                        "api" : api,
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

        return {
            params : function() {
                return angular.copy(defaultParams);
            },
            load : function(params) {
                // return a JSON-ified version of the recent changes listing
                var params = $.extend(defaultParams, params);
                return $http.get("/api/changes", {
                        params : params,
                        headers : {
                            "Accept" : "application/xml"
                        },
                        transformResponse : transformResponse
                    });
            }
        };
    }
]);
