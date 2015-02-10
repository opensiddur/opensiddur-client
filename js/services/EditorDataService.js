/* Service for sharing data between CKEditor widgets and dialogs
 * 
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.factory("EditorDataService", [ 
    function() {
        var data = {
            editLinkDialog : {}
        };
        return data;
    }
]);
