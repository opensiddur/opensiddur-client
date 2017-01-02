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

    var xj = new X2JS({ arrayAccessForm : "property" });
    /*
    var definitions = {};           // loaded definitions stored by type, with reference to resource
    var loadedResources = {};       // list of loaded resources and which definitions are defined there
    var resourceMetadata = {};      // metadata by resources (not saved with the resource)
    var resourceXml = {};           // saved XML from loaded resources
        
    var definitionsByResource = function(resource) {
        // get the definitions from a given resource
        var loadedDefinitions = loadedResources[resource];
        var resourceDefinitions = {};
        for (var definitionName in loadedDefinitions) {
            resourceDefinitions[definitionName] = definitions[definitionName];
        }
        return resourceDefinitions;
    };

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
                q: queryString,
                "decls-only": "true",
                "start": start || 1,
                "max-results": maxResults || 100
            })
                .then(function (result) {     // success, return type, type description, feature name, and feature description
                    var transformed = XsltService.transformString("/js/text/ConditionalDefinitionsQuery.get.xsl", result);
                    var results = xj.xml_str2json(transformed)["results"]["result_asArray"].map(function (result) {
                        if (result._type == "type") {
                        }
                    });
                },
                function (err) {             // fail
                    return $q.reject(err);
                }
            );
        }
    };/*,
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
        },
        load : function(resource) {
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
                return this.reload(resource);
            }
        },
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
        },
        reload : function(resource) {
            // reload all conditional defintions from a given resource,
            // return a promise to the definitions
            return $http.get("/api/data/conditionals/" + encodeURIComponent(resource)).
                then(function(data) {
                    var transformed = XsltService.transformString("/js/text/ConditionalDefinitions.get.xsl", data);
                    var defs = xj.xml2json(transformed).definitions.definition_asArray;
                    resourceXml[resource] = data;
                    loadedResources[resource] = defs.map(function(def) { return def.name.__text; });
                    resourceMetadata[resource] = {
                        isNew : false
                    };
                    for (var def in defs) {
                        definitions[def.name.__text] = def;
                    }
                    return definitions;
                }, 
                function(err) {
                    return $q.reject(err.data);
                });
    },
    save : function(resource) {
      // save the conditional definitions defined in the given (loaded) resource
    }
  };*/
}]);
