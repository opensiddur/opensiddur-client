/**
 * tei:l widget: lines and line groups
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'tei-l', {
	requires: 'widget',

	icons: 'tei-l',

	init: function( editor ) {
        var injector = angular.element('*[data-ng-app]').injector();
        var TextService = injector.get("TextService");
        // block plugins require check widgets every short interval
        // only 1 block plugin needs to do this, and this will be it 
        var thiz = this;
        var blockObject = new BlockObject(editor);
        var img = '<img class="editor-internal editor-icon" src="/js/ckeditor/plugins/tei-l/icons/tei-l.png"/>';

        var updateElementContent = function(el) {
            var layerId = "[" + el.getAttribute("data-jf-layer-id") + "]";
            if (el.hasClass("start")) {
                var lgStart = (el.hasAttribute("data-tei-lg-start")) ? "[lg&#x21d3;]" : "";
                el.setHtml(img + "&#x21d3;" + layerId + lgStart);
            }
            else {
                el.setHtml("&#x21d1;" + img + layerId);
            }
        };

		editor.widgets.add( 'tei-l', {
            draggable : false,
            inline : false, 
			allowedContent:
				'div[id](tei-l,layer,layer-lg,start,end);' +
                'img[src,alt,title];' +
                '*(editor-*)',
			requiredContent: 'div(tei-l)',

			button: 'Create or edit a poetic line',
            edit : function ( evt) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                
                EditorDataService.set("editLineDialog", {
				    id : el.getAttribute("id") || "" ,
                    lgStart : el.hasAttribute("data-tei-lg-start") || false,
                    callback : function(ok) {
                        if (ok) {
                        }
                        else {
                            // cancel
                            if (isNew) {
                                // remove the element
                                el.remove(false);
                            }   
                        }
                    }
                });
                DialogService.open("editLineSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "lg", "p", "tei-l",
                    function(id) {  // beginTemplate 
                        return '<div id="start_'+id+'" class="tei-l layer layer-lg start">' + img + '&#x21d3;</div>';
                    },
                    function(id) {  // endTemplate
                        return '<div id="end_'+id+'" class="tei-l layer layer-lg end">&#x21d1;' + img + '</div>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'tei-l' );
			},
			init: function() {
			    var el = this.element;
                updateElementContent(el);
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
