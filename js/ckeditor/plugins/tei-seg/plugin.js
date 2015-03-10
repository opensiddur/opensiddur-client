/**
 * tei:seg plugin
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Modifications licensed under the GNU Lesser General Public License, version 3 or later 
 *
 * Based on the CKEditor example plugin:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 */

CKEDITOR.plugins.add( 'tei-seg', {
	icons: 'segment',
	init: function( editor ) {
        var thiz = this;
		editor.addCommand( 'segmentProperties', {
			allowedContent: 'p[id,lang](tei-seg)',
			requiredContent: 'p',
            contextSensitive: true,
            startDisabled : true,
            refresh: function (editor, path) {
                var element = path.lastElement && path.lastElement.getAscendant( thiz.isSeg, true );

        		if ( element )
        			this.setState( CKEDITOR.TRISTATE_OFF );
		        else
			        this.setState( CKEDITOR.TRISTATE_DISABLED );

            },
            exec : function (editor) {
                var injector = angular.element('*[data-ng-app]').injector();
                var DialogService = injector.get("DialogService");
                var TextService = injector.get("TextService");
                var EditorDataService = injector.get("EditorDataService");
                var el = editor.getSelection().getStartElement();
                var defaultLanguage = TextService.language().language;
                EditorDataService.set("editSegmentDialog", {
                    id : el.getAttribute("id") || "",
                    lang : el.getAttribute("lang") || defaultLanguage, 
                    callback : function(ok) {
                        if (ok) {
                            el.setAttribute("id", this.id);
                            if (this.lang != defaultLanguage) {
                                el.setAttribute("lang", this.lang);    
                            }
                        }
                    }
                });
                DialogService.open("editSegmentDialogSimple");
            }

		});

		editor.ui.addButton( 'Segment', {
			label: 'Segment properties',
			command: 'segmentProperties',
			toolbar: 'opensiddur'
		});

		if ( editor.contextMenu ) {
			
			editor.addMenuGroup( 'opensiddurGroup' );
			editor.addMenuItem( 'segmentPropertiesItem', {
				label: 'Segment properties',
				icon: this.path + 'icons/segment.png',
				command: 'segmentProperties',
				group: 'opensiddurGroup'
			});

			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant( thiz.isSeg, true ) ) {
					return { segmentPropertiesItem: CKEDITOR.TRISTATE_OFF };
				}
			});
		}

		CKEDITOR.dialog.add( 'segmentPropertiesDialog', this.path + 'dialogs/segmentProperties.js' );
	},
    isSeg : function(element) {
        return element && element.type == CKEDITOR.NODE_ELEMENT && (element.getName() == "p" || element.hasClass("tei-seg"));
    }
});
