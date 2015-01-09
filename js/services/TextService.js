/* Represents the data model of a JLPTEI text and isolates its components
 * TODO: move all save() activity to this service
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service("TextService", [
    "$http", "XsltService",
    function($http, XsltService) {
    var xj = new X2JS({ arrayAccessForm : "property" });   
    return {
        _content : "",
        _flatContent : "",  // the flat part of the content has to be cached because the editors can't handle using ngModelOptions
        _isFlat : false,
        _resource : "",
        _resourceApi : "",
        loadFlat : function(resource) {
            // load the content from the given resource (without path!) as a flat document
            // only original documents can be loaded flat
            // return the result of a $http call. errors are catchable through .error
            return this.load("/api/data/original", resource, true);
        },
        load : function(resourceApi, resource, flat) {
            // load the content from the given resourceApi/resource (without path!) 
            // return the result of a $http call. errors are catchable through .error
            // load flat (for original only) if flat=true
            var thiz = this;
            return $http.get(resourceApi + "/" + encodeURIComponent(resource) + (flat ? "/flat" : ""),
                {
                    headers : { 
                        "Accept" : "application/xml"
                    },
                    transformResponse : function(data, headersGetter, httpStatus) {
                        if (!data.match(/^\<error/) && data.match(/^\</)) {
                            var templated = XsltService.serializeToStringTEINSClean(
                                XsltService.transformString("/xsl/originaltemplate.xsl", data),
                                flat
                            );
                            var flattened = flat ? 
                                XsltService.indentToString(
                                    XsltService.transformString("/xsl/FlatToEditingHtml.xsl", templated)
                                ) 
                                : templated;
                            return flattened;
                            
                        }
                        else return data;
                    }
                })
                .success(function(data) {
                    thiz._resource = resource;
                    thiz._resourceApi = resourceApi;
                    thiz._content = data;
                    thiz._isFlat = flat || false;
                    thiz._flatContent = flat ? thiz.flatContent() : "";
                    
                    return thiz;
                });
        },
        setResource : function(resourceApi, resource, flat) {
            // set the resource path and whether it is flat (used for new documents, for example)
            this._resource = resource;
            this._resourceApi = resourceApi;
            this._isFlat = flat || false;
        },
        content : function(setContent) {
            if (setContent) {
                this._content = setContent;
                return this;   
            }
            return this._content;
        },
        partialContent : function(contentElement, setContent) {
            /* replace a single-instance element's content.
                There must be exactly one of the contentElement in _content to use this function
             */
            if (setContent) {
                var regex = new RegExp("(<"+contentElement+"[^>]*>\\s*)[\\S\\s]*(\\s*</"+contentElement+">)", "gm");
                this._content = this._content.replace(regex, "$1" + setContent + "$2");
                return this;
            }
            return (this._content) ? $(contentElement.replace(":", "\\:"), this._content).html() : "";
        },
        streamText : function(setContent) { return this.partialContent("j:streamText", setContent); },
        stylesheet : function(setContent) { return this.partialContent("j:stylesheet", setContent); },
        annotations : function(setContent) { return this.partialContent("j:annotations", setContent); },
        flatContent : function(setContent) { 
            if (setContent) {
                this._flatContent = setContent;
            }
            return this.partialContent("tei:text", setContent); 
        },
        title : function(titleJson) {
            // [ {title :, lang:, subtitle: } ]
            
            if (titleJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetTitles.xsl", this._content, { 
                        "new-titles" : xj.json2xml(angular.fromJson(angular.toJson({titles : {title : titleJson}})))}
                ));
                return this;
            }
            return xj.xml2json(XsltService.transformString("/xsl/GetTitles.xsl", this._content)).titles.title_asArray;
        },
        responsibility : function(respJson) {
            // [ {respName, respType, respText, respRef} ]
            
            if (respJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetResps.xsl", this._content, { 
                        "new-respStmts" : xj.json2xml(angular.fromJson(angular.toJson({respStmts : {respStmt : respJson}})))}
                ));
                return this;
            }
            var js = xj.xml2json(XsltService.transformString("/xsl/GetResps.xsl", this._content))
            
            return ("respStmt" in js.respStmts) ? js.respStmts.respStmt_asArray : [];
        },
        license : function(licenseJson) {
            // return or accept { license : "string" }
            if (licenseJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetLicense.xsl", this._content, licenseJson));
                return this;
            }
            return { license : $("tei\\:licence", this._content).attr("target") };
        },
        sources : function(sourcesJson) {
            // { sources : 
            if (sourcesJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetSources.xsl", this._content, {
                        "new-sources" : xj.json2xml(angular.fromJson(angular.toJson({sources : {bibl : sourcesJson}})))
                    }));
                return this;
            }
            var js = xj.xml2json(XsltService.transformString("/xsl/GetSources.xsl", this._content))
            // the title is URL encoded. Decode it here
            if ("bibl_asArray" in js.sources) {
                var bibl = js.sources.bibl_asArray;
                for (var i=0; i < bibl.length; i++) {
                    bibl[i].title = decodeURIComponent(bibl[i].title);
                    bibl[i].scope.fromPage = parseInt(bibl[i].scope.fromPage);
                    bibl[i].scope.toPage = parseInt(bibl[i].scope.toPage);
                    bibl[i].contents.stream.streamChecked = 
                        (bibl[i].contents.stream.streamChecked == "false") ? false : true; 
                    for (var j=0; j < bibl[i].contents.stream.id_asArray.length; j++) {
                        bibl[i].contents.stream.id_asArray[j].checked =
                            (bibl[i].contents.stream.id_asArray[j].checked == "false") ? false : true;
                    }
                }
                return bibl; 
            }
            else {
                return [];
            }
        },
        commitMessage : function(newMessage) {
            // get or set current commit message 
            // { message : "" }
            var xjc = new X2JS({ "arrayAccessForm" : "none", "emptyNodeForm" : "text" }); 
            if (newMessage) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetCommitMessage.xsl", this._content, {
                        "commit-message" : newMessage.message.__text
                    }));
                return this;
            }
            return xjc.xml2json(XsltService.transformString("/xsl/GetCommitMessage.xsl", this._content));
        },
        commitLog : function() {
            // return value is [{ who, when, message }...]
            var js = xj.xml2json(XsltService.transformString("/xsl/GetCommitLog.xsl", this._content));
            return ("change_asArray" in js.changes) ? js.changes.change_asArray : [];
        },
        listXmlIds : function(contextCharacters, streamOnly) {
            var js = xj.xml2json(XsltService.transformString("/xsl/ListXmlId.xsl", this._content, {
                "context-chars" : contextCharacters || 30
            })).xmlids.xmlid_asArray;
            return js.filter(function(x) { return !(streamOnly && x.stream == 'N') });
        }
    };
}]);
