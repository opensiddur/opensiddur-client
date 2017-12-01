/**
 * tei:list plugin
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Modifications licensed under the GNU Lesser General Public License, version 3 or later 
 *
 * Based on the CKEditor example plugin:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 */

CKEDITOR.plugins.add( 'tei-item', {
	requires: 'widget',

	icons: 'tei-item',

	init: function( editor ) {
		var rootElement = angular.element('*[data-ng-app]');
		var formElement = angular.element('form[name=textsForm]');
		var injector = rootElement.injector();
		var DialogService = injector.get("DialogService");
		var EditorDataService = injector.get("EditorDataService");
		var TextService = injector.get("TextService");
        var XsltService = injector.get("XsltService");
        var ListService = injector.get("ListService");
        var EditorService = injector.get("EditorService");
		var $interval = injector.get("$interval");
		var $timeout = injector.get("$timeout");
		var $scope = formElement.scope();

		var thiz = this;
		var blockObject = new BlockObject(editor, true, true);
        var img = '<img class="editor-internal editor-icon" src="/js/ckeditor/plugins/tei-item/icons/tei-item.png"></img>';

		var updateElementContent = function(el, newLayerId, justThisOne) {
		    newLayerId = newLayerId || el.getAttribute("data-jf-layer-id");
			if (!justThisOne) {
				var idName = el.getId().match(/^(start|end)_(.+)/)[2];
				var otherBoundId = (el.hasClass("start") ? "end" : "start") + "_" + idName;
				var otherBoundElement = EditorService.getBodyFromElement(el).findOne("*[id=" + otherBoundId + "]");
				updateElementContent(otherBoundElement, newLayerId, true)
			}
			var direction = el.hasClass("start") ? (img + "&#x21d3;") : ("&#x21d1;" + img);
			var elContent = direction + '<span class="editor-internal editor-layer-id">['+newLayerId+"]</span>";
            el.setAttribute("data-jf-layer-id", newLayerId);
			el.setHtml(elContent);
			if (!justThisOne) {
				// otherwise, we get duplicate fired change events
				editor.fire("change");
			}
			return elContent;
		};

		editor.widgets.add( 'tei-item', {
			draggable : false,
			inline : false,
			allowedContent:
			'div[id](tei-item,layer,layer-list,start,end);' +
			'img[src,alt,title];' +
			'*(editor-*)',
			requiredContent: 'div(tei-item)',

			button: 'Start a new itemized list',
			edit : function ( evt) {
				var el = this.element;
				// The list editor might rewrite TextService.content(). If it does, el will disappear.
                // We need to keep track of which list element we are edting
                el.setAttribute("data-os-list-editing", "1");
				EditorDataService.editListDialog = {
					id : el.getAttribute("data-jf-layer-id"),
					callback : function(ok) {
                        el = editor.document.getDocumentElement().findOne("*[data-os-list-editing]");
						if (ok && el != null) {
							var newLayerId = EditorDataService.editListDialog.id;
							if (newLayerId) {
                                updateElementContent(el, newLayerId);
							}

						}
						else {
						    editor.fire("change");      // deletions, eg
                        }
                        if (el != null) {
                            el.removeAttribute("data-os-list-editing");
                        }
					},
                    updateAllCallback : function() {
                        // this callback is called whenever every list item needs to be updated.
                        // because the editor is not updating with respect to the TextContent,
                        // it redoes some of the XSL changes
                        var body = EditorService.getBodyFromElement(el);
                        var items = body.find(".tei-item");
                        var textContent = XsltService.parseFromString(TextService.content());
                        for (var i = 0; i < items.count(); i++) {
                            var item = items.getItem(i);
                            var itemXml = textContent.getElementById(item.getId());
                            if (itemXml) {
                                updateElementContent(item, itemXml.getAttribute("data-jf-layer-id"), true);
                            }
                            else {
                                item.getParent().remove();  // remove the widget wrapper
                            }
                        }
                        editor.fire("change");
                    }
				};
				DialogService.open("editListDialogSimple");
			},
			insert: function() {
                var listLayers = ListService.getListLayers();
                var defaultLayer =  (listLayers.length == 0) ? "layer-list" : listLayers[0];
                var layerIdSpan = '<span class="editor-internal editor-layer-id">['+defaultLayer+"]</span>";
				blockObject.insert(
					"list", "div", "tei-item",
					function(id) {  // beginTemplate
						return '<div id="start_'+id+'" class="tei-item layer layer-list start">'+
							img +
								'&#x21d3;' +
                                layerIdSpan +
							'</div>';
					},
					function(id) {  // endTemplate
						return '<div id="end_'+id+'" class="tei-item layer layer-list end">&#x21d1;' + img+ layerIdSpan+'</div>';
					},
                    defaultLayer
				);
			},
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'tei-item' );
			},
			init: function(ev) {
                var el = this.element;
                updateElementContent(el, el.getAttribute("data-jf-layer-id"), true);
			},
			destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
