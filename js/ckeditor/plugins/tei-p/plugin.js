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
		editor.widgets.add( 'tei-p', {
            draggable : false,
            inline : false, 
			allowedContent:
				'a[id](tei-p,layer,layer-p,start,end);',
			requiredContent: 'a(tei-p,layer,layer-p)',

			template:
				'<a id="" data-new="1" class="tei-p layer layer-p start">&#182;</a>',

			button: 'Paragraph',

            edit : function ( evt) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                var isNew = el.getAttribute("data-new");
                
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
			upcast: function( element ) {
				return element.name == 'a' && element.hasClass( 'tei-p' );
			},
			init: function() {
                var injector = angular.element('*[data-ng-app]').injector();
			},

			data: function() {
			}
		} );
	}
} );
