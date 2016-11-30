/**
 * tei:anchor widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */
CKEDITOR.plugins.add( 'tei-anchor', {
	requires: 'widget',

	icons: 'tei-anchor',

	init: function( editor ) {
            var injector = angular.element('*[data-ng-app]').injector();
            var img = "<img src='/js/ckeditor/plugins/tei-anchor/icons/tei-anchor.png'></img>";

            var loadContent = function(el) {
                el.setHtml(img + "(" + el.getAttribute("id") + ")");
            };

            editor.widgets.add( 'tei-anchor', {
                draggable : false,
                inline : false, 
                allowedContent:
                    'p[id](tei-anchor);',
                requiredContent: 'p(tei-anchor)',
                template:
                    '<p class="tei-anchor" id="" data-os-new="1">'+img+'</p>',

                button: 'Create a permanent anchor',

                edit : function ( evt) {
                    var DialogService = injector.get("DialogService");
                    var EditorDataService = injector.get("EditorDataService");
                    var el = this.element;
                    var isNew = el.getAttribute("data-os-new");
                    var wid = this;
                    
                    EditorDataService.set("editAnchorDialog", {
                        id : el.getAttribute("id") || "" ,
                        callback : function(button) {
                            if (button=="ok") {
                                el.setAttribute("id", this.id);
                                loadContent(el);
                                el.removeAttribute("data-os-new");
                            }
                            else {
                                // cancel
                                if (isNew) {
                                    // remove the element
                                    wid.wrapper.remove();
                                    editor.fire("change");
                                }   
                            }

                        }
                    });
                    DialogService.open("editAnchorDialogSimple");
                    
                },
                // any tei:ptr should be treated as a transclusion according to this widget
                upcast: function( element ) {
                    return element.name == 'p' && element.hasClass( 'tei-anchor' );
                },
                init: function() {
                    if (!this.element.getAttribute("id")) {
                        this.element.setAttribute("id", "anchor-" + Math.floor(Math.random()*1000000)).toString();
                    }
                    loadContent(this.element);
                },
                data: function() {
                }
            } );
            
    }
} );
