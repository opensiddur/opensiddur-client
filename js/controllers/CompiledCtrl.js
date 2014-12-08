/* 
 * controller for compiled page, which shows a compiled document in an iframe
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
  'CompiledCtrl',
  ['$scope', '$routeParams', 'RestApi', 'ErrorService', 
  function ($scope, $routeParams, RestApi, ErrorService) {
    console.log("Compiled controller.");

    RestApi["/api/data/original"].getCompiled({"resource" : $routeParams.resource },
        function(html) {
            // not sure why all this is necessary: 
            var doc = $('#frame')[0].contentDocument || $('#frame')[0].contentWindow.document
            doc.write(html.xml);
            doc.close()
            $("#frame").height($(document.body).height() - 100);
        },
        function(err) { ErrorService.getApiError(err); }
    );
  }]
);
