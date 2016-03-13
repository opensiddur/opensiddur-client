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
            if (thisBound == "start" && jfConditional) {
              var activeConditionalsList = ConditionalsService.getByPointer(jfConditional).map(function(c) {
                return ('<li class="editor-internal editor-conditional">'+
                        c.__text+
                        '</li>')
              }).join("");
              cnds = '<ul class="editor-internal editor-conditionals">' + activeConditionalsList + '</ul>';
            }
            el.setHtml(
              '<img class="editor-internal editor-icon" src="/img/icons_32x32/icon_if-conditional.png"></img>' + (thisBound == "start" ? "&#x21d3;" : "&#x21d1;") +
              cnds
            );
            editor.fire("change");
        };

		editor.widgets.add( 'jf-conditional', {
            draggable : false,
            inline : false, 
			allowedContent:
				'p[id](jf-conditional,layer,layer-phony-set,start,end);' + 
                'img[src,alt,title]' +
                '*(editor-*)',
			requiredContent: 'p(jf-conditional)',

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
                if (initialConditionPointers) {
                  activeConditions = ConditionalsService.getByPointer(initialConditionPointers);
                }
                else {
                  activeConditions = [];
                }
                EditorDataService.set("editConditionsDialog", {
                    active : activeConditions,
                    callback : function(ok) {
                        if (ok) {
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
                            // artificially send a change event to ng-ckeditor so it will update the scope
                            updateElementContent(el, jfConditionals);
                            editor.fire("change");
                        }
                    }
                });
                DialogService.open("editConditionsDialogSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "phony-conditional", "p", "jf-conditional",
                    function(id) {  // beginTemplate 
                        return '<p id="start_'+id+'" data-jf-conditional="" class="jf-conditional layer layer-phony-conditional start">'+  
                               '</p>'; 
                    },
                    function(id) {  // endTemplate
                        return '<p id="end_'+id+'" class="jf-conditional layer layer-phony-conditional end">&#x21d1;'+'</p>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'p' && element.hasClass( 'jf-conditional' );
			},
			init: function(ev) {
                //this.on( 'doubleclick', blockObject.doubleclick);

                /* when initialized, load the settings content as JSON */
                var jfConditional = this.element.getAttribute("data-jf-conditional");
                var el = this.element;
                updateElementContent(el, jfConditional);
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
