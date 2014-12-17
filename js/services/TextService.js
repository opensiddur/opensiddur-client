/* Represents the data model of a JLPTEI text and isolates its components
 * TODO: move all load() and save() activity to this service
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service("TextService", [
    "XsltService",
    function(XsltService) {
    return {
        _content : "",
        content : function(setContent) {
            if (setContent) {
                this._content = setContent;
                return this;   
            }
            return this._content;
        },
        license : function(licenseJson) {
            // return or accept { license : "string" }
            if (licenseJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetLicense.xsl", this._content, licenseJson));
                return this;
            }
            return { license : $("tei\\:licence", this._content).attr("target") };
        }
    };
}]);
