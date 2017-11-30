/* 
    Settings service: get and set settings of various types
    
    Open Siddur Project
    Copyright 2015,2017 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osTextModule.factory("SettingsService", [
    "$http",
    "$q",
    "EditorService",
    "TextService",
    "XsltService",
    function($http, $q, EditorService, TextService, XsltService) {
        var resources = {};    
        var xj = new X2JS({ arrayAccessForm : "property" });   
        return {
            getActiveAnnotations : function(id) {
                // retrieve a list of active annotations that start/end at the given id 
                // the form will be annotations : annotation { name: "", state : "" } }
                var annsXml = XsltService.transformString("/js/text/ActiveAnnotations.get.xsl", 
                    TextService.content(), (id) ? {
                        "id" : id
                    } : undefined); 
                var annsJs = xj.xml2json(annsXml);
                if (typeof(annsJs.annotations)=="string" || !("annotation" in annsJs.annotations)) {
                    // there are no existing annotation settings
                    annsJs.annotations = {};
                    annsJs.annotations.annotation = [];
                    annsJs.annotations.annotation_asArray = [];
                }
                return annsJs;
            },
            setActiveAnnotations : function(annotationSettings, startId, endId) {
                var idRange = (endId && (startId != endId)) ? ("range(" + startId + "," + endId + ")") : startId;
                var annXml = xj.json2xml(angular.fromJson(angular.toJson(annotationSettings)));
                EditorService.syncEditorToTextService();
                TextService.content(
                    XsltService.serializeToStringTEINSClean(
                        XsltService.transformString("/js/text/ActiveAnnotations.set.xsl", 
                            TextService.content(),{
                            "id" : idRange,
                            "annotations" : annXml
                        }), 
                        true
                    )
                );
                EditorService.syncTextServiceToEditor();
            },
            getSettingsByPointer : function(ptr) {
              // get settings by pointer
              var setXml = ptr ? XsltService.transformString("/js/text/ActiveSettings.get.xsl", TextService.content(), { id : ptr }) : undefined;
              var setJs = ptr ? xj.xml2json(setXml) : {settings : ""}; 
              if (typeof(setJs.settings)=="string" || !("setting" in setJs.settings)) {
                // no current settings
                setJs.settings = {};
                setJs.settings.setting = [];
                setJs.settings.setting_asArray = [];
              }
              return setJs;
            },
            setSettings : function(settings) {
              // put the settings in a settings structure (like from getSettingsByPointer()) 
              // into a document. Return shorthand pointers to the settings xmls.
              var cleanup = function(x) {
                return x.replace(/[^\w-]+/g, "_")
              };
              var settingsXml = xj.json2xml(angular.fromJson(angular.toJson(settings)));
              var ptrs = settings.settings.setting.map(
                function(s) {
                  return '#'+cleanup(s.type)+"_"+cleanup(s.name)+"_"+cleanup(s.state);
                }
              );
              TextService.content(
                XsltService.serializeToStringTEINSClean(
                  XsltService.transformString("/js/text/ActiveSettings.set.xsl",
                    TextService.content(), {
                      "settings" : settingsXml
                    }), true
                )
              );
              return ptrs;
            } 
        };
    }
]);
