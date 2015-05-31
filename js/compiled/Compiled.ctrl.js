/* 
 * controller for compiled page, which shows a compiled document in an iframe
 * 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osCompiledModule.controller(
  'CompiledCtrl',
  ['$scope', '$routeParams', 'CompiledService', 'ErrorService', 
  function ($scope, $routeParams, CompiledService, ErrorService) {
    console.log("Compiled controller.");

    CompiledService.get($routeParams.resource)
    .success(function(html) {
        var doc = $('#frame')[0].contentDocument || $('#frame')[0].contentWindow.document
        doc.write(html);
        doc.close()
        $("#frame").height($(document.body).height() - 100);
    })
    .error(function(err) { 
        ErrorService.getApiError(err); 
    });
  }]
);
