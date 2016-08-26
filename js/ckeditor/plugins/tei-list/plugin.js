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

CKEDITOR.plugins.add( 'tei-list', {
	requires: 'widget',

	icons: 'tei-list',

	init: function( editor ) {
		var rootElement = angular.element('*[data-ng-app]');
		var formElement = angular.element('form[name=textsForm]');
		var injector = rootElement.injector();
		var DialogService = injector.get("DialogService");
		var EditorDataService = injector.get("EditorDataService");
		var TextService = injector.get("TextService");
        var XsltService = injector.get("XsltService");
		var $interval = injector.get("$interval");
		var $timeout = injector.get("$timeout");
		var $scope = formElement.scope();
		// block plugins require check widgets every short interval

		var thiz = this;
		var blockObject = new BlockObject(editor, true, true);
        var img = '<img class="editor-internal editor-icon" src="/js/ckeditor/plugins/tei-list/icons/tei-list.png"></img>';

		var updateElementContent = function(el, newLayerId, justThisOne) {
		    newLayerId = newLayerId || el.getAttribute("data-jf-layer-id");
			if (!justThisOne) {
				var idName = el.getId().match(/^(start|end)_(.+)/)[2];
				var otherBoundId = (el.hasClass("start") ? "end" : "start") + "_" + idName;
				var otherBoundElement = el.getParent().getParent().findOne("*[id=" + otherBoundId + "]");
				updateElementContent(otherBoundElement, newLayerId, true)
			}
			var direction = el.hasClass("start") ? (img + "&#x21d3;") : ("&#x21d1;" + img);
			var elContent = direction + '<span class="editor-internal editor-layer-id">['+newLayerId+"]</span>";
            el.setAttribute("data-jf-layer-id", newLayerId);
			el.setHtml(elContent);

			editor.fire("change");
			return elContent;
		};

		editor.widgets.add( 'tei-list', {
			draggable : false,
			inline : false,
			allowedContent:
			'p[id](tei-item,layer,layer-list,start,end);' +
			'img[src,alt,title];' +
			'*(editor-*)',
			requiredContent: 'p(tei-item)',

			button: 'Start a new itemized list',
			edit : function ( evt) {
				var el = this.element;
				EditorDataService.editListDialog = {
					id : el.getAttribute("data-jf-layer-id"),
					callback : function(ok) {
						if (ok) {
							var newLayerId = EditorDataService.editListDialog.id;
							if (newLayerId) {
                                updateElementContent(el, newLayerId);
							}

						}
						else {
						    editor.fire("change");      // deletions, eg
                        }
					},
                    updateAllCallback : function() {
                        // this callback is called whenever every list item needs to be updated.
                        // because the editor is not updating with respect to the TextContent,
                        // it redoes some of the XSL changes
                        var body = el.getParent().getParent();
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
                    }
				};
				DialogService.open("editListDialogSimple");
			},
			insert: function() {

				blockObject.insert(
					"list", "p", "tei-item",
					function(id) {  // beginTemplate
						return '<p id="start_'+id+'" class="tei-item layer layer-list start">'+
							img +
								'&#x21d3;' +
							'</p>';
					},
					function(id) {  // endTemplate
						return '<p id="end_'+id+'" class="tei-item layer layer-list end">&#x21d1;'+img+'</p>';
					}

				);
			},
			upcast: function( element ) {
				return element.name == 'p' && element.hasClass( 'tei-item' );
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
