/* Load data for inline inclusion
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.service("InlineService", [
    "$q", "$timeout", "CompiledService", "JobsService", "TextService", "XsltService", function(
    $q, $timeout, CompiledService, JobsService, TextService, XsltService
    ) {
    var resources = {}; // cache store resources as key : value pairs
    var resourceJobs = {}; // cache store of key : value pairs for jobs compiling each resource
    var parseFragment = function(fragment) {
        // return start and end points of a fragment
        if (fragment.startsWith("range(")) {
            var f = fragment.replace(/^range\(|\)$/g, '');
            var from = f.split(",")[0];
            var to = f.split(",")[1];
            return {
                start : from,
                end : to
            };
        }
        else {
            return {
                start : fragment, 
                end : fragment
            };
        }
    };
    var killXmlns = function(str) {
        return str.replace(/\s+xmlns(:[a-zA-Z0-9]+)?=["][^"]+["]/g, "");
    };
    var extractFragment = function(docText, pfragment) {
        // extract the (parsed) fragment from the given document
        return killXmlns(XsltService.serializeToString(XsltService.transformString("/js/text/ExtractFragment.xsl", docText, 
            pfragment)));
    };
    return {
        load : function(docuri, fragment, reload) {
            var reload = reload || false;       // forced reload?  
            var resource = decodeURIComponent(docuri.split("/").pop());
            var parsedFragment = parseFragment(fragment);
            if (resource == TextService._resource) {
                var def = $q.defer();
                var extracted = extractFragment(TextService.syncFlatCopy(), parsedFragment);
                def.resolve(extracted);
                return def.promise;   
            }
            else if (resource in resources && !reload) {
                var def = $q.defer();
                var res = resources[resource];
                var extracted = extractFragment(res, parsedFragment);
                def.resolve(extracted);
                return def.promise; 
            }
            else if (resource in resourceJobs && !reload) {
                return resourceJobs[resource];
            }
            else {
                var waitForComplete = function(jobId) {
                    return JobsService.getJSON(jobId)
                        .then(function(stat) {
                            if (stat.state == "complete") {
                                return CompiledService.get(resource)
                                    .then(
                                        function(data) {
                                            resources[resource] = data;
                                            return extractFragment(data, parsedFragment);
                                        },
                                        function(error) {
                                            return $q.reject(error);
                                        }
                                    )
                            }
                            else if (stat.state == "failed") {
                                return $q.reject(stat.state);
                            }
                            else {
                                return $timeout(function() {return waitForComplete(jobId);}, 1000);
                            } 
                        }, function(error) {
                            return $q.reject(error);
                        });
                };

                resourceJobs[resource] = JobsService.start(resource)
                .then(
                    function(data) {
                        return waitForComplete(data.job);
                    },
                    function(error) {
                        return $q.reject(error.data);
                    }
                );
                return resourceJobs[resource];
            } 
        }
    }
}]);
