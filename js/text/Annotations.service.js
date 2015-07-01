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
            load : function(resource) {
                // load an annotation resource (if not already loaded)
                // return a promise
                if (resource in resources) {
                    var deferred = $q.defer();
                    deferred.resolve(resources[resource]);
                    return deferred.promise;
                }
                else {
                    return $http.get("/api/data/notes/" + encodeURIComponent(resource))
                        .then(function(response) {
                            resources[resource] = response.data;
                            return resources[resource];
                        });
                }
            },
            getNote : function(resource, id) {
                // get an annotation resource, with the given id
                // return the (HTML) content as a promise
                return this.load(resource)
                    .then(function(resourceContent) {
                        return XsltService.serializeToString(
                            XsltService.transformString("/js/text/Annotation.get.xsl", resourceContent, {
                                id : id
                            }) 
                        );
                    });
            },
            saveAll : function() {
                // save all the (changed) resources
            },
            getResourceIdno : function(resource) {
                // get the annotation idno's of a given resource
            },
            setResourceIdno : function(resource, id) {
                // change the annotation idno(s) of a given resource (must be loaded!)
            },
            content : function(resource, id, type, content) {
                // get or set the type and/or content of a given resource/annotation
                // sync every reference to it in the TextService to have the same content
            }
        };
    }
]);
