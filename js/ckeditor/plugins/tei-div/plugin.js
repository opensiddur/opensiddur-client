/**
 * tei:div widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'tei-div', {
	requires: 'widget',

	icons: 'tei-div',

	init: function( editor ) {
        var rootElement = angular.element('*[data-ng-app]'); 
        var formElement = angular.element('form[name=textsForm]'); 
        var injector = rootElement.injector();
        var TextService = injector.get("TextService");
        var DialogService = injector.get("DialogService");
        var EditorDataService = injector.get("EditorDataService");
        var $scope = formElement.scope();

        var img =  '<img class="editor-internal editor-icon" src="/js/ckeditor/plugins/tei-div/icons/tei-div.png"/>';

        var thiz = this;
        var blockObject = new BlockObject(editor, true, true);

		editor.widgets.add( 'tei-div', {
            draggable : false,
            inline : false, 
			allowedContent:
				'div[id](tei-div,layer,layer-div,start,end);' +
                'h1[id](tei-head);' +
                'img[src,alt,title];' +
                '*(editor-*)',
			requiredContent: 'div(tei-div)',

			button: 'Division with header',
            edit : function ( evt) {
                var el = this.element;
                var wid = this;
                var headElement = el.findOne(".tei-head");
                var randomId =  "head_" + parseInt(Math.random()*10000000) ;
                EditorDataService.set("editDivDialog", {
				    lang : headElement.getAttribute("lang") || "en",
                    content : headElement.getHtml(),
                    callback : function(ok) {
                        if (ok) {
                            // todo: edit from here
                            el.removeAttribute("data-os-new");
                            var stream = el.getParents()[1];
                            headElement.setAttribute("lang", this.lang);
                            headElement.setHtml(this.content);
                            el.setAttribute("data-os-changed", "1");
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
                DialogService.open("editDivDialogSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "div", "div", "tei-div",
                    function(id) {  // beginTemplate 
                        return '<div id="start_'+id+'" class="tei-div layer layer-div start" data-os-new="1">' +
                               img +
                               '&#x21d3;'+
                               '<h1 class="tei-head">Header</h1>' +
                               '</div>'; 
                    },
                    function(id) {  // endTemplate
                        return '<div id="end_'+id+'" class="tei-div layer layer-div end">&#x21d1;' + img + '</div>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'tei-div' );
			},
			init: function(ev) {
                var el = this.element;
                var headerEl = el.findOne(".tei-head");
                var header = (headerEl === null) ? '<h1 class="tei-head">Header</h1>' : headerEl.getOuterHtml();
                el.setHtml(el.hasClass("start") ? (
                    img + "&#x21d3;" + header) : (
                        "&#x21d1;" + img));


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
