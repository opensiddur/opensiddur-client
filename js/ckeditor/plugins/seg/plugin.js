/* segment plugin
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

CKEDITOR.plugins.add("seg", {
    icons: "seg",
    init: function(editor) {
        CKEDITOR.dialog.add("segmentDialog", this.path + "dialogs/segmentDialog.js");
        editor.addCommand("editSegment", 
            new CKEDITOR.dialogCommand(
                "segmentDialog",
                allowedContent : "div(tei-seg)[!id]"
            )
        );
        editor.ui.addButton( 'Segment', {
            label: 'Segment properties',
            command: 'editSegment',
            toolbar: 'opensiddur'
        });
        
    }
});
