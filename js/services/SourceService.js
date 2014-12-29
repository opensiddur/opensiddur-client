/* Represents the data model of a JLPTEI bibliographic entry and isolates its components
 * TODO: move all load() and save() activity to this service
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service("SourceService", [
    "$resource", "ErrorService", "XsltService",
    function($resource, ErrorService, XsltService) {
    var xj = new X2JS({ arrayAccessForm : "property", emptyNodeForm : "text" });   
    // REST API used internally:
    var rest = $resource(
        '/api/data/sources\/:resource',
        { 
            resource : ""
        },
        {   
            'getJSON' : {
                method : 'GET',
                isArray : false,
                headers : { "Accept" : "application/xml" },
                transformResponse : function (data, headers) {
                    if (data.match(/^<tei/)) {
                        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString("/xsl/sourceformtemplate.xsl", data));

                        return xj.xml_str2json(transformed);
                    }
                    else {
                        return { xml : data };
                    }
                }
            }
        }
    );
    return {
        resource : "",
        loaded : 0,
        _content : {},
        load : function(resource) {
            var thiz = this;
            this.resource = decodeURIComponent(resource);
            return rest.getJSON({ 'resource' : this.resource },
                function (data) {
                    thiz._content = data; 
                    thiz.loaded = 1;
                },
                function (error) {
                    ErrorService.addApiError(error.data.xml);
                    thiz.loaded = 0;
                }
            ).$promise;
        },
        save : function() {
            // TODO; fill it in...
        }
    };
}]);

