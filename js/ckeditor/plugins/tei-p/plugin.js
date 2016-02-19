/**
 * tei:p widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'tei-p', {
	requires: 'widget',

	icons: 'tei-p',

	init: function( editor ) {
        var injector = angular.element('*[data-ng-app]').injector();
        var TextService = injector.get("TextService");
        var $interval = injector.get("$interval");
        // block plugins require check widgets every short interval
        // only 1 block plugin needs to do this, and this will be it 
        var thiz = this;
        var blockObject = new BlockObject(editor);
        var interval = $interval(function (evt) {
            editor.widgets.checkWidgets();
        }, 1000);


		editor.widgets.add( 'tei-p', {
            draggable : false,
            inline : false, 
			allowedContent:
				'p[id](tei-p,layer,layer-p,start,end);',
			requiredContent: 'p(tei-p)',

			button: 'Create or edit a paragraph',
            edit : function ( evt) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                
                EditorDataService.set("editParagraphDialog", {
				    id : el.getAttribute("id") || "" ,
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
                DialogService.open("editParagraphSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "p", "p", "tei-p",
                    function(id) {  // beginTemplate 
                        return '<p id="start_'+id+'" class="tei-p layer layer-p start">&#182;&#x21d3;</p>'; 
                    },
                    function(id) {  // endTemplate
                        return '<p id="end_'+id+'" class="tei-p layer layer-p end">&#x21d1;&#182;</p>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'p' && element.hasClass( 'tei-p' );
			},
			init: function() {
                this.on( 'doubleclick', blockObject.doubleclick);
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
