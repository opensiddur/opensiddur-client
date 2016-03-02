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
        var xj = new X2JS({ arrayAccessForm : "property" });   
        return {
          getByPointer : function(ptr) {
            // get conditionals pointed to by the given pointer
            // return the conditional expression(s) as string(s)
            return XsltService.transformString("/js/text/Conditionals.get.xsl", 
              TextService.content(), {
                ptrs : ptr
              });
          },
          set : function(condition) {
            // load a conditional into the document and return its id
          }
        };
    }
]);
