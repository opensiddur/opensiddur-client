/* 
 * controller for sources page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'SourcesCtrl',
    ['$scope', 
    function ($scope) {
        console.log("Sources controller. Nothing to do here.");
        
        $scope.editor = {
            currentDocument : "",   // document to load
            content : [],           // document content
            setDocument : function(toDocument) {
                this.currentDocument = toDocument;
                // now load here
            } 
        };            
    }]
);
