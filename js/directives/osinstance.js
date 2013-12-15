/* "instance" directive
 * Intended to work like an instance in XForms
 * The input element drives a template, which is converted by XSLT into HTML that 
 * references a JSON object.
 *
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
    'osInstance',
    ['XsltService',
    function(XsltService) {
        return {
            restrict : 'AE',
            compile : function(elem, attrs) {
                // take the current elem, convert it to a template using
                var template = XsltService.transformString(attrs.formTemplate, $(elem).html());
                var instanceTemplate = XsltService.transform("instance", template, { "model-scope" : attrs.osInstance } );
                var htmlTemplate = XsltService.transform("teiToHtml", instanceTemplate);
                elem.addClass("instance");
                elem.children().replaceWith(htmlTemplate.children[0]); 
            },
            replace: true
        };
    }
    ]
);
