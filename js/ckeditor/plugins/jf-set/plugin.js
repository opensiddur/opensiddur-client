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
        var SettingsService = injector.get("SettingsService");
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
        var updateElementContent = function(el, jfSet) {
            var idtokens = el.getId().match(/^(start|end)_(.+)/);
            var thisBound = idtokens[1];
            var sets = "";
            if (thisBound == "start" && jfSet) {
              var activeSettingsList = SettingsService.getSettingsByPointer(jfSet).settings.setting_asArray.map(function(s) {
                return ('<li class="editor-internal editor-setting">'+
                        '<span class="editor-internal editor-setting-type">'+s.type+'</span>$<span class="editor-internal editor-setting-name">'+s.name+'</span>=<span class="editor-internal editor-setting-state">'+s.state+'</span>'+
                        '</li>')
              }).join("");
              sets = '<ul class="editor-internal editor-settings">' + activeSettingsList + '</ul>';
            }
            el.setHtml(
              '<img class="editor-internal editor-icon" src="/img/icons_32x32/icon_set.png"></img>' + (thisBound == "start" ? "&#x21d3;" : "&#x21d1;") +
              sets
            );
            editor.fire("change");
        };

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
                var el = blockObject.startBound(this.element);
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
                            var jfSet = newPointers.join(" ");
                            el.setAttribute("data-jf-set", jfSet);
                            el.setAttribute("id", myId);

                            // artificially send a change event to ng-ckeditor so it will update the scope
                            updateElementContent(el, jfSet);
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
                        return '<p id="start_'+id+'" data-jf-set="" class="jf-set layer layer-phony-set start">'+  
                               '</p>'; 
                    },
                    function(id) {  // endTemplate
                        return '<p id="end_'+id+'" class="jf-set layer layer-phony-set end">&#x21d1;'+'</p>';
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
                updateElementContent(el, jfSet);
			},
            destroy : blockObject.destroy,
			data: function() {
			}

		} );
	}
} );
