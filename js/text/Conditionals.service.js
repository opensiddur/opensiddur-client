/* 
    Conditionals service:
    Read and write conditionals 
    
    Open Siddur Project
    Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osTextModule.factory("ConditionalsService", [
    "$http",
    "$q",
    "TextService",
    "XsltService",
    function($http, $q, TextService, XsltService) {
        var resources = {};    
        var xj = new X2JS({ arrayAccessForm : "property", emptyNodeForm : "text" });   
        return {
          parse : function(cnd) {
            // parse a conditionals string to XML
            return conditionalsToXmlParser.parse(cnd.replace(/\s+/, ""));
          },
          getByPointer : function(ptr) {
            // get conditionals pointed to by the given pointer
            // return a structure of the form:
            // [{_id: "STRING", __text: "STRING"}...]
            return xj.xml2json(
              XsltService.transformString("/js/text/Conditionals.get.xsl", 
                TextService.content(), {
                  ptrs : ptr
                })
            ).conditionals.conditional_asArray;
          },
          set : function(condition) {
            // load a conditional into the document
            // format must be an array of: 
            // [{_id: "STRING", __text: "STRING"}...]
            var cs = this;
            var asXmlStr = (
              '<conditionals xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0">\n' + 
                condition.map(function(c) {
                  return (c.__text ? (
                    '<conditional id="'+c._id+'">' +
                      cs.parse(c.__text) +
                    '</conditional>'
                  ) : "");
                }).join("\n") +
              '</conditionals>');
            var asXml = XsltService.parseFromString(asXmlStr);
            TextService.content(
              XsltService.serializeToStringTEINSClean(
                XsltService.transformString("/js/text/Conditionals.set.xsl", 
                  TextService.content(), {
                    conditional : asXml
                  }), true
              )
            );
          }
        };
    }
]);
