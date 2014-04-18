/* 
 * controller for translations page 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TranslationsCtrl',
    ['$scope', '$http', '$location', '$route', '$routeParams', '$q', 'AuthenticationService', 'ErrorService', 'IndexService', 'RestApi', 
    function($scope, $http, $location, $route, $routeParams, $q, AuthenticationService, ErrorService, IndexService, RestApi) {
        console.log("translations controller");
        IndexService.search.enable( "/api/data/linkage" );
        if ($routeParams.resource) {
            IndexService.search.collapse();
        }
        $scope.search = IndexService.search;
        $scope.temporary = {
            link1 : "",
            link2 : ""
        };
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : $routeParams.resource,
            // TODO: this is copied verbatim from TextsCtrl... need some serious refactoring
            access : {},
            accessModel : "public",
            setAccessModel : function() {
                this.accessModel = (this.isNew) ? "public" : (
                    (this.access.group == "everyone" && this.access.groupWrite) ? "public" : "restricted"
                );
            },
            saveAccessModel : function() {
                if (this.access.chmod && !this.isNew) {
                    if (this.accessModel == "public") {
                        this.access.groupWrite = true;
                        this.access.group = "everyone";
                    }
                    else {  // restricted
                        this.access.groupWrite = false;
                        this.access.group = "everyone";
                    }
                    RestApi["/api/data/linkage"].setAccess({
                            "resource" : this.currentDocument //decodeURI(this.currentDocument)
                        }, this.access, 
                        function() {}, 
                        function( data ) { 
                            ErrorService.addApiError(data);
                        }
                    );
                }
            },
            isNew : 1,
            supportedLanguages : supportedLanguages,
            supportedLicenses : supportedLicenses,
            // template for the content structure
            content : {
                title : {
                    text : "",
                    lang : "en"
                },
                license : "http://www.creativecommons.org/publicdomain/zero/1.0",
                idno : "",
                links : [
                    {
                        resource : "",
                        domain : "stream",
                        stream : []
                    },
                    {
                        resource : "",
                        domain : "stream",
                        stream : []
                    }
                ],
                linkages : []
            },
            newLinkageBlock : function() { return { left : [], right : [] }; },
            parseParallelLinkages : function(linkGrp) {
                // given a jquery object containig the parallelText linkGrp,
                // parse the linkages into a structure that looks like:
                // [[startLeft, startRight, endLeft, endRight],...]
                var startAndEndFromTarget = function(target) {
                    var fragment = target.split("#")[1];
                    return ( 
                        (fragment.match(/^range\(/)) ?
                            fragment.replace(/(^range\()|(\)$)/g, "").split(",") :
                            [fragment, fragment] );
                };

                return linkGrp.find("tei\\:link").map(
                    function(idx, link) {
                        var targets = $(link).attr("target").split(/\s+/);
                        var left = startAndEndFromTarget(targets[0]);
                        var right = startAndEndFromTarget(targets[1]);
                        return {"leftstart" : left[0], "rightstart" : right[0], "leftend" : left[1], "rightend" : right[1]};
                    }
                );
            },
            loadDocument : function(docXml) {
                // expects an XML string
                var titleElement =  $("tei\\:title[type=main]", docXml);
                var license = $("tei\\:licence", docXml).attr("target");
                var idnoElement = $("j\\:parallelText tei\\:idno",docXml);
                $scope.editor.content = {
                    title : {
                        text : titleElement.html(),
                        lang : titleElement.attr("xml:lang")
                    },
                    license : license,
                    idno : idnoElement.html(),
                    links : [], 
                    linkages : []
                };

                var existingLinkages = this.parseParallelLinkages($("j\\:parallelText tei\\:linkGrp", docXml));

                $q.all(
                    $("j\\:parallelText tei\\:linkGrp", docXml).attr("domains").split(/\s+/).map(
                        function(domain, idx) {
                            return $scope.editor.updateParallelText(idx, "/exist/restxq/api" + domain.split("#")[0]);
                        }
                    )
                )
                .then(function() { 
                    // $scope.editor.content.links has the streams, 
                    // existingLinkages shows how they're currently divided into translation blocks
                    // this function produces linkage blocks
                    var leftStream = $scope.editor.content.links[0].stream;
                    var rightStream = $scope.editor.content.links[1].stream;
                    
                    var leftCtr = 0;            // pointers into the streams
                    var rightCtr = 0;

                    var linkages = [];

                    var catchUp = function(untilLeft, untilRight) {
                        var lbl = $scope.editor.newLinkageBlock();
                        var lbr = $scope.editor.newLinkageBlock();
                        var includeLeft = false;
                        var includeRight = false;

                        while (leftCtr < leftStream.length && leftStream[leftCtr].id != untilLeft) {
                            lbl.left.push(leftStream[leftCtr]);
                            leftCtr++;
                            includeLeft = true;
                        }

                        while (rightCtr < rightStream.length && rightStream[rightCtr].id != untilRight) {
                            lbr.right.push(rightStream[rightCtr]);
                            rightCtr++;
                            includeRight = true;
                        }

                        return [].concat((includeLeft) ? lbl : []).concat((includeRight) ? lbr : []);
                    };
                    var blockLink = function(untilLeft, untilRight) {
                        var lb = $scope.editor.newLinkageBlock();
                        while (leftCtr < leftStream.length) {
                            lb.left.push(leftStream[leftCtr]);
                            leftCtr++;
                            if (leftStream[leftCtr - 1].id == untilLeft) break;     // why the weird condition? ctr might be 0 at the start of the loop
                        }

                        while (rightCtr < rightStream.length) {
                            lb.right.push(rightStream[rightCtr]);
                            rightCtr++;
                            if (rightStream[rightCtr - 1].id == untilRight) break;
                        }

                        return [lb];
                    }; 

                    for (var i = 0; i < existingLinkages.length; i++) {
                        var exl = existingLinkages[i];
                        linkages = linkages.concat( catchUp(exl["leftstart"], exl["rightstart"]) ).concat( blockLink(exl["leftend"], exl["rightend"]) );
                    }
                    linkages = linkages.concat( catchUp(leftStream[leftStream.length - 1].id, rightStream[rightStream.length - 1].id) );

                    $scope.editor.content.linkages = linkages;
                    console.log("Both linkage documents loaded:", linkages); 
                });
            },
            newDocument : function() {
                console.log("New document");

                // default access rights for a new file
                $scope.editor.access = {
                    owner : AuthenticationService.userName,
                    group : "everyone",
                    worldRead : true,
                    worldWrite : false,
                    read : true,
                    write : true,
                    relicense : true,
                    chmod : true,
                    grantGroups : [],
                    grantUsers :[],
                    denyGroups : [],
                    denyUsers : []
                };
                // load a new document template
                documentTemplate = "/templates/linkage.xml";
                $http.get(documentTemplate) 
                    .success(
                        function(data) {
                            $scope.editor.loadDocument(data); 
                            $scope.editor.isNew = 1;
                        }
                    )
                    .error(
                        function(data) {
                            ErrorService.addApiError(data);
                            console.log("error loading", documentTemplate);
                        }
                    )

            },
            setDocument : function() {
                var toDocument = this.currentDocument;
                if (!toDocument) {
                    this.newDocument();
                }
                else {
                    console.log("Load from file");
                    $http.get("/api/data/linkage/"+encodeURI(toDocument))
                    .success(
                        function(data) {
                            $scope.editor.access = RestApi["/api/data/linkage"].getAccess({
                                    "resource" : toDocument //decodeURI(toDocument)
                                }, function( access ) {
                                    $scope.editor.setAccessModel();
                                });
                            $scope.editor.loadDocument(data);
                            $scope.editor.isNew = 0;
                        }
                    )
                    .error(
                        function(error) {
                            ErrorService.addApiError(error);
                            $scope.editor.currentDocument = "";
                            console.log("error loading " + toDocument);
                        }
                    );
                }
            },
            updateParallelText : function(n, api) {
                $scope.editor.content.links[n] = {
                    resource : api.replace("/exist/restxq/api", "")
                };

                // load the resource from the API
                return $http.get(decodeURI(api)) 
                .success(function(data) {
                    var stream = $("j\\:streamText", data);

                    // set the domain
                    $scope.editor.content.links[n].domain = stream.attr("xml:id");

                    // iterate through the streamText
                    $scope.editor.content.links[n].stream = stream.children().map(
                        function(idx, elem) {
                            var e = $(elem);
                            var isExternal = 
                                (elem.localName.toLowerCase() == "tei:ptr" && e.attr("target").split("#")[0] != ""); 

                            return {
                                id : e.attr("xml:id"),
                                name : elem.localName,
                                external : isExternal,
                                text : isExternal ? e.attr("target") : e.text().replace(/^\s*|\s(?=\s)|\s*$/g, "")
                            }
                        }
                    );
                    console.log("loaded:", $scope.editor.content.links[n].stream);
                })
                .error(function(error) {
                    ErrorService.addApiError(error);
                });
            },
            saveDocument : function() {
                console.log("Save: TBD");
            },
            newButton : function() {
                if ($location.path() == "/translations")
                    $route.reload();
                else 
                    $location.path("/translations");
            },
            saveDocument : function() {
                console.log("TBD");
            },
            moveSegment : function(linkage, segment, domain, direction) {
                var linkages = this.content.linkages;
                var linkageIdx = linkages.indexOf(linkage);
                var segmentIdx = linkages[linkageIdx][domain].indexOf(segment);
                console.log("Move segment: ", linkageIdx, segmentIdx, domain, direction);
                var oppositeDomain = (domain == "left") ? "right" : "left";
                // determine the range of segments that will move
                var firstSegmentIdx = (direction > 0) ? segmentIdx : 0;
                var lastSegmentIdx = (direction > 0) ? (linkages[linkageIdx][domain].length - 1) : segmentIdx;
                // with hashkey removal...
                var movedSegments = angular.fromJson(angular.toJson(linkages[linkageIdx][domain].splice(firstSegmentIdx, lastSegmentIdx - firstSegmentIdx + 1)));
                // determine where to put them
                if ((direction > 0 && linkageIdx == linkages.length - 1) || 
                    ((direction < 0) && linkageIdx == 0 )) {
                    // insert in a new linkage block after|before
                    var newlb = $scope.editor.newLinkageBlock();
                    newlb[domain] = movedSegments;
                    if (direction > 0) {
                        linkages.push(newlb);
                    }
                    else {
                        linkages.splice(0, 0, newlb);
                    }
                }
                else if (linkages[linkageIdx][oppositeDomain].length == 0) {
                    // insert in the next|previous existing linkage block
                    if (direction > 0) {
                        linkages[linkageIdx + direction][domain] = movedSegments.concat(linkages[linkageIdx + direction][domain]);
                    }
                    else {
                        linkages[linkageIdx + direction][domain] = linkages[linkageIdx + direction][domain].concat(movedSegments);
                    }
                }
                else {
                    // insert in a new linkage block below|above, update linkageIdx
                    var newlb = $scope.editor.newLinkageBlock();
                    var delta = (direction < 0) ? 0 : 1;
                    newlb[domain] = movedSegments;
                    linkages.splice(linkageIdx + delta, 0, newlb);
                    linkageIdx += delta; 
                }

                // if linkages[linkageIdx] is empty in both right and left side, remove it
                if (linkages[linkageIdx].left.length == 0 && linkages[linkageIdx].right.length == 0) {
                    linkages.splice(linkageIdx, 1);
                }
            }
        };

        $scope.saveButtonText = function() {
            return this.trForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        $scope.$watch("search.selection",
            function(selection) { 
                var resourceName = selection.split("/").pop();
                if (resourceName && resourceName != $scope.editor.currentDocument)
                    $location.path( "/translations/" + resourceName );
            }
        );
        

        $scope.$watch("temporary.link1", 
            function(t) {
                if (t != "") { 
                    $scope.editor.updateParallelText(0, t);
                }
            }
        );
        $scope.$watch("temporary.link2", 
            function(t) {
                if (t != "") {
                    $scope.editor.updateParallelText(1, t);
                }
            }
        );


        $scope.editor.setDocument();
    }
    ]
);
