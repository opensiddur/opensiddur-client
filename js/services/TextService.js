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
        partialContent : function(contentElement, setContent) {
            /* replace a single-instance element's content.
                There must be exactly one of the contentElement in _content to use this function
             */
            if (setContent) {
                var regex = new RegExp("(<"+contentElement+"[^>]*>\\s*)[\\S\\s]*(\\s*</"+contentElement+">)", "gm");
                this._content = this._content.replace(regex, "$1" + setContent + "$2");
                return this;
            }
            return (this._content) ? $(contentElement.replace(":", "\\:"), this._content).html() : "";
        },
        streamText : function(setContent) { return this.partialContent("j:streamText", setContent); },
        stylesheet : function(setContent) { return this.partialContent("j:stylesheet", setContent); },
        annotations : function(setContent) { return this.partialContent("j:annotations", setContent); },
        title : function(titleJson) {
            // [ {title :, lang:, subtitle: } ]
            var xj = new X2JS({ arrayAccessForm : "property" });   
            
            if (titleJson) {
                this._content = XsltService.indentToString(
                    XsltService.transformString("/xsl/SetTitles.xsl", this._content, { 
                        "new-titles" : xj.json2xml(angular.fromJson(angular.toJson({titles : {title : titleJson}})))}
                ));
                return this;
            }
            return xj.xml2json(XsltService.transformString("/xsl/GetTitles.xsl", this._content)).titles.title_asArray;
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
