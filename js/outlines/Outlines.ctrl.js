/* 
 * controller for outlines page 
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osOutlinesModule.controller(
  'OutlinesCtrl',
  ['$scope', '$location', '$routeParams', 
  'AuthenticationService', 'DialogService', 'ErrorService', 'LanguageService', 'LicensesService', 'OutlinesService',
      'TranscriptionViewerService',
  function ($scope, $location, $routeParams, 
    AuthenticationService, DialogService, ErrorService, LanguageService, LicensesService, OutlinesService,
    TranscriptionViewerService) {
    console.log("Outlines controller.");

    $scope.AuthenticationService = AuthenticationService;
    $scope.DialogService = DialogService;
    $scope.LanguageService = LanguageService;
    $scope.LicensesService = LicensesService;
    $scope.OutlinesService = OutlinesService;
      $scope.TranscriptionViewerService = TranscriptionViewerService;
    $scope.resource = $routeParams.resource;


    $scope.editor = {
      newTemplate : null,
      saved : false,
      newDocument : function() { 
        OutlinesService.newDocument($scope.editor.newTemplate);
        TranscriptionViewerService.setSource("outlines-transcription-window", OutlinesService.content.outline.source.__text.split("/").pop());
        $location.path("/outlines");
        $scope.outlineForm.$setPristine();
          $scope.editor.saved = false;
          $scope.editor.executed = false;
      },
      openDocument : function(selection) {
          var resourceName = decodeURIComponent(selection.split("/").pop());  // try to prevent double-encoding
          if (resourceName && resourceName != OutlinesService.resource) {
              $scope.editor.setDocument(resourceName);
          }
      },
        setDocument : function(toDocument) {
            if (toDocument) {
                OutlinesService.load(toDocument)
                    .then(function(os) {
                            $scope.editor.executed = false;
                            $scope.editor.saved = true;
                            $scope.outlineForm.$setPristine();
                            TranscriptionViewerService.setSource("outlines-transcription-window", os.content.outline.source.__text.split("/").pop());
                            $location.path( "/outlines/" + os.resource, false);
                        },
                        function(error) {    // error function
                            ErrorService.addApiError(error);
                            console.log("error loading", toDocument);
                            OutlinesService.resource = "";
                        });
            }
        },
      saveDocument : function() { 
        // save the document
          thiz = this;
          OutlinesService.save()
            .then(function() {
                $scope.outlineForm.$setPristine();
                thiz.saved = true;
                thiz.executed = false;
                $location.path( "/outlines/" + OutlinesService.resource, false);
            },
            function(err) {
              ErrorService.addApiError(err);
            });
      },
        executed : false,
      execute : function() {
          OutlinesService.execute()
              .then(function() {
                      $scope.editor.executed = true;
                  },
                  function(err) {
                      ErrorService.addApiError(err);
                  });
      },
      dialogCancel : function() { }
    };

    // helper functions: too much work in the controller!
    var xj = new X2JS({ "arrayAccessForm" : "property", "emptyNodeForm" : "object" });
    $scope.outline = {
      levelOf : function(item) {
        return Array.from('x'.repeat(parseInt(item._level)))
      },
      canLevelDown : function(item) {
        return parseInt(item._level) > 1;
      },
      levelDown : function(item) {
        if (this.canLevelDown(item)) {
          item._level = (parseInt(item._level) - 1).toString();
          $scope.outlineForm.$setDirty();
        }
      },
      canLevelUp : function(item) {
        var items = OutlinesService.content.outline.item_asArray;
        var itemIndex = items.indexOf(item);
        return itemIndex > 0 && parseInt(item._level) <= parseInt(items[itemIndex - 1]._level);
      },
      levelUp : function(item) {
        if (this.canLevelUp(item)) {
          item._level = (parseInt(item._level) + 1).toString();
          $scope.outlineForm.$setDirty();
        }
      },
      addAfter : function(item, deltaLevel) {
        var items = OutlinesService.content.outline.item_asArray;
        var itemIndex = items.indexOf(item);
        var itemLevel = parseInt(item._level) + deltaLevel;
        var fromDefault = (parseInt(("__text" in item.to) ? item.to.__text : "") + 1).toString();
        var newItem = xj.xml_str2json('<ol:item xmlns:ol="http://jewishliturgy.org/ns/outline/1.0" level="' + itemLevel +'"><ol:title>Title</ol:title><ol:from>' +
            (fromDefault == 'NaN' ? "" : fromDefault) + '</ol:from><ol:to>'+
            (fromDefault == 'NaN' ? "" : fromDefault) +'</ol:to></ol:item>')
        items.splice(itemIndex + 1, 0, newItem.item);
        $scope.outlineForm.$setDirty();
      },
      remove : function(item) {
        var items = OutlinesService.content.outline.item_asArray;
        var itemIndex = items.indexOf(item);
        var level = parseInt(items[itemIndex]._level); 
        // all items below this must be removed until the next one at the same level
        for (var nitems = 1; 
          (itemIndex + nitems < items.length) && parseInt(items[nitems + itemIndex]._level) > level; nitems++);
        items.splice(itemIndex, nitems);
        if (items.length == 0) {        // pathological case of 1st item deleted and only had children
          var newItem = xj.xml_str2json('<ol:item xmlns:ol="http://jewishliturgy.org/ns/outline/1.0" level="1"><ol:title>Title</ol:title><ol:from>1</ol:from><ol:to>1</ol:to></ol:item>')
          items.push(newItem.item);
        }
        $scope.outlineForm.$setDirty();
      },
      canRemove : function(item) {
        var items = OutlinesService.content.outline.item_asArray;
        return items.length > 1; 
      },
      setSameAs : function(sameAs, value, item) {
        delete sameAs['no'];
        delete sameAs['yes'];
        delete sameAs['no_asArray'];
        delete sameAs['yes_asArray'];
        sameAs[value] = xj.xml_str2json('<olx:'+value+' xmlns:olx="http://jewishliturgy.org/ns/outline/responses/1.0"/>')[value];
        sameAs["_ackSame"] = value;
        if (value == "yes" && !(item === undefined)) {
          for (var i = 0; i < item["sameAs_asArray"].length; i++) {
              var it = item["sameAs_asArray"][i];
              if (!(it === sameAs)) {
                  this.setSameAs(it, "no");
              }
          }
        }
      },
      initSameAs : function(sameAs) {
        sameAs["_ackSame"] = ("yes" in sameAs) ? "yes" : ("no" in sameAs) ? "no" : undefined;
      },
      viewSameAsUrl : function(sameAs) {
        return "/texts/" + decodeURIComponent(sameAs.uri.__text.replace("/data/original/", ""))
      },
        showSameAsWarning : function(sameAs) {
          return ("warning" in sameAs) && ("__text" in sameAs["warning"]) && (sameAs.warning.__text) && !("no" in sameAs);
        },
      edit : function(item) {
          if ("sameAs_asArray" in item) {
              var yes = item.sameAs_asArray.filter(function (s) {
                  return 'yes' in s;
              });
              return (yes.length > 0) ? ("/texts/" + yes[0].uri.__text.split("/").pop()) : undefined;
          }
      },
      canEdit : function(item) {
        return "sameAs_asArray" in item && (
          item.sameAs_asArray.some(function(s) {
            return 'yes' in s;
          })
        );
      },
        setViewerPage : function(page) {
            if (page && "__text" in page && page.__text) {
                TranscriptionViewerService.setPage("outlines-transcription-window", parseInt(page.__text));
            }
        }
    };

    $scope.saveButtonText = function() {
      return ($scope.outlineForm.$pristine && OutlinesService.resource != "") ? "Saved" : "Save";
    };
      $scope.executeButtonText = function() {
        return ($scope.editor.executed == true && $scope.outlineForm.$pristine) ? "Executed" : "Execute";
      };

    $scope.editor.setDocument($scope.resource);
  }]
);
