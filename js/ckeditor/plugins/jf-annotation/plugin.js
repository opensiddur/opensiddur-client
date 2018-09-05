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
        var rootElement = angular.element('*[data-ng-app]'); 
        var formElement = angular.element('form[name=textsForm]'); 
        var injector = rootElement.injector();
        var TextService = injector.get("TextService");
        var AnnotationsService = injector.get("AnnotationsService");
        var $interval = injector.get("$interval");
        var $timeout = injector.get("$timeout");
        var $scope = formElement.scope();
        // block plugins require check widgets every short interval
        
        var thiz = this;

        var img = "<img class='editor-internal editor-icon' src='/js/ckeditor/plugins/jf-annotation/icons/jf-annotation.png'/>";

        var blockObject = new BlockObject(editor, true, true);

		editor.widgets.add( 'jf-annotation', {
            draggable : false,
            inline : false, 
			allowedContent:
				'div[id](jf-annotation,tei-note,layer,layer-phony-annotation,start,end);' + 
                'div[id](tei-note);' +
                'span(type,resource,annotation-id);' +
                'img[src,alt,title];' +
                '*(editor-*)',
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
                var root = angular.element('*[data-ng-app]');  
                var injector = root.injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = this.element;
                var wid = this;
                var noteElement = el.findOne("div.tei-note");
                var typeElement = el.findOne(".editor-internal.type");
                var randomId =  "note_" + parseInt(Math.random()*10000000) ;
                var thisAnnotation = el.getAttribute("data-jf-annotation");
                var thisResource = decodeURIComponent(thisAnnotation.split("#")[0].split("/").pop());  
                EditorDataService.set("editAnnotationDialog", {
                    resource : thisResource,
				    id : noteElement.getAttribute("id") || randomId,
                    lang : noteElement.getAttribute("lang") || "en",
                    type : noteElement.getAttribute("data-type") || "comment",
                    content : noteElement.getHtml(),
                    sources : null,   // blank unless set by the dialog
                    callback : function(ok) {
                        if (ok) {
                            el.removeAttribute("data-os-new");
                            // set the content of all annotations that have the same data-jf-annotation as this one
                            var stream = el.getParents()[1];
                            var sameAnnotations = stream.find("*[data-jf-annotation=\"" + thisAnnotation + "\"]");
                            var resource = 
                                encodeURIComponent(this.resource);
                            for (var i = 0; i < sameAnnotations.count(); i++) {
                                var thisEl = sameAnnotations.getItem(i); 
                                var id = this.id || randomId;
                                var thisNoteElement = thisEl.findOne("div.tei-note");
                                var thisTypeElement = thisEl.findOne(".editor-internal.type");
                                thisNoteElement.setAttribute("id", id);
                                thisNoteElement.setAttribute("lang", this.lang);
                                thisNoteElement.setAttribute("data-type", this.type);
                                thisTypeElement.setHtml(this.type);   
                                thisNoteElement.setHtml(this.content);
                                thisEl.setAttribute("data-jf-annotation", "/data/notes/" + resource + "#" + id);
                                thisEl.setAttribute("data-os-changed", "1");
                            }
                            if (this.sources != null) {
                                AnnotationsService.setNoteSource(resource, id, this.sources);
                            }
                            // artificially send a change event to ng-ckeditor so it will update the scope
                            editor.fire("change");
                        }
                        else { // cancel
                          if (el.hasAttribute("data-os-new")) {
                            wid.wrapper.remove();
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
                        return '<div id="start_'+id+'" data-jf-annotation="" class="jf-annotation layer layer-phony-annotation start" data-os-new="1">' + 
                                // put an annotation icon here
                               '<img class="editor-internal editor-icon" src="/img/icons_32x32/icon_annotation.png"></img>'+
                               '&#x21d3;'+
                               '<span class="editor-internal type">comment</span>'+
                               '<div class="tei-note" id="" data-type="comment">Annotation here...</div>' +
                               '</div>'; 
                    },
                    function(id) {  // endTemplate
                        return '<div id="end_'+id+'" class="jf-annotation layer layer-phony-annotation end">&#x21d1;' + img + '</div>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'jf-annotation' );
			},
			init: function(ev) {
                //this.on( 'doubleclick', blockObject.doubleclick);

                /* when initialized, call AnnotationsService to load the annotation content */
                var jfAnnotation = this.element.getAttribute("data-jf-annotation");
                var id = jfAnnotation ? jfAnnotation.split("#")[1] : "" ;
                var el = this.element;
                // first set the HTML to the basic filler
                if (el.hasClass("start")) {
                    var noteElement = el.findOne("div.tei-note");

                    var noteText = noteElement ? (
                        noteElement.getHtml()
                    ) : (
                        jfAnnotation ?
                            ('Loading ' + jfAnnotation.split("/").map( function(s) {
                                return decodeURIComponent(s); }).join("/"))
                            : "");
                    var noteType = noteElement ? noteElement.getAttribute("data-type") : "comment";
                    var loaded = noteElement ? "1" : "0";

                    el.setHtml(img + "&#x21d3;" +
                        '<span class="editor-internal type">' + noteType + '</span>' +
                        '<div class="tei-note" data-type="'+ noteType +'" id="' +
                        id +
                        '" data-os-loaded="' + loaded + '">' + noteText + '</div>');

                    if (jfAnnotation && loaded == "0") {
                        var spl = jfAnnotation.split("#");
                        var resource = spl[0].split("/").pop();
                        var id = spl[1];
                        AnnotationsService.getNote(decodeURIComponent(resource), id)
                            .then(function(annotation) {
                                var newAnnotation = new CKEDITOR.dom.element.createFromHtml(annotation);
                                var annotationType = newAnnotation.getAttribute("data-type");
                                var spans = el.getElementsByTag("span");
                                if (spans.count() > 0) {
                                    spans.getItem(0).setHtml(annotationType);
                                }
                                else {
                                    var annotationTypeSpan = new CKEDITOR.dom.element.createFromHtml(
                                        '<span class="editor-internal type">' + annotationType + '</span>');
                                    el.getElementsByTag("div").getItem(0).insertBeforeMe(annotationTypeSpan);
                                }
                                newAnnotation.replace(el.getElementsByTag("div").getItem(0));
                                el.setAttribute("data-jf-annotation", "/data/notes/" + resource  + "#" + id);
                                el.setAttribute("data-os-loaded", "1");
                                // artificially send a change event to ng-ckeditor so it will update the scope
                                editor.fire("change");
                                $timeout(function() { $scope.textsForm.$setPristine(); }, 0, false);
                            });
                    }
                    else { // no data-jf-annotation content, set everything to defaults
                        var resource = TextService.localSettings()["local-annotation-resource"] || "";   // blank resource indicates local annotation for a file that is not yet saved
                        var id =  "note_" + parseInt(Math.random()*10000000) ;
                        var annotationType = "comment";
                        el.setAttribute("data-jf-annotation", "/data/notes/" + resource  + "#" + id);
                        el.setAttribute("data-os-loaded", "1");
                        // artificially send a change event to ng-ckeditor so it will update the scope
                        editor.fire("change");
                        $timeout(function() { $scope.textsForm.$setPristine(); }, 0, false);
                    }
                    /* show a dialog when ready */
                    this.once("ready", function(evt) {
                        if (this.element.hasAttribute("data-os-new") && this.element.hasClass("start")) {
                            this.edit();
                        }
                    });
                }
                else {
                    el.setHtml("&#x21d1;" + img);
                }

			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
