/* XSLT service 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service(
    'XsltService',
    ['$rootScope', '$http', '$location', 'ErrorService',
    function ( $rootScope, $http, $location, ErrorService ) {
        // initialize all of the stylesheets
        svc = {
            xsltProcessors : {},
            addProcessor : function ( processorName, path ) {
                this.xsltProcessors[processorName] = path; 
            },
            transform : function ( processorName, domDoc, parameters ) {
                var transformed = Saxon.run({
                    stylesheet : this.xsltProcessors[processorName],
                    source : domDoc,
                    parameters : parameters,
                    method : "transformToDocument",
                    errorHandler : function (err) {
                        ErrorService.addAlert(err.message, "error");
                    },
                    logLevel : "SEVERE"
                });
                return transformed.getResultDocument();
            },
            transformString : function ( processorName, data, parameters ) {
                var dataDomDoc = Saxon.parseXML(data);
                return this.transform(processorName, dataDomDoc, parameters);
            },
            serializeToString : function ( doc ) {
                return ((new window.XMLSerializer()).serializeToString(doc))
                    .replace(/\s+xmlns:xml="http:\/\/www.w3.org\/XML\/1998\/namespace"/g, "");
            }
        }
        svc.addProcessor('instance', '/xsl/instance.xsl');
        svc.addProcessor('teiToHtml', '/xsl/tei2html.xsl');
        svc.addProcessor('htmlToTei', '/xsl/html2tei.xsl');
        svc.addProcessor('originalTemplate', '/xsl/originaltemplate.xsl');
        svc.addProcessor('originalBeforeSave', '/xsl/OriginalBeforeSave.xsl');
        svc.addProcessor('profileFormTemplate', '/xsl/profileformtemplate.xsl');
        svc.addProcessor('sourceFormTemplate', '/xsl/sourceformtemplate.xsl');
        svc.addProcessor('cleanupForm', '/xsl/cleanupform.xsl');
        svc.addProcessor('addXmlId', '/xsl/add-xml-id.xsl');
        svc.addProcessor('wordify', '/xsl/wordify.xsl');
        return svc;
    }]
);

