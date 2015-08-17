/* 
    Settings service: get and set settings of various types
    
    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osTextModule.factory("SettingsService", [
    "$http",
    "$q",
    "TextService",
    "XsltService",
    function($http, $q, TextService, XsltService) {
        var resources = {};    
        var xj = new X2JS({ arrayAccessForm : "property" });   
        return {
            getActiveAnnotations : function(id) {
                // retrieve a list of active annotations that start/end at the given id 
                // the form will be annotations : annotation { name: "", state : "" } }
                var annsXml = XsltService.transformString("/js/text/ActiveAnnotations.get.xsl", 
                    TextService.content()/*, (id) ? {
                        "id" : id
                    } : undefined*/); 
                debugger;
                var annsJs = xj.xml2json(annsXml);
                return annsJs;
            },
            setActiveAnnotations : function(annotationSettings, startId, endId) {
                var idRange = (endId && (startId != endId)) ? ("range(" + startId + "," + endId + ")") : startId;
                TextService.content(
                    XsltService.serializeToStringTEINSClean(
                        XsltService.transformString("/js/text/ActiveAnnotations.set.xsl", 
                            TextService.content(),{
                            "id" : idRange,
                            "settings" : annotationSettings
                        })
                    )
                );
            }
        };
    }
]);
