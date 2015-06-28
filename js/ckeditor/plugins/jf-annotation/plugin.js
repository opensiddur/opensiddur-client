/**
 * jf:annotation widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'jf-annotation', {
	requires: 'widget',

	icons: 'jf-annotation',

	init: function( editor ) {
        var injector = angular.element('*[data-ng-app]').injector();
        var TextService = injector.get("TextService");
        var $interval = injector.get("$interval");
        // block plugins require check widgets every short interval
        
        var thiz = this;
        var blockObject = new BlockObject(editor, true);
        var interval = $interval(function (evt) {
            editor.widgets.checkWidgets();
        }, 1000);


		editor.widgets.add( 'jf-annotation', {
            draggable : false,
            inline : false, 
			allowedContent:
				'div[id](jf-annotation,tei-note,layer,layer-phony-annotation,start,end);' + 
                'div[id](tei-note);' +
                'span(editor-internal,type,resource,annotation-id)',
			requiredContent: 'div(jf-annotation)',

			button: 'Annotate',
/*
            editables : {
                note : {
                    selector : "div.tei-note",
                    allowedContent : "p"
                }
            },
*/
            edit : function ( evt) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                var noteElement = el.findOne("div.tei-note");
                var typeElement = el.findOne(".editor-internal.type");
                EditorDataService.set("editAnnotationDialog", {
				    id : noteElement.getAttribute("id") || "" ,
                    lang : noteElement.getAttribute("lang") || "en",
                    type : noteElement.getAttribute("data-type") || "comment",
                    content : noteElement.getHtml(),
                    callback : function(ok) {
                        if (ok) {
                            // set the content
                            noteElement.setAttribute("id", this.id);
                            noteElement.setAttribute("lang", this.lang);
                            noteElement.setAttribute("data-type", this.type);
                            typeElement.setHtml(this.type);   
                            noteElement.setHtml(this.content);
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
                DialogService.open("editAnnotationDialogSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "phony-annotation", "div", "jf-annotation",
                    function(id) {  // beginTemplate 
                        return '<div id="start_'+id+'" data-jf-annotation="" class="jf-annotation layer layer-phony-annotation start">[A]&#x21d3;'+
                                // put an annotation icon here
                               '[<span class="editor-internal type">comment</span>]'+
                               /*'<span class="editor-internal resource">resource here</span>'+
                               '(<span class="editor-internal annotation-id">idno</span>)'+*/
                               '<div class="tei-note" id="" data-type="comment">Annotation here...</div>' +
                               '</div>'; 
                    },
                    function(id) {  // endTemplate
                        return '<div id="end_'+id+'" class="jf-annotation layer layer-phony-annotation end">&#x21d1;[A]</div>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'jf-annotation' );
			},
			init: function(ev) {
                //this.on( 'doubleclick', blockObject.doubleclick);
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
