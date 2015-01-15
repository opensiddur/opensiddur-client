/**
 * tei:seg plugin
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Modifications licensed under the GNU Lesser General Public License, version 3 or later 
 *
 * Based on CKEditor example plugin:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 */

// Our dialog definition.
CKEDITOR.dialog.add( 'segmentPropertiesDialog', function( editor ) {
	return {
		title: 'Segment Properties',
		minWidth: 400,
		minHeight: 200,

		contents: [
			{
				id: 'tab-props',
				label: 'Basic Properties',

				elements: [
					{
						type: 'text',
						id: 'id',
						label: 'Unique identifier',

						requiredContent: 'div(tei-seg)[id]',
						validate: CKEDITOR.dialog.validate.notEmpty( "Unique identifier cannot be empty." ),

						setup: function( element ) {
							this.setValue( element.getAttribute( "id" ) );
						},

						commit: function( element ) {
							element.setAttribute( "id", this.getValue() );
						}
					}
				]
			}

		],

		onShow: function() {

			var selection = editor.getSelection();
			var element = selection.getStartElement();
			if ( element )
				element = element.getAscendant( function(el) { return el.getName() == "div" && el.hasClass("tei-seg"); } , true );
            else {
                alert("You need to be in a segment!");
                return;
            }
			this.element = element;
			this.setupContent( this.element );
		},

		onOk: function() {
			var dialog = this;

			var seg = this.element;

			this.commitContent( seg );
		}
	};
});
