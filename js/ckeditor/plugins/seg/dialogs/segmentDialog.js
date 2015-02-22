/* segment plugin properties dialog 
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
CKEDITOR.dialog.add( 'segmentDialog', function ( editor ) {
    return {
        title : "Segment Properties",
        minWidth : 400,
        minHeight : 200,
        contents : [
            {
                id : "tab-properties",
                label : "Properties",
                elements : [
                    type : "text",
                    id : "id",
                    label : "Unique identifier",
                    validate : CKEDITOR.dialog.validate.notEmpty("Required field"),
                    setup : function ( element ) {
                        this.setValue( element.getAttribute("id"));
                    }
                ]
            }
        ],
        onShow : function() {
            var segment = editor.getSelection().getStartElement().getAscendant("div", true);
            
        },
        onOk: function() {
            var dialog = this;
            var segment = editor.document.createElement( 'seg' );

            segment.setAttribute( 'id', dialog.getValueOf( 'tab-properties', 'id' ) );
        }
    };
}); 
