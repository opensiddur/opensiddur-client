/* 
    Annotations service: keep track of and update annotations in a document
    
    Note: the "local" annotation resource has the same resourceId as the document in TextService.

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osTextModule.factory("AnnotationsService", [
    "$http",
    "$q",
    "TextService",
    "XsltService",
    function($http, $q, TextService, XsltService) {
        /* store all the referenced annotation resources in a cache 
            resourceName : "xml"
        */
        var resources = {};    
        var xj = new X2JS({ arrayAccessForm : "property" });   
        return {
            loadAll : function() {
                // load the content of all annotations in TextService._flatContent
                
                // find which annotation docs need to be loaded
                // load them
                    // on success:
                    // convert the existing notes to JSON+HTML
                    // find the references in TextService
                    // replace the content with the referenced content
                    // call the note loaded
            },
            reload : function(resource) {
                if (resource == "") {
                    return resources[""];
                }
                else return $http.get("/api/data/notes/" + encodeURIComponent(resource))
                    .then(function(response) {
                        resources[resource] = response.data;
                        return resources[resource];
                    },
                    function(error) {
                        return $q.reject(error.data);
                    });
            },
            load : function(resource) {
                // load an annotation resource (if not already loaded)
                // return a promise
                var deferred = $q.defer();
                if (resource in resources) {
                    deferred.resolve(resources[resource]);
                    return deferred.promise;
                }
                else if (resource == "") {
                    // first reference to load an annotation new document. 
                    // there's nothing there yet, so make a blank annotation document
                    var title = TextService.title()[0].text;
                    var src = TextService.sources()[0]; // big assumption!
                    var template = 
                        "<annotationTemplate>" +
                            "<lang>" + TextService.language().language + "</lang>" +  
                            "<title><main>" + title + "</main></title>" +
                            "<license>" + TextService.license().license + "</license>" +
                            "<sourceTitle>" + src.title  + "</sourceTitle>" +
                            "<source>/data/sources/" + src.source + "</source>" +
                            "<initialAnnotation></initialAnnotation>" +
                        "</annotationTemplate>";
                    var templated = XsltService.serializeToStringTEINSClean(
                        XsltService.transformString("/js/text/Save.template.xsl", 
                            XsltService.serializeToStringTEINSClean( // Firefox has some bug where this transform will fail if not serialized first
                                XsltService.transformString("/js/text/Annotations.template.xsl", template)))
                        );
                    resources[""] = templated;
                    deferred.resolve(resources[""]);
                    return deferred.promise;
                }
                else {
                    return this.reload(resource);
                }
            },
            getNote : function(resource, id) {
                // get an annotation resource, with the given id
                // return the (HTML) content as a promise
                return this.load(resource)
                    .then(function(resourceContent) {
                        return XsltService.serializeToStringTEINSClean(
                            XsltService.transformString("/js/text/Annotation.get.xsl", resourceContent, {
                                id : id
                            }) 
                        );
                    });
            },
            getSources : function(resource) {
                // return (a promise pointing to) all the sources used by the given annotation file
                return this.load(resource)
                    .then(function(resourceContent) { 
                        var js = xj.xml2json(XsltService.transformString("/js/text/Sources.get.xsl", resourceContent))
                        // the title is URL encoded. Decode it here (code is copied verbatim from TextService)
                        if ("bibl_asArray" in js.sources) {
                            var bibl = js.sources.bibl_asArray;
                            for (var i=0; i < bibl.length; i++) {
                                bibl[i].title = decodeURIComponent(bibl[i].title);
                                bibl[i].scope.fromPage = parseInt(bibl[i].scope.fromPage);
                                bibl[i].scope.toPage = parseInt(bibl[i].scope.toPage);
                                bibl[i].contents.stream.streamChecked = 
                                    (bibl[i].contents.stream.streamChecked == "false") ? false : true;
                                if ("id_asArray" in bibl[i].contents.stream) { 
                                    for (var j=0; j < bibl[i].contents.stream.id_asArray.length; j++) {
                                        bibl[i].contents.stream.id_asArray[j].checked =
                                            (bibl[i].contents.stream.id_asArray[j].checked == "false") ? false : true;
                                    }
                                }
                            }
                            return bibl; 
                        }
                        else {
                            return [];
                        }
                    });
            },
            getNoteSource : function(resource, id) {
                // return the sources used by the note in given resource/id 
                return this.getSources(resource)
                    .then(function(sources) {
                        return sources.filter(function(s) {
                            return !s.contents.stream.streamChecked && 
                                s.contents.stream.id_asArray.filter(function(i) { return i.xmlid == id; }).length > 0;
                        });
                    });
            },
            setNoteSource : function(resource, id, bibl) {
                // set the source(s) of resource/id to the given bibl
                // bibl is an array of sources. 
                var biblXml = xj.json2xml(angular.fromJson(angular.toJson({sources : { bibl : bibl}})));
                return this.getSources(resource)
                    .then(function(sourceData) {
                        resources[resource] = XsltService.serializeToStringTEINSClean(
                            XsltService.transformString("/js/text/AnnotationSources.set.xsl", resources[resource], {
                                id : id,
                                "new-sources" : biblXml
                            })
                        );
                    });
            },
            saveAll : function() {
                // save all the (changed) resources
                
                // isolate all of the annotations and group by resource
                var annotationsByResource =
                        XsltService.transformString("/js/text/AnnotationsIsolate.xsl", 
                            "<content xmlns='http://www.w3.org/1999/xhtml'>" + TextService._flatContent + "</content>")
                    ;
                var thiz = this;
                // for each resource,
                return $q.all(
                    $.map(annotationsByResource.getElementsByTagNameNS("http://jewishliturgy.org/ns/jlptei/flat/1.0", "annotationResource"),
                        function(annotationResource, idx) {
                            var thisResource = decodeURIComponent(annotationResource.getAttribute("resource").split("/").pop());
                            return thiz.load(thisResource)
                            .then(function(annotationResourceData) {
                                // load the resource and merge the changed annotations into the resource, then PUT
                                console.log("saving to", thisResource);
                                var mergedAnnotations = XsltService.serializeToStringTEINSClean(
                                    XsltService.transformString("/js/text/Save.template.xsl", 
                                        XsltService.serializeToStringTEINSClean( // FF fix
                                            XsltService.transformString("/js/text/AnnotationsMerge.xsl", annotationResourceData, {
                                                annotations : XsltService.parseFromString(XsltService.serializeToStringTEINSClean(annotationResource, true)).childNodes[0] // FF bug...
                                            })
                                        )
                                    )
                                );
                                if (thisResource == "") {
                                    // post a new annotation resource
                                    console.log("annotation resource does not yet exist");
                                    var parentTitle = TextService.title();
                                    // reset the title
                                    mergedAnnotations = XsltService.serializeToStringTEINSClean(
                                        XsltService.transformString("/js/text/Title.set.xsl", mergedAnnotations, { 
                                            "new-titles" : xj.json2xml({titles : {title : parentTitle }})}
                                        ));
                                        
                                    return $http.post("/api/data/notes", mergedAnnotations)
                                        .then(function(response) {
                                            var headers = response.headers;
                                            var resourceName = decodeURIComponent(headers("Location").replace("/exist/restxq/api/data/notes/", ""));
                                            delete resources[""];
                                            TextService.localSettings(
                                                // set the local annotation resource        
                                                $.extend(TextService.localSettings(),{"local-annotation-resource" : encodeURIComponent(resourceName)})
                                            );
                                            return thiz.reload(resourceName);
                                        },
                                        function (error) { 
                                            return $q.reject(error.data); 
                                        });

                                }
                                else {
                                        return $http.put("/api/data/notes/" + encodeURIComponent(thisResource), mergedAnnotations)
                                            .then(function() {
                                                // get any server-induced changes (revision history, eg)
                                                return thiz.reload(thisResource);
                                            },
                                            function(error) { 
                                                return $q.reject(error.data); 
                                            });
                                }
                            });
                        })
                    );
            },
            content : function(resource, id, type, content) {
                // get or set the type and/or content of a given resource/annotation
                // sync every reference to it in the TextService to have the same content
            }
        };
    }
]);
