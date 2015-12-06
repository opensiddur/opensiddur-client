/* Load data for inline inclusion
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.service("InlineService", [
    "$q", "CompiledService", "TextService", "XsltService", function(
    $q, CompiledService, TextService, XsltService
    ) {
    var resources = {}; // cache store resources as key : value pairs
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
        load : function(docuri, fragment) {  
            var resource = decodeURIComponent(docuri.split("/").pop());
            var parsedFragment = parseFragment(fragment);
            if (resource in resources) {
                var def = $q.defer();
                var res = resources[resource];
                var extracted = extractFragment(res, parsedFragment);
                def.resolve(extracted);
                return def.promise; 
            }
            else {
                /* TODO: set off a compilation job and when it's ready, come back to compiledservice result */
                return CompiledService.get(resource)
                .then(
                    function(data) {
                        resources[resource] = data;
                        return extractFragment(data, parsedFragment);
                    },
                    function(error) {
                        $q.reject(error.data);
                    }
                )
            } 
        }
    }
}]);
