/* Represents the data model of an outline document 
 * 
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osOutlinesModule.service("OutlinesService", [
    "$http", "$q", "ErrorService", "XsltService",
    function($http, $q, ErrorService, XsltService) {
    var xj = new X2JS({ arrayAccessForm : "property" });
    return {
      resource : "",    // name of the current loaded resource, "" if none loaded or the resource is new
      content : {},     // outline content
      newDocument : function(jsonTemplate) {
        // set up a new templated outline document
        var xmlTemplate = xj.json2xml(jsonTemplate);
        this.content = xj.xml2json(XsltService.transform("/js/outlines/Outline.template.xsl", xmlTemplate));
          this.resource = "";
        return this;
      },
      load : function(resource) {
        // load the given resource
          var thiz = this;
          return $http.get("/api/data/outlines/" + encodeURIComponent(resource), {
              params: { check : "1" }
          })
              .then(function(response) {
                  thiz.resource = resource;
                  thiz.content = xj.xml2json(
                      XsltService.transformString("/js/outlines/LoadOutline.xsl", response.data)
                  );
                  return thiz;
              },
              function(err) {
                  $q.reject(err);
              });
      },
      save : function() {
          // save the document
          // outline XML requires a particular order, so the document needs to be written out like a template
          var outline = this.content.outline;
          var responsibilityBlocks = function(jsFragment) {
            // write XML responsibility blocks from the json fragment
              if ('resp_asArray' in jsFragment) {
                  jsFragment['resp_asArray'].map(function(rsp) {
                      return '<ol:resp>' +
                              '<ol:contributor>' + rsp.contributor.__text +'</ol:contributor>' +
                              '<ol:responsibility>' + rsp.responsibility.__text + '</ol:responsibility>' +
                          '</ol:resp>';
                  }).join("")
              }
              else {
                  return '';
              }
          };
          var langBlock = function(jsFragment) {
              if ('lang' in jsFragment) {
                  return '<ol:lang>' + jsFragment.lang.__text + '</ol:lang>';
              }
              else return '';
          };
          var pagesBlock = function(jsFragment) {
              if ('from' in jsFragment) {
                  var from = ("__text" in jsFragment.from ? jsFragment.from.__text : "");
                  var to = ("__text" in jsFragment.to ? jsFragment.to.__text : "");
                  return ((from.length > 0) ? ('<ol:from>' + from + '</ol:from>') : "") +
                      ((to.length > 0) ? ('<ol:to>' + to + '</ol:to>') : "");
              }
              else return '';
          };
          var uriBlock = function(jsFragment) {
              if ('uri' in jsFragment) {
                  return '<olx:uri>' + jsFragment.uri.__text + '</olx:uri>';
              }
              else return '';
          };
          var statusBlock = function(jsFragment) {
              if ('status' in jsFragment) {
                  return '<olx:status>' + jsFragment.status.__text + '</olx:status>';
              }
              else return '';
          };
          var errorsAndWarningsBlock = function(jsFragment) {
              var err = '';
              var warn = '';
              if ('error' in jsFragment) {
                  err = jsFragment['error_asArray'].map(function(e) {
                      return '<olx:error>' + e.__text + '</olx:error>';
                  }).join('');
              }
              if ('warning' in jsFragment) {
                  warn = jsFragment['warning_asArray'].map(function(w) {
                      return '<olx:warning>' + w.__text + '</olx:warning>';
                  }).join('');
              }
              return err + warn;
          };
          var sameAsBlock = function(jsFragment) {
              if ('sameAs_asArray' in jsFragment) {
                  return jsFragment['sameAs_asArray'].map(function(sameas) {
                      return '<olx:sameAs>' +
                              '<olx:uri>' + sameas.uri.__text + '</olx:uri>' +
                            (('yes' in sameas) ? '<olx:yes/>' : ('no' in sameas) ? '<olx:no/>' : '') +
                              errorsAndWarningsBlock(sameas) +
                              '</olx:sameAs>';
                  }).join("");
              }
              else return '';
          };
          var itemsBlock = function(jsFragment) {
              if ('item_asArray' in jsFragment) {
                  return jsFragment['item_asArray'].map(function(it) {
                      return '<ol:item level="' + it._level + '">' +
                              '<ol:title>' + it.title.__text + '</ol:title>' +
                              langBlock(it) +
                              responsibilityBlocks(it) +
                              pagesBlock(it) +
                              sameAsBlock(it) +
                              errorsAndWarningsBlock(it) +
                              statusBlock(it) +
                              '</ol:item>';
                  }).join('')
              }
              else return '';
          };
          var document = '<ol:outline ' +
              'xmlns:ol="http://jewishliturgy.org/ns/outline/1.0" ' +
              'xmlns:olx="http://jewishliturgy.org/ns/outline/responses/1.0">' +
                  '<ol:source>' + outline.source.__text + '</ol:source>' +
                  '<ol:license>' + outline.license.__text + '</ol:license>' +
                  '<ol:title>' + outline.title.__text + '</ol:title>' +
                  langBlock(outline) +
                  responsibilityBlocks(outline) +
                  pagesBlock(outline) +
                  uriBlock(outline) +
                  statusBlock(outline) +
                  itemsBlock(outline) +
              '</ol:outline>';
          var transformed = XsltService.serializeToString(XsltService.transformString("/js/outlines/SaveOutline.xsl", document));
          var httpOperation = (this.resource == "") ? $http.post : $http.put;
          var thiz = this;
          return httpOperation("/api/data/outlines" + ((this.resource == "") ? "" : ("/" + this.resource)),
            transformed)
              .then(function(response) {
                  var statusCode = response.status;
                  var headers = response.headers;
                  if (statusCode == 201) {
                      thiz.resource = decodeURI(headers('Location').replace("/exist/restxq/api/data/outlines/", ""));
                  }
                  return thiz.load(thiz.resource);
              },
                  function (err) {
                      return $q.reject(err.data);
                  })

      },
        execute : function() {
            if (this.resource) {
                var thiz = this;
                return $http.post("/api/data/outlines/" + this.resource + "/execute", "<execute/>")
                    .then(function(response) {
                        return thiz.load(thiz.resource);
                    }, function(err) {
                        return $q.reject(err.data);
                    });
            }
            else {
                return $q.reject("A resource must be saved before it can be executed.")
            }
        }
    };
}]);

