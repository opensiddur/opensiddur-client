/* XSLT service 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
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
                thisSvc = this;
         
                var xslDomDoc = Sarissa.getDomDocument();
                $.ajax({
                    url : path,
                    success : function(data) {
                        xslDomDoc = (new DOMParser()).parseFromString(data, "text/xml");  
                        var processor = new XSLTProcessor();
                        processor.importStylesheet(xslDomDoc);
                        thisSvc.xsltProcessors[processorName] = processor;
                        console.log("XSLT service:" + processorName + " added");
                    },
                    error : function() {
                        console.error("Could not load XSLT " + processorName + " from " + path);
                    },
                    async : false
                });    
                /*
                return $http.get(path)
                    .success(
                        function( data, status, headers, config ) {
                            var xslDomDoc = Sarissa.getDomDocument();
                            xslDomDoc = (new DOMParser()).parseFromString(data, "text/xml");  
                            
                            var processor = new XSLTProcessor();
                            processor.importStylesheet(xslDomDoc);
                            thisSvc.xsltProcessors[processorName] = processor;
                            console.log("XSLT service:" + processorName + " added");
                        } )
                    .error(
                        function( data, status, headers, config ) {
                            console.error("Could not load XSLT " + processorName + " from " + path);
                        }
                    )
                
                */
            },
            transform : function ( processorName, domDoc, parameters ) {
                if (parameters) {
                    thisProcessor = this.xsltProcessors[processorName];
                    //xsltCopy = angular.copy(this.xsltProcessors[processorName]);
                    //console.log(xsltCopy);
                    for (var parameter in parameters) {
                        thisProcessor.setParameter(null, parameter, parameters[parameter]);
                    }
                    transformed = thisProcessor.transformToDocument(domDoc);
                    thisProcessor.clearParameters();
                    return transformed;
                }
                else 
                    return this.xsltProcessors[processorName].transformToDocument(domDoc);
            },
            transformString : function ( processorName, data, parameters ) {
                var dataDomDoc = Sarissa.getDomDocument();
                dataDomDoc = (new DOMParser()).parseFromString(data, 'text/xml');
                return this.transform(processorName, dataDomDoc, parameters);
            }
        }
        svc.addProcessor('instance', '/xsl/instance.xsl');
        svc.addProcessor('teiToHtml', '/xsl/tei2html.xsl');
        svc.addProcessor('htmlToTei', '/xsl/html2tei.xsl');
        svc.addProcessor('profileFormTemplate', '/xsl/profileformtemplate.xsl');
        svc.addProcessor('sourceFormTemplate', '/xsl/sourceformtemplate.xsl');
        svc.addProcessor('cleanupForm', '/xsl/cleanupform.xsl');
        return svc;
    }]
);

