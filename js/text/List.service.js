/**
 * List items service
 * 
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 * 
 * Created by efeins on 8/14/16.
 */
osTextModule.service("ListService", [
    "TextService", "XsltService", function(
        TextService, XsltService
    ) {
        var x2js = new X2JS({ arrayAccessForm : "property" });
        return {
        addListLayer : function(layerId) {
            // add a new list layer with the given id
            TextService.content(
                XsltService.indentToString(
                    XsltService.transformString("/js/text/Layer.add.xsl", TextService.syncFlat(), {
                        "layer-type" : "list",
                        "resource" : TextService._resourceApi + "/" + encodeURIComponent(TextService._resource),
                        "layer-id" : layerId
                    }), TextService._isFlat
                )
            );
            return this;
        },
        getListLayers : function() {
            // return all existing list layer ids
            var layers = x2js.xml2json(
                XsltService.transformString("/js/text/Layer.get.xsl", TextService.content(), {
                    "layer-type" : "list"
                })
            ).layers;

            return ("layer_asArray" in layers) ? layers.layer_asArray : [];
        },
        renameListLayer : function(oldId, newId) {
            // rename a list layer from one id to another
            TextService.content(
                XsltService.indentToString(
                    XsltService.transformString("/js/text/Layer.rename.xsl", TextService.syncFlat(), {
                        "old-layer-id" : oldId,
                        "new-layer-id" : newId
                    }), TextService._isFlat
                )
            );
            return this;
        },
        removeListLayer : function(layerId) {
            // remove an existing list layer and all associated list items
            TextService.content(
                XsltService.indentToString(
                    XsltService.transformString("/js/text/Layer.remove.xsl", TextService.syncFlat(), {
                        "layer-id" : layerId
                    }), TextService._isFlat
                )
            );
            return this;
        }
    }
    }]);

