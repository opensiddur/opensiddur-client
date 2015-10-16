/**
 * tei:ptr widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'tei-ptr', {
	requires: 'widget',

	icons: 'tei-ptr',

	init: function( editor ) {
		//CKEDITOR.dialog.add( 'tei-ptr', this.path + 'dialogs/tei-ptr.js' );

		editor.widgets.add( 'tei-ptr', {
            draggable : false,
            inline : false, 
			allowedContent:
				'p[id,data-target-base,data-target-fragment](tei-ptr);',
			requiredContent: 'p(tei-ptr)',

			template:
				'<p class="tei-ptr" id="" data-new="1" data-target-base="" data-target-fragment="">Loading...</p>',

			button: 'Create or edit a transclusion link',

			//dialog: 'tei-ptr',
            edit : function ( evt) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                var isNew = el.getAttribute("data-new");
                
                EditorDataService.set("editLinkDialog", {
    				dataTargetBase : el.getAttribute("data-target-base") || "",
				    dataTargetFragment : el.getAttribute("data-target-fragment") || "",
				    id : el.getAttribute("id") || "" ,
				    linkType : (el.getAttribute("data-target-base") || "") == "" ? "internal" : "external",
                    callback : function(ok) {
                        if (ok) {
                            el.setAttribute("id", this.id);
                            el.setAttribute("data-target-base",  this.dataTargetBase );
                            el.setAttribute("data-target-fragment",  this.dataTargetFragment );
                            el.removeAttribute("data-new");
                            el.setText("Include: " + this.dataTargetBase + this.dataTargetFragment);
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
                DialogService.open("editLinkDialogSimple");
                
            },
            // any tei:ptr should be treated as a transclusion according to this widget
			upcast: function( element ) {
				return element.name == 'p' && element.hasClass( 'tei-ptr' );
			},
			init: function() {
                var injector = angular.element('*[data-ng-app]').injector();
			},

			data: function() {
			}
		} );
	}
} );
