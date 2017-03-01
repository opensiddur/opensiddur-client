/* Conditional Defintions Service
 * query, store, look up conditional definitions
 *
 * Open Siddur Project
 * Copyright 2016-2017 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.service("ConditionalDefinitionsService", [
    "$http", "$q", "ErrorService", "TextService", "XsltService",
    function($http, $q, ErrorService, TextService, XsltService) {

    var xj = new X2JS({ arrayAccessForm : "none", emptyNodeForm : "text" });
    var xja = new X2JS({ arrayAccessForm : "property" });

    var definitions = {};           // loaded definitions stored by type, with reference to resource
    var loadedResources = {};       // list of loaded resources and which definitions are defined there
    var resourceMetadata = {};      // metadata by resources (not saved with the resource)

    var definitionsByResource = function(resource) {
        // get the definitions from a given resource
        var loadedDefinitions = loadedResources[resource];
        var resourceDefinitions = {};
        loadedDefinitions.map(function(definitionName) {
            resourceDefinitions[definitionName] = definitions[definitionName];
        });
        return resourceDefinitions;
    };
/*
    var resourceNameToFeatureType = function(resource) {
        // convert a resource name to a feature type
        return resource.replace(/\s+/, "_");
    };
      */
    return {
        query: function (queryString, start, maxResults) {
            // query conditional defintions, return a promise to JSON results
            // default start=1, maxResults = 100
            // the results will look like:
            // results/result+/(type, resource, fs+/(desc, f+/(name, desc, switch, default)))
            return $http.get("/api/data/conditionals", {
                params: {
                    q: queryString,
                    "decls-only": "true",
                    "start": start || 1,
                    "max-results": maxResults || 100
                },
                headers: {
                    "Accept": "application/xml"
                }
            })
                .then(function (result) {     // success, return type, type description, feature name, and feature description
                        var transformed = XsltService.serializeToString(
                            XsltService.transformString("/js/text/ConditionalDefinitionsQuery.get.xsl",
                                result.data));
                        var js = xj.xml_str2json(transformed);
                        if ("results" in js && "result" in js.results) {
                            return js["results"]["result"].map(function (r) {
                                return {
                                    title: decodeURIComponent(r.title),
                                    url: r.url,
                                    contexts: ('contexts' in r) ? [r.contexts] : []    // this has to be an array
                                }
                            });
                        }
                        else return [];
                    },
                    function (err) {             // fail
                        return $q.reject(err);
                    }
                );
        },
        /*
         lookupType : function(type) {
         // look up a conditional definition by type, return a promise to the JSON definition
         // of the type
         },
         lookupFeature : function(type, feature) {
         // look up a conditional definition by feature name,
         // return a promise to the JSON definition of the feature

         },
         */
        /*
         newDocument : function(resource) {
         // resource is the resource name and type name
         var template =
         "<template>" +
         "<title><main>" + resource + "</main></title>" +
         "<lang>en</lang>" +
         "<license>http://www.creativecommons.org/publicdomain/zero/1.0</license>" +
         "<source>/data/sources/Born%20Digital</source>" +
         "<sourceTitle>Born Digital</sourceTitle>" +
         "</template>";
         var featureTypeName = resourceNameToFeatureType(resource);
         resourceMetadata[resource] = { isNew : true };
         loadedResources[resource] = [ featureTypeName ];
         definitions[featureTypeName] = {};
         resourceXml[resource] = XsltService.serializeToString(
         XsltService.transformString("/js/text/ConditionalDefinitions.template.xsl", template));
         return definitions[featureTypeName];
         },*/
        load: function (resource) {
            // load all conditional definitions from a given resource
            // return a promise to the definitions
            // the format looks like this:
            // definition : {
            //    name : "",
            //    description : [{"lang" : "description"}...],
            //    features : [{
            //        name : "",
            //        desc : [{ "lang" : "description" }...]
            //        type : "yes-no" | "yes-no-maybe" | "on-off" | "string",
            //        default : [{
            //            value: "YES" | "NO" | "ON" | "OFF" | "MAYBE" | "...",
            //            expression : "" - conditional expression that leads to the given value (optional)
            //        },...]
            //    }...]
            // }
            if (resource in loadedResources) {
                return $q.when(definitionsByResource(resource));
            }
            else {
                return this.reload(resource).then(
                    function() {
                        return definitionsByResource(resource);
                    }
                );
            }
        },/*
        loadLocal : function() {
            // load conditional definitions from the "local" document
            var localResourceName = TextService._resource;
            return this.load(localResourceName)
                .catch(err) {
                    if (err.status == 404) {
                        return newDocument(localResourceName);
                    }
                    else {
                        return $q.reject(err.data);
                    }
                };
        },
        saveLocal : function() {
            // save local conditional definitions
            var localResourceName = TextService._resource;
            return this.save(localResourceName);
        },*/
        reload : function(resource) {
            // reload all conditional definitions from a given resource,
            // return a promise to the definitions
            return $http.get("/api/data/conditionals/" + encodeURIComponent(resource)).
                then(function(data) {
                    var transformed = XsltService.transformString("/js/text/ConditionalDefinitions.get.xsl", data.data);
                    var defs = xja.xml2json(transformed).definitions.definition_asArray;
                    loadedResources[resource] = defs.map(function(def) {
                        definitions[def.name] = def;
                        return def.name;
                    });
                    resourceMetadata[resource] = {
                        isNew : false,          // is the resource new?
                        isDirty : false,        // has the resource content been changed with set(), remove()?
                        xmlAtLoad : data.data
                    };

                    return definitions;
                }, 
                function(err) {
                    return $q.reject(err.data);
                });
        },
        remove : function(resource, conditionalType) {
            // remove a conditional type from a resource
            delete definitions[conditionalType];
            loadedResources[resource] = loadedResources[resource].filter(function(c) { return c != conditionalType; });
            resourceMetadata[resource].isDirty = true;
        },
        set : function(resource, defs) {
            // set a specific resource to a particular set of definitions
            delete loadedResources[resource];
            $.map(defs, function(d) {   // defs is an object
                definitions[d.name] = d;
            });
            loadedResources[resource] = $.map(defs, function(d) { return d.name; });
            resourceMetadata[resource].isDirty = true;
        },
        saveAll : function() {
          // save all changed definitions
            var thiz = this;
            return $q.all(
                    $.map(resourceMetadata, function(metadata, resource) {
                    if (metadata.isDirty) {
                        return thiz.save(resource);
                    }
                })
            );
        },
        save : function(resource) {
          // save the conditional definitions defined in the given (loaded) resource
            var thiz = this;
            var definitionsInResource = loadedResources[resource];
            var definitionsAsXml = '<tei:fsdDecl xml:id="cond" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0">' +
                definitionsInResource.map(function(defn) {
                var def = definitions[defn];
                return `<tei:fsDecl type="${def.name}">
                    <tei:fsDescr xml:lang="${def.description.lang}">${def.description.desc}</tei:fsDescr>
                    ${
                    def.feature_asArray.map(
                        function(f) {
                            return `<tei:fDecl name="${f.name}">
                                        <tei:fDescr xml:lang="${f.description.lang}">${f.description.desc}</tei:fDescr>
                                        <j:vSwitch type="${f.type}" />
                                        <tei:vDefault>
                                            <j:${ f.default.value.toLowerCase() }/>
                                        </tei:vDefault>
                                    </tei:fDecl>`
                        }    
                    ).join("\n")
                    }
                 </tei:fsDecl>`
            }).join("\n") + "</tei:fsdDecl>";
            // combine with the header.
            var combinedWithHeader =
                XsltService.serializeToStringTEINSClean(
                    (resourceMetadata[resource].isNew) ?
                        XsltService.transformString("/js/text/Conditionals.template.xsl",
                            `<template>
                                <lang>en</lang>
                                <title>
                                    <main>${resource}</main>
                                </title>
                                <license>http://www.creativecommons.org/publicdomain/zero/1.0</license>
                                <sourceTitle>An Original Work for the Open Siddur Project</sourceTitle>
                                <source>/data/sources/Born%20Digital</source>
                                <content>${definitionsAsXml}</content>
                             </template>`)
                        :
                        XsltService.transformString("/js/text/ConditionalDefinitionsXml.save.xsl",
                            resourceMetadata[resource].xmlAtLoad, {
                                "new-definitions" : XsltService.parseFromString(definitionsAsXml)
                            })
                );

            var params = {
                headers : {
                    "Content-type" : "application/xml"
                }
            };
            // Is the resource new? Does it need to be created?
            var operation =  (resourceMetadata[resource].isNew) ?
                $http.post("/api/data/conditionals", combinedWithHeader, params) :
                $http.put("/api/data/conditionals/" + encodeURIComponent(resource), combinedWithHeader, params);
            return operation.then(
                function(data) {
                    return thiz.reload(resource);
                },
                function(err) {
                    ErrorService.addApiError(err.data);
                    $q.reject(err.data);
                }
            )
        }
  };
}]);
