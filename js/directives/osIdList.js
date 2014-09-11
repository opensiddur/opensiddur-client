/* List box for xml:id s
 *
 * Usage:
 * <os-id-list  content="" update=""
 * allow-range="" selection="" />
 * content points to the XML (as string)
 * selection returns the selected id
 * update triggers the list to update when changed
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osIdList',
        [
        'RestApi', 'XsltService',
        function( RestApi, XsltService ) {
            return {
                restrict : 'AE',
                scope : {
                    content : "=",
                    allowRange : "=",
                    selection : "=",
                    update : "="
                },
                controller: ['$scope', function ($scope) {
                    console.log("In id list controller");
                    $scope.xmlids = [];
                    $scope.filters = {
                        name : "",
                        stream : "",
                        element : ""
                    };

                    $scope.links = {
                        selection : "",
                        selected : "",
                        from : "",
                        to : "",
                        composed : "",
                        setComposed : function() {
                            if (this.from && (this.from == this.to)) {
                                this.selected = this.from;
                                this.from = "";
                                this.to = "";
                                this.composed = "#"+this.selected;
                            }
                            else if (this.from || this.to) {
                                this.composed = "#range("+(this.from || "FROM?")+","+(this.to || "TO?")+")"; 
                            }
                            else if (this.selected) {
                                this.composed = "#"+this.selected;
                            }
                            else {
                                this.composed = "";
                            }
                            $scope.selection = this.composed;
                        },
                        setFrom : function() {
                            this.from = this.selection;
                            if (!this.to)
                                this.to = this.selected;
                            this.selected = "";
                            this.setComposed();
                        },
                        setTo : function() {
                            this.to = this.selection;
                            if (!this.from)
                                this.from = this.selected;
                            this.selected = "";
                            this.setComposed();
                        },
                        select : function() {
                            this.from = "";
                            this.to = "";
                            this.selected = this.selection;
                            this.setComposed();
                        },
                        clear : function() {
                            this.from = "";
                            this.to = "";   
                            this.selected = "";
                            this.composed = "";
                            this.setComposed();
                        }
                    };                    


                    $scope.select = function(what, index) {
                        console.log("Selected:", what);
                        // clear existing selections
                        $scope.parentElement.find("tr").removeClass("info");
                        // set the selected class
                        $scope.parentElement.find("tr").eq(index).addClass("info"); 
                        
                        $scope.links.selection = what;
                    };
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.parentElement = elem.find("tbody"); 
                    var x2js_simple = new X2JS({ "arrayAccessForm" : "none", "emptyNodeForm" : "text" });   

                    var loadXmlIds = function (update) {
                        if (update) {
                            var xid = XsltService.transformString("listXmlId", scope.content);
                            scope.xmlids = x2js_simple.xml2json(xid).xmlids.xmlid;
                        }
                        scope.links.clear();
                    };

                    scope.$watch("update", loadXmlIds);
                 },
                 transclude : false,
                 templateUrl : "/js/directives/osIdList.html"
             };
        }
        ]
);

