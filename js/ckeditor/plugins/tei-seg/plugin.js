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
		editor.addCommand( 'segmentProperties', new CKEDITOR.dialogCommand( 'segmentPropertiesDialog', {
			allowedContent: 'p[id](tei-seg)',
			requiredContent: 'p',
            contextSensitive: true,
            startDisabled : true,
            refresh: function (editor, path) {
                var element = path.lastElement && path.lastElement.getAscendant( thiz.isSeg, true );

        		if ( element )
        			this.setState( CKEDITOR.TRISTATE_OFF );
		        else
			        this.setState( CKEDITOR.TRISTATE_DISABLED );

            }

		} ) );

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
