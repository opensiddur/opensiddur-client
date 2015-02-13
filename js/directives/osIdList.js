/* List box for xml:id s
 *
 * Usage:
 * <os-id-list  content="" update=""
 * allow-range="" selection="" />
 * content points to the XML (as string)
 * selection returns the selected id
 * update triggers the list to update when changed
 *
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osIdList',
        [
        'XsltService',
        function( XsltService ) {
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
                        active : null,      /* active clicked on entity */
                        fragment : null,    /* selected fragment when only a single fragment is selected */
                        from : null,        /* beginning of range */
                        to : null,          /* end of range */
                        composed : "",      /* string representation of the current constructed #fragment or #range */
                        setComposed : function() {
                            if (this.from && (this.from == this.to)) {
                                this.fragment = this.from;
                                this.from = null;
                                this.to = null;
                                this.composed = "#"+this.fragment.name;
                            }
                            else if (this.from || this.to) {
                                this.composed = "#range("+(this.from.name || "FROM?")+","+(this.to.name || "TO?")+")"; 
                            }
                            else if (this.fragment) {
                                this.composed = "#"+this.fragment.name;
                            }
                            else {
                                this.composed = "";
                            }
                            // set the outward facing string
                            $scope.selection = this.composed;
                        },
                        setFrom : function() {
                            this.from = this.active;
                            if (!this.to)
                                this.to = this.fragment;
                            this.fragment = null;
                            this.setComposed();
                        },
                        setTo : function() {
                            this.to = this.active;
                            if (!this.from)
                                this.from = this.fragment;
                            this.fragment = null;
                            this.setComposed();
                        },
                        select : function() {
                            this.from = null;
                            this.to = null;
                            this.fragment = this.active;
                            this.setComposed();
                        },
                        clear : function() {
                            this.from = null;
                            this.to = null;   
                            this.fragment = null;
                            this.composed = "";
                            this.setComposed();
                        },
                        canFrom : function() {
                            // return true if from can be set from the current active
                            return $scope.allowRange && this.active && this.active.stream == 'Y' && 
                                ((this.fragment && this.active.index < this.fragment.index) ||
                                 (this.to &&  this.active.index < this.to.index)); 
                        },
                        canTo : function() {
                            // return true if to can be set from the current active
                            return $scope.allowRange && this.active && this.active.stream == 'Y' &&
                                ((this.fragment && this.active.index > this.fragment.index) ||
                                 (this.from &&  this.active.index > this.from.index)); 
                        }

                    };                    


                    $scope.select = function(what, index) {
                        console.log("Selected:", what);
                        // clear existing selections
                        $scope.parentElement.find("tr").removeClass("info");
                        // set the selected class
                        $scope.parentElement.find("tr").eq(index).addClass("info"); 
                        
                        $scope.links.active = what;
                    };
                 }],
                 link: function(scope, elem, attrs, ctrl) {
                    scope.parentElement = elem.find("tbody"); 
                    var x2js_simple = new X2JS({ "arrayAccessForm" : "property", "emptyNodeForm" : "text" });   

                    var loadXmlIds = function (update) {
                        if (update) {
                            var xid = XsltService.transformString("listXmlId", scope.content);
                            scope.xmlids = x2js_simple.xml2json(xid).xmlids.xmlid_asArray.map(
                                function (xid, idx) {
                                    xid.index = idx;
                                    return xid;
                                }
                            );
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

