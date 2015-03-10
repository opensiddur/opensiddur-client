/* Represents the data model of a JLPTEI text and isolates its components
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service("TextService", [
    "$http", "$q", "$timeout", "ErrorService", "XsltService",
    function($http, $q, $timeout, ErrorService, XsltService) {
    var xj = new X2JS({ arrayAccessForm : "property" });   
    var documentTemplates = {
        "/api/data/original" : "/templates/original.xsl",
        "/api/data/conditionals" : "/templates/conditionals.xsl",
        "/api/data/notes" : "/templates/annotations.xsl",
        "/api/data/styles" : "/templates/styles.xsl"
    };
    var flatDocumentTemplates = {
        "/api/data/original" : "/templates/flatoriginal.xsl"
    };
    return {
        _content : "",
        _flatContent : "",  // the flat part of the content has to be cached because the editors can't handle using ngModelOptions
        _isFlat : false,
        _resource : "",
        _resourceApi : "",
        newDocument : function(resourceApi, newDocumentTemplate, flat) {
            this.content("");
            this._resource = "";
            this._resourceApi = resourceApi;
            this._isFlat = flat;   
 
            var templateParameters = x2js.json2xml(newDocumentTemplate);
            var strdoc = XsltService.indentToString(XsltService.transform((flat ? flatDocumentTemplates : documentTemplates)[resourceApi], templateParameters), flat);
            this.content(strdoc);
            this._flatContent = flat ? this.flatContent() : "";
        }, 
        loadFlat : function(resource) {
            // load the content from the given resource (without path!) as a flat document
            // only original documents can be loaded flat
            // return the result of a $http call. errors are catchable through .error
            return this.load("/api/data/original", resource, true);
        },
        get : function(resourceApi, resource, flat) {
            // get the content of the resource without loading it.
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
                                    XsltService.transformString("/xsl/FlatToEditingHtml.xsl", templated),
                                    flat
                                ) 
                                : templated;
                            return flattened;
                            
                        }
                        else return data;
                    }
                })

        },
        load : function(resourceApi, resource, flat) {
            // load the content from the given resourceApi/resource (without path!) 
            // return the result of a $http call. errors are catchable through .error
            // load flat (for original only) if flat=true
            var thiz = this;
            return this.get(resourceApi, resource, flat)
                .success(function(data) {
                    thiz._resource = resource;
                    thiz._resourceApi = resourceApi;
                    thiz._content = data;
                    thiz._isFlat = flat || false;
                    thiz._flatContent = flat ? thiz.flatContent() : "";
                    
                    return thiz;
                });
        },
        syncFlat : function () {
            // one way synchronize the _flat content with the XML content. Return the synchronized content.

            // rejoin flatContent to content
            this.flatContent(this._flatContent); 
            return this._content;
        },
        save : function() {
            var httpOperation = this._resource ? $http.put : $http.post;
            var deferred = $q.defer();  // for errors
            var extendPromise = function(promise) {
                // extend a promise to make it behave like $http
                promise.success = function(fn) {  
                    promise.then(function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                  };

                promise.error = function(fn) {  
                    promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };
                return promise;
            };
            if (this._isFlat) {
                this.syncFlat();
                // convert content back to XML
                var backupContent = this._content;      // this needs to be saved so if the save fails, we can go back easily
                this._content = XsltService.indentToString(
                        XsltService.transformString("/xsl/EditingHtmlToXml.xsl", this._content)
                    );
            }
            var thiz = this;
            var content = this._content;
            var transformed =
                XsltService.transformString( "/xsl/OriginalBeforeSave.xsl", content );
            if (transformed) {
                var indata = XsltService.serializeToStringTEINSClean(transformed);
                jindata = $(indata);
                if (jindata.prop("tagName") == "PARSERERROR") {
                    deferred.reject("Parser error: invalid XML: " + jindata.html());
                    return extendPromise(deferred.promise);
                }
                else if ($("tei\\:title[type=main]", jindata).text().length == 0 && 
                        $("tei\\:title[type=main]", jindata).children().length == 0) {
                    deferred.reject("A main title is required");
                    return extendPromise(deferred.promise);
                }
                else {
                    return httpOperation(this._resourceApi + (this._resource ? ("/" + this._resource) : ""), 
                        indata)
                        .success(function (data, statusCode, headers) {   // success
                            if (statusCode == 201) {
                                // created
                                thiz._resource = decodeURI(headers('Location').replace("/exist/restxq"+thiz._resourceApi+"/", ""));
                            }
                            return extendPromise($timeout(function() { return thiz.load(thiz._resourceApi, thiz._resource, thiz._isFlat); }, 500));
                            
                        })
                        .error(function(err) {
                            if (thiz._isFlat) {
                                thiz._content = backupContent;
                            }

                            return err;
                        });
                }
            }
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
            return this.partialContent("jf:merged", setContent); 
        },
        language : function(setLanguage) {
            // primary language
            if (setLanguage) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetLanguage.xsl", this._content, { 
                        "language" : setLanguage.language}), this._isFlat);
                return this;
            }
            var l =  this._content.match(/xml:lang="([^"]+)"/);

            return { language : l ? l[1] : "" }; // this relies on xml:lang being required
        },
        title : function(titleJson) {
            // [ {title :, lang:, subtitle: } ]
            
            if (titleJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetTitles.xsl", this._content, { 
                        "new-titles" : xj.json2xml(angular.fromJson(angular.toJson({titles : {title : titleJson}})))}
                ), this._isFlat);
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
                ), this._isFlat);
                return this;
            }
            var js = xj.xml2json(XsltService.transformString("/xsl/GetResps.xsl", this._content))
            
            return ("respStmt" in js.respStmts) ? js.respStmts.respStmt_asArray : [];
        },
        license : function(licenseJson) {
            // return or accept { license : "string" }
            if (licenseJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetLicense.xsl", this._content, licenseJson), this._isFlat);
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
                        }),
                    this._isFlat);
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
                    }), this._isFlat);
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
