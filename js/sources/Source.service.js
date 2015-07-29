/* Represents the data model of a JLPTEI bibliographic entry and isolates its components
 * TODO: move all load() and save() activity to this service
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osSourcesModule.factory("SourceService", [
    "$http", "XsltService",
    function($http, XsltService) {
    var xj = new X2JS({ arrayAccessForm : "property", emptyNodeForm : "text" });   
    var transformResponse = function (data, headers) {
        if (data.match(/^<tei/)) {
            var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString("/js/sources/SourceForm.template.xsl", data));

            return xj.xml_str2json(transformed);
        }
        else {
            return data;
        }
    };

    var hasData = function(documentPart) {
        // determine if any text nodes in any elements in documentPart have any data in the elements. Does not check attributes 
        var hd = false;
        for (var child in documentPart) {
            if (documentPart.hasOwnProperty(child)) {
                if (child.match("_asArray$")) {
                    hd = documentPart[child].map(
                        function (ch) { return hasData(ch); }
                    ).reduce(function (prev, curr) { return prev || curr; } , hd);
                }
            }
        }
        return hd || Boolean(documentPart.__text);
    };
    var clearData = function(documentPart) {
        for (var child in documentPart) {
            if (documentPart.hasOwnProperty(child)) {
                if (child.match("_asArray$")) {
                    clearData(child);
                }
                else if (child != "_type" && (child == "__text" || child.match("^_[^_]"))) {
                    documentPart[child] = "";
                }
            }
        }
    };

    return {
        resource : "",      // "" = new
        loaded : 0,
        isAnalytic : 0,     // type of bibliography entry
        isSeries : 0,
        content : {},
        loadNew : function() {
            // load a new document
            this.resource = "";
            var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString("/js/sources/SourceForm.template.xsl", "<tei:biblStruct xmlns:tei='http://www.tei-c.org/ns/1.0'/>")); 
            this.content = x2js.xml_str2json(transformed);
            this.isAnalytic = 0;
            this.isSeries = 0;
        },
        load : function(resource) {
            // load an existing document
            var thiz = this;
            this.resource = decodeURIComponent(resource); 
            return $http.get("/api/data/sources/" + resource,
                {
                    headers : { "Accept" : "application/xml" },
                    transformResponse : transformResponse
                }
                )
                .success(function (data) {
                    thiz.content = data; 
                    thiz.loaded = 1;
                    thiz.isAnalytic = hasData(thiz.content.biblStruct.analytic) ? 1 : 0;
                    thiz.isSeries = hasData(thiz.content.biblStruct.series) ? 1 : 0;
                })
                .error(function (error) {
                    thiz.loaded = 0;
                });
        },
        save : function() {
            var thiz = this;
            var indata = angular.fromJson(angular.toJson(this.content));     // need to remove $$hashkey
            if (!this.isAnalytic) {
                // clear the data from the analytic section (__text and _* except _type)
                clearData(indata.biblStruct.analytic);
            }
            if (!this.isSeries) {
                // clear the data from the series section
                clearData(indata.biblStruct.series);
            }
                
            var httpOperation = (this.resource == "") ? 
                $http.post : 
                $http.put;
            var resource = "/api/data/sources" + ((this.resource == "") ? "" : "/") + encodeURIComponent(this.resource);
            return httpOperation(resource, indata, {
                transformRequest : function(data) {
                    var xmlData = x2js.json2xml(data);
                    var cleanedXmlData = XsltService.transform('/js/profile/CleanupForm.xsl', xmlData);
                    return cleanedXmlData;
                }
            })
            .success( 
                function(data, headers) {   //success function
                    if (thiz.resource == "") {
                        var newDocName = decodeURI(headers("Location").split("/").pop());
                        thiz.resource = newDocName;
                    }
                }
            );
        }
    };
}]);

