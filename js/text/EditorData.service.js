/* Service for sharing data between CKEditor widgets and dialogs
 * 
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.factory("EditorDataService", [ 
    function() {
        return {
            editLinkDialog : {},
            get : function (name) {
                return this[name];
            },
            set : function (name, value) {
                this[name] = value;
                return this;
            }
        };
    }
]);
