/**
 * tei:ptr widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

/* TODO:
    add context menu with the following options:
        edit link (open dialog)
        edit external file (if it's an external link)
        refresh
*/
CKEDITOR.plugins.add( 'tei-ptr', {
	requires: 'widget',

	icons: 'tei-ptr',

	init: function( editor ) {
            var rootElement = angular.element('*[data-ng-app]'); 
            var formElement = angular.element('form[name=textsForm]'); 
            var injector = rootElement.injector();
            var InlineService = injector.get("InlineService");
            var TextService = injector.get("TextService");
            var loadRemoteContent = function(element, refresh) {
                var refresh = refresh || false;
                // load remote content from the target
                element.setHtml("Loading...");
                var targetBase = element.getAttribute("data-target-base") || "" ;
                var targetFragment = (element.getAttribute("data-target-fragment") || "").replace(/^#/, "");
                if (!targetBase && !targetFragment) {
                    element.setHtml("<p>Double click here to set what should be transcluded.</p>");   
                }
                else {
                    return InlineService.load(targetBase || encodeURIComponent(TextService.resource), targetFragment, refresh)
                    .then(
                        function(data) {
                            element.setHtml(data);
                        },
                        function(error) {
                            element.setHtml("<p>Error loading " + targetBase + '#' + targetFragment + "</p>" + error);    
                        }
                    );
                } 
            };
            editor.widgets.add( 'tei-ptr', {
                draggable : false,
                inline : false, 
                allowedContent:
                    'p[id,data-target-base,data-target-fragment](tei-ptr);*',
                requiredContent: 'p(tei-ptr)',
                template:
                    '<p class="tei-ptr" id="" data-os-new="1" data-target-base="" data-target-fragment="">Loading...</p>',

                button: 'Create or edit a transclusion link',

                edit : function ( evt) {
                    var injector = angular.element('*[data-ng-app]').injector();
                    var DialogService = injector.get("DialogService");
                    var EditorDataService = injector.get("EditorDataService");
                    var el = this.element;
                    var isNew = el.getAttribute("data-os-new");
                    var wid = this;
                    
                    EditorDataService.set("editLinkDialog", {
                        dataTargetBase : el.getAttribute("data-target-base") || "",
                        dataTargetFragment : el.getAttribute("data-target-fragment") || "",
                        dataType : el.getAttribute("data-type") || "",
                        id : el.getAttribute("id") || "" ,
                        linkType : (el.getAttribute("data-target-base") || "") == "" ? "internal" : "external",
                        callback : function(button) {
                            if (button=="ok") {
                                el.setAttribute("id", this.id);
                                el.setAttribute("data-target-base",  this.dataTargetBase );
                                el.setAttribute("data-target-fragment",  this.dataTargetFragment );
                                if (this.dataType == "inline") {
                                  el.setAttribute("data-type", this.dataType);
                                }
                                else {
                                  el.removeAttribute("data-type");
                                }
                                el.removeAttribute("data-os-new");
                                loadRemoteContent(el);
                            }
                            else if (button=="refresh") {
                                // no changes other than refresh
                                loadRemoteContent(el, true)
                            }
                            else {
                                // cancel
                                if (isNew) {
                                    // remove the element
                                    wid.wrapper.remove();
                                }   
                            }
                            editor.fire("change");
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
                    if (!this.element.getAttribute("id")) {
                        this.element.setAttribute("id", "ptr-" + Math.floor(Math.random()*1000000)).toString();
                    }
                    loadRemoteContent(this.element);

                },
                data: function() {
                }
            } );
            
    }
} );
