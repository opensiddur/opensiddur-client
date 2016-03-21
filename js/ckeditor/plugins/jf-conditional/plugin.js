/**
 * jf:conditional widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'jf-conditional', {
	requires: 'widget',

	icons: 'jf-conditional',

	init: function( editor ) {
        var rootElement = angular.element('*[data-ng-app]'); 
        var formElement = angular.element('form[name=textsForm]'); 
        var injector = rootElement.injector();
        var TextService = injector.get("TextService");
        var AnnotationsService = injector.get("AnnotationsService");
        var ConditionalsService = injector.get("ConditionalsService");
        var $interval = injector.get("$interval");
        var $timeout = injector.get("$timeout");
        var $scope = formElement.scope();
        // block plugins require check widgets every short interval
        
        var thiz = this;
        var blockObject = new BlockObject(editor, true, true);
        /*
        var interval = $interval(function (evt) {
            editor.widgets.checkWidgets();
        }, 1000);*/
        var updateElementContent = function(el, jfConditional) {
            var idtokens = el.getId().match(/^(start|end)_(.+)/);
            var thisBound = idtokens[1];
            var cnds = "";
            var instruction = "";
            if (thisBound == "start") {
              if (jfConditional) {
                var activeConditionalsList = ConditionalsService.getByPointer(jfConditional).map(function(c) {
                  return ('<li class="editor-internal editor-conditional">'+
                          c.__text+
                          '</li>')
                }).join("");
                cnds = '<ul class="editor-internal editor-conditionals">' + activeConditionalsList + '</ul>';
              }
              // load conditional-instruction
              instruction = '<div class="tei-note" data-type="instruction" id=""></div>';
              conditionalInstruction = el.getAttribute("data-jf-conditional-instruction");
              if (conditionalInstruction && !el.hasAttribute("data-os-instruction-loaded")) {
                if (el.hasAttribute("data-os-changed")) {
                  instruction =  el.findOne("div.tei-note").getOuterHtml();
                }
                else {
                  var spl = conditionalInstruction.split("#");
                  var resource = spl[0].split("/").pop();
                  var fragment = spl[1];
                  AnnotationsService.getNote(decodeURIComponent(resource), fragment)
                  .then(function(instruction) {
                    var instructionAnnotation = new CKEDITOR.dom.element.createFromHtml(instruction);
                    instructionAnnotation.replace(el.getElementsByTag("div").getItem(0));
                    el.setAttribute("data-os-instruction-loaded", "1");
                  });
                }
              }
            }
            el.setHtml(
              '<img class="editor-internal editor-icon" src="/img/icons_32x32/icon_if-conditional.png"></img>' + (thisBound == "start" ? "&#x21d3;" : "&#x21d1;") +
              cnds +
              instruction
            );
            editor.fire("change");
        };
		editor.widgets.add( 'jf-conditional', {
            draggable : false,
            inline : false, 
			allowedContent:
				'div[id](jf-conditional,layer,layer-phony-conditional,start,end);' +
                'div[id](tei-note);' + 
                'img[src,alt,title];' +
                '*(editor-*)',
			requiredContent: 'div(jf-conditional)',

			button: 'Set conditional inclusion expression',
            edit : function ( evt) {
                var root = angular.element('*[data-ng-app]');  
                var injector = root.injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var el = blockObject.startBound(this.element);
                var randomId =  "conditional_" + parseInt(Math.random()*10000000) ;
                var myId = el.getAttribute("id") || randomId;
                var initialConditionPointers = el.getAttribute("data-jf-conditional");
                var wid = this;

                var instructionElement = el.findOne("div.tei-note");
                var randomInstructionId =  "note_" + parseInt(Math.random()*10000000) ;

                if (initialConditionPointers) {
                  activeConditions = ConditionalsService.getByPointer(initialConditionPointers);
                }
                else {
                  activeConditions = [];
                }
                EditorDataService.set("editConditionsDialog", {
                    active : activeConditions,
                    instruction : (instructionElement ? {
                      id : instructionElement.getAttribute("id") || randomInstructionId,
                      lang : instructionElement.getAttribute("lang") || "en",
                      content : instructionElement.getHtml()
                    } : {
                      id : randomInstructionId,
                      lang : "en",
                      content : ""
                    }),
                    callback : function(ok) {
                        if (ok == "ok") {
                            // set the jf-conditional to the current values of activeConditions
                            activeConditions = activeConditions.map(function(c) {
                              if (!c._id) {
                                c._id = "condition_"+parseInt(Math.random()*10000000);
                              }
                              return c;
                            }); 
                            ConditionalsService.set(activeConditions);
                            var jfConditionals = activeConditions.map(function(c) {
                              return "#" + c._id;
                            }).join(" ");
                            el.setAttribute("data-jf-conditional", jfConditionals);
                            el.setAttribute("id", myId);
                            el.removeAttribute("data-os-new");
                            // set jf-conditional-instruction
                            instructionElement.setHtml(this.instruction.content);
                          
                            instructionElement.setAttribute("lang", this.instruction.lang);
                            instructionElement.setAttribute("data-type", "instruction");
                            instructionElement.setAttribute("id", this.instruction.id);
                            if (this.instruction.content.replace(/\s+/, "")) {
                              // all instructions should be local
                              el.setAttribute("data-jf-conditional-instruction", "/data/notes/#" + this.instruction.id);
                              el.removeAttribute("data-os-instruction-loaded");
                            }
                            else {
                              // there is no instruction text
                              el.removeAttribute("data-jf-conditional-instruction");
                            }
                            el.setAttribute("data-os-changed", "1");
                            updateElementContent(el, jfConditionals);
                        }
                        else if (ok == "cancel") {
                          if (el.hasAttribute("data-os-new")) {
                            wid.destroy();
                          }
                        }
                        else if (ok == "remove") {
                            wid.destroy();
                        }
                        // artificially send a change event to ng-ckeditor so it will update the scope
                        editor.fire("change");
                    }
                });
                DialogService.open("editConditionsDialogSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "phony-conditional", "div", "jf-conditional",
                    function(id) {  // beginTemplate 
                        return '<div id="start_'+id+'" data-jf-conditional="" class="jf-conditional layer layer-phony-conditional start" data-os-new="1">'+  
                               '</div>'; 
                    },
                    function(id) {  // endTemplate
                        return '<div id="end_'+id+'" class="jf-conditional layer layer-phony-conditional end">&#x21d1;'+'</div>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'jf-conditional' );
			},
			init: function(ev) {
                //this.on( 'doubleclick', blockObject.doubleclick);

                /* when initialized, load the settings content as JSON */
                var jfConditional = this.element.getAttribute("data-jf-conditional");
                var el = this.element;
                updateElementContent(el, jfConditional);
                /* show a dialog when ready */
                this.once("ready", function(evt) {
                  if (this.element.hasAttribute("data-os-new")) {
                    this.edit();
                  }
                });
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
