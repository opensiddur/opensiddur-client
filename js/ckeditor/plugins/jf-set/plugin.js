/**
 * jf:set widget, based on simplebox widget:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 *
 * Created out of the CKEditor Widget SDK:
 * http://docs.ckeditor.com/#!/guide/widget_sdk_tutorial_2
 */

CKEDITOR.plugins.add( 'jf-set', {
	requires: 'widget',

	icons: 'jf-set',

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
        var blockObject = new BlockObject(editor, true, true);
        var interval = $interval(function (evt) {
            editor.widgets.checkWidgets();
        }, 1000);


		editor.widgets.add( 'jf-set', {
            draggable : false,
            inline : false, 
			allowedContent:
				'p[id](jf-set,layer,layer-phony-set,start,end);' + 
                'img[src,alt,title]' +
                '*(editor-*)',
			requiredContent: 'p(jf-set)',

			button: 'Set conditional variable values',
            edit : function ( evt) {
                var root = angular.element('*[data-ng-app]');  
                var injector = root.injector();
                var DialogService = injector.get("DialogService");
                var EditorDataService = injector.get("EditorDataService");
                var SettingsService = injector.get("SettingsService");
                var el = this.element;
                var randomId =  "set_" + parseInt(Math.random()*10000000) ;
                var myId = el.getAttribute("id") || randomId;
                var initialSettingPointers = el.getAttribute("data-jf-set");
                if (initialSettingPointers) {
                  activeSettings = SettingsService.getSettingsByPointer(initialSettingPointers).settings.setting_asArray;
                }
                else {
                  activeSettings = [];
                }
                EditorDataService.set("editSettingsDialog", {
                    active : activeSettings,
                    callback : function(ok) {
                        if (ok) {
                            // set the jf-set to the current values of settingsPointers
                            var newSettings = { settings : { setting : activeSettings }};
                            var newPointers = SettingsService.setSettings(newSettings);
                            el.setAttribute("data-jf-set", newPointers.join(" "));
                            el.setAttribute("id", myId);
                            // artificially send a change event to ng-ckeditor so it will update the scope
                            editor.fire("change");
                        }
                    }
                });
                DialogService.open("editSettingsDialogSimple");
                
            },
            insert: function() {
                blockObject.insert(
                    "phony-set", "p", "jf-set",
                    function(id) {  // beginTemplate 
                        return '<p id="start_'+id+'" data-jf-set="" class="jf-set layer layer-phony-set start">[SET]'+  
                               '&#x21d3;'+
                               '</p>'; 
                    },
                    function(id) {  // endTemplate
                        return '<p id="end_'+id+'" class="jf-set layer layer-phony-set end">&#x21d1;[SET]</p>';
                    }

                );
            },
			upcast: function( element ) {
				return element.name == 'p' && element.hasClass( 'jf-set' );
			},
			init: function(ev) {
                //this.on( 'doubleclick', blockObject.doubleclick);

                /* when initialized, load the settings content as JSON */
                var jfSet = this.element.getAttribute("data-jf-set");
                var el = this.element;
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
