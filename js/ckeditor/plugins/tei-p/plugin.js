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
				'p[id](tei-p,layer,layer-p,start,end);',
			requiredContent: 'p(tei-p)',

			button: 'Create or edit a paragraph',
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
            insert: function() {
                /* block insertion algorithm:
                1. get selection
                2. if the beginning of the selection is in a segment, find the place before the segment, call that the start position; else, the start of the selection is the insertion point.
                3. if the ending of the selection is in a segment, find a place after the segment, call that the ending position; else the end of the selection is the insertion point
                *4. if the same type of block begins or ends inside the selection, remove the beginning/ending
                5. if the same type of block begins before the start position and does not end, place an end for that block before starting this one
                6. if the same type of block ends after the start position and does not begin after it, place a begin for that block after this one
                7. if any blocks have been terminated, delete them if they are empty (contain no segments).
                */
                var thisId = "p_" + Math.floor(Math.random()*100000000).toString();
			    var beginTemplate = function(id) { 
                    return '<p id="'+id+'" data-new="1" class="tei-p layer layer-p start">&#182;&#x21d3;</p>'; 
                };
                var endTemplate = function(id) { 
                    return '<p id="_end_'+id+'" data-new="1" class="tei-p layer layer-p end">&#x21d1;&#182;</p>';
                };
                var getAllPrecedingUnterminatedBlockStarts = function(node, blockType) {
                    var starts = [];
                    var prev = node;
                    while (prev) {
                        prev = prev.getPrevious();
                        if (prev && prev.hasClass("layer") && prev.hasClass(blockType) && prev.hasClass("start")) {
                            starts.push(prev);
                        }
                    };
                    var unterminatedStarts = [];
                    for (var i = 0; i < starts.length; i++) {
                        var start = starts[i];
                        var prev = node;
                        var terminated = false;
                        while (!terminated && prev != start && (prev = prev.getPrevious())) {
                            terminated = prev.getId() == "_end_"+start.getId();
                        }
                        if (!terminated) { 
                            unterminatedStarts.push(start);
                        }
                    }
                    return unterminatedStarts;
                };
                var getAllFollowingUnstartedBlockEnds = function(node, blockType) {
                    var ends = [];
                    var fol = node;
                    while (fol) {
                        fol = fol.getNext();
                        if (fol && fol.hasClass("layer") && fol.hasClass(blockType) && fol.hasClass("end")) {
                            ends.push(fol);
                        }
                    };
                    var unstartedEnds = [];
                    for (var i = 0; i < ends.length; i++) {
                        end = ends[i];
                        var fol = node;
                        var started = false;
                        while (!started && fol != end && (fol = fol.getNext())) {
                            started = "_end_"+fol.getId() == end.getId();
                        }
                        if (!started) { 
                            unstartedEnds.push(end);
                        }
                    }
                    return unstartedEnds;
                };
                var removeInternalBlocks = function(startNode, endNode, blockType) {
                    var rng = new CKEDITOR.dom.range(editor.document);
                    rng.setStart(startNode,0);
                    rng.setEnd(endNode,0);
                    var iter = rng.createIterator();
                    var internalBlocks = [];
                    while (nxt = iter.getNextParagraph("p")) {
                        if (nxt.hasClass(blockType) && nxt.getId().replace(/^_end_/, "") != thisId) {
                            internalBlocks.push(nxt);
                        } 
                    } 
                    for (var i = 0; i < internalBlocks.length; i++) {
                        internalBlocks[i].remove();
                    }
                };
                var removeEmptyBlocks = function(segmentNode, blockType) {
                    // remove blocks of the given type that contain no segments
                    var body = segmentNode.getParent();
                    var starts = body.find("."+blockType+".layer"+".start");
                    for (var s = 0; s < starts.count(); s++) {
                        var start = starts.getItem(s);
                        var id = start.getId();
                        var end = body.findOne("."+blockType+".layer"+".end[id=_end_"+id+"]");
                        var rng = new CKEDITOR.dom.range(editor.document);
                        rng.setStart(start,0);
                        rng.setEnd(end,0);
                        var iter = rng.createIterator(); 
                        var nsegs = 0; 
                        var maybe = null;
                        while (maybe = iter.getNextParagraph("p")) { 
                            if (maybe.hasClass("tei-seg")) nsegs++; 
                        }; 
                        if (nsegs == 0) {
                            start.remove();
                            end.remove();
                        }
                    }
                };
                var getAscendantSegment = function(node, originalNode) {
                    var originalNode = originalNode || node;
                    if (!node || node.type == 9) {  // document node, nowhere to go
                        return originalNode;
                    }
                    else if (node.type == 3) {  // text node, go up 1 level
                        return getAscendantSegment(node.getParent(), originalNode);
                    }
                    else { // element node
                        if (node.hasClass("tei-seg")) { // it's a segment, return it
                            return node;
                        }
                        else {
                            return getAscendantSegment(node.getParent(), originalNode);
                        }
                    }   
                };
                var selection = editor.getSelection();
                var ranges = selection.getRanges();
                var startElement = getAscendantSegment(ranges[0].startContainer);
                var endElement = getAscendantSegment(ranges[ranges.length - 1].endContainer);
                var begInsert = new CKEDITOR.dom.element.createFromHtml(beginTemplate(thisId));
                var endInsert = new CKEDITOR.dom.element.createFromHtml(endTemplate(thisId));
                removeInternalBlocks(startElement, endElement, "tei-p");
                var unterminatedStarts = getAllPrecedingUnterminatedBlockStarts(startElement, "tei-p");
                var unstartedEnds = getAllFollowingUnstartedBlockEnds(endElement, "tei-p");
                for (var i = 0; i < unterminatedStarts.length; i++) {
                    // insert end tags
                    var endTag = new CKEDITOR.dom.element.createFromHtml(endTemplate(unterminatedStarts[i].getId()));
                    endTag.insertBefore(startElement);
                }
                for (var i = 0; i < unstartedEnds.length; i++) {
                    // insert start tags
                    var startTag = new CKEDITOR.dom.element.createFromHtml(beginTemplate(unstartedEnds[i].getId().replace(/^_end_/, "")));
                    startTag.insertAfter(endElement);
                }
                
                begInsert.insertBefore(startElement);
                endInsert.insertAfter(endElement);
                removeEmptyBlocks(startElement, "tei-p"); 
                
            },
			upcast: function( element ) {
				return element.name == 'a' && element.hasClass( 'tei-p' );
			},
			init: function() {
			},

			data: function() {
			}

		} );
	}
} );
