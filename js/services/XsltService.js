/* XSLT service 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.service(
    'XsltService',
    ['$rootScope', '$http', '$location',
    function ( $rootScope, $http, $location ) {
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
                    method : "transformToDocument"
                });
                return transformed.getResultDocument();
            },
            transformString : function ( processorName, data, parameters ) {
                var dataDomDoc = Saxon.parseXML(data);
                return this.transform(processorName, dataDomDoc, parameters);
            }
        }
        svc.addProcessor('instance', '/xsl/instance.xsl');
        svc.addProcessor('teiToHtml', '/xsl/tei2html.xsl');
        svc.addProcessor('htmlToTei', '/xsl/html2tei.xsl');
        svc.addProcessor('profileFormTemplate', '/xsl/profileformtemplate.xsl');
        svc.addProcessor('sourceFormTemplate', '/xsl/sourceformtemplate.xsl');
        svc.addProcessor('cleanupForm', '/xsl/cleanupform.xsl');
        svc.addProcessor('addXmlId', '/xsl/add-xml-id.xsl');
        svc.addProcessor('wordify', '/xsl/wordify.xsl');
        return svc;
    }]
);

