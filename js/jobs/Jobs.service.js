/* Jobs API module
 
    Open Siddur Project
    Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osJobsModule.service("JobsService", ["$http", function($http) {
    return {
        start : function(resource) {
            // initiate a job to compile the given document
            return $http.post("/api/data/original/"+encodeURIComponent(resource)+"/combined", "",
                {
                    params : {
                        "format" : "html",
                        "transclude" : "true"
                    },
                    transformResponse : function(data, headers, httpStatus) {
                        console.log("transform response was called");
                        if (httpStatus < 400) {
                            return {
                                "job" : headers("Location").replace("/exist/restxq/api/jobs/", "")
                            };
                        }
                        else return data;
                    }
                });
        },
        getCompleted : function(resource) {
            // get the result of a completed compilation
            return $http.get("/api/data/original/"+encodeURIComponent(resource)+"/combined",
                { 
                    params : {
                        "transclude" : true
                    }, 
                    headers : {
                        "Accept" : "application/xhtml+xml"
                    }
                });
        },
        listJSON : function(user, state, fromDate, toDate, start, maxResults) {
            return $http.get("/api/jobs", {
                params : {
                    user : user || "",
                    state : state || "",
                    from : fromDate || "",
                    to : toDate || "",
                    start : start || 1,
                    "max-results" : maxResults || 100
                },
                transformResponse : function(data, headersGetter, httpStatus) {
                    if (httpStatus >= 400 || data.match("<error")) { return data; }
                    return $("li.result", data).map( function(idx, li) {
                        return {
                            "id" : $("a", li).attr("href").split("/").pop(),
                            "resource" : $("a", li).html().replace("/exist/restxq/api/data/original/", ""),
                            "title" : $("span.title", li).html(),
                            "user" : $("span.user", li).html(),
                            "state" : $("span.state", li).html(),
                            "started" : $("span.started", li).html(),
                            "completed" : $("span.completed", li).html(),
                            "failed" : $("span.failed", li).html()
                        }
                    } );
                }
            });
        },
        get : function(job) {
            return $http.get("/api/jobs/"+job);
        },
        getJSON : function(job) {
            return $http.get("/api/jobs/"+job, {
                transformResponse : function(data, headers, httpStatus) {
                    if (httpStatus >= 400) {
                        return data;
                    }
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
                        "resource" : js.job._resource.replace(/(\/exist\/restxq)?\/api\/data\//, ""),
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
                
            });
        }
    }

}]);
