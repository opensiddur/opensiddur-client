/*
 * Local configuration file for Open Siddur
 * 
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein,efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 * 
 */

// insert plugin names here...
//CKEDITOR.resourceManager.addExternal("", "/js/ckeditor/plugins/");

CKEDITOR.editorConfig = function (config) {
    config.toolbar = "basic";
    config.toolbar_full = [];
    config.toolbarGroups = [
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] }
/*
                { name: 'editing',     groups: [ 'find', 'selection' ] },
                { name: 'insert' },
                { name: 'forms' },
                { name: 'tools' },
                { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
                { name: 'others' },
                '/',
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                { name: 'styles' },
                { name: 'colors' },
                { name: 'about' }
*/
    ];
    config.removeButtons = 'Paste,PasteFromWord';
    
};
