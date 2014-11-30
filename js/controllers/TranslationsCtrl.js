/* 
 * controller for translations page 
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.controller(
    'TranslationsCtrl',
    ['$scope', '$http', '$location', '$route', '$routeParams', '$q', 'AccessModelService', 'AuthenticationService', 'DialogService', 'ErrorService', 'RestApi',
     'XsltService', 
    function($scope, $http, $location, $route, $routeParams, $q, AccessModelService, AuthenticationService, DialogService, ErrorService, RestApi, XsltService) {
        console.log("translations controller");
        
        $scope.selection = "";
        $scope.DialogService = DialogService;

        $scope.temporary = {
            link1 : "",
            link2 : ""
        };
        $scope.editor = {
            loggedIn : AuthenticationService.loggedIn,
            currentDocument : $routeParams.resource,
            // TODO: this is copied verbatim from TextsCtrl... need some serious refactoring
            access : AccessModelService.default(AuthenticationService.userName),
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
                        function( error ) { 
                            ErrorService.addApiError(error.data);
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

                return linkGrp.find("link").map(
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
                var $docXml = $.parseXML(docXml)
                var $$docXml = $($docXml);
                var titleElement =  $$docXml.find("title[type=main]");
                var license = $$docXml.find("licence").attr("target");
                var idnoElement = $$docXml.find("parallelText").find("idno");
                $scope.editor.content = {
                    loaded : $docXml,
                    title : {
                        text : titleElement.html(),
                        lang : titleElement.attr("xml:lang")
                    },
                    license : license,
                    idno : idnoElement.html(),
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
                };

                var existingLinkages = this.parseParallelLinkages($$docXml.find("parallelText").find("linkGrp"));

                $q.all(
                    $$docXml.find("parallelText").find("linkGrp").attr("domains").split(/\s+/).map(
                        function(domain, idx) {
                            return $scope.editor.updateParallelText(idx, domain.split("#")[0]);
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
                    if (leftStream.length > 0 || rightStream.length > 0) {
                        linkages = linkages.concat( catchUp(leftStream[leftStream.length - 1].id, rightStream[rightStream.length - 1].id) );
                    }

                    $scope.editor.content.linkages = linkages;
                    $scope.trForm.$setPristine();
                    console.log("Both linkage documents loaded:", linkages); 
                });
            },
            newDocument : function() {
                console.log("New document");

                // default access rights for a new file
                $scope.editor.access = AccessModelService.default(AuthenticationService.userName);
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
                    RestApi["/api/data/linkage"].get({"resource" : toDocument },
                        function(data) {    // success function
                            var data = data.xml;
                            $scope.editor.access = RestApi["/api/data/linkage"].getAccess({
                                    "resource" : toDocument //decodeURI(toDocument)
                                }, function( access ) {
                                    $scope.editor.setAccessModel();
                                });
                            $scope.editor.loadDocument(data);
                            $scope.editor.isNew = 0;
                        },
                        function(error) {   // error function
                            ErrorService.addApiError(error.data.xml);
                            $scope.editor.currentDocument = "";
                            console.log("error loading " + toDocument);
                        }
                    );
                }
            },
            resetLinkageBlocks : function(domain) {
                // clear linkages from the given domain
                // if the other domain exists, reset it so it has its own, single linkage block
                $scope.editor.content.linkages = [];
                if ($scope.editor.content.links[0]["stream"]) {
                    $scope.editor.content.linkages = this.splitExternalLinkageBlocks($scope.editor.content.links[0].stream, "left");
                    
                }
                if ($scope.editor.content.links[1]["stream"]) { 
                    $scope.editor.content.linkages = $scope.editor.content.linkages.concat(this.splitExternalLinkageBlocks($scope.editor.content.links[1].stream, "right"));
                }
                console.log("Linkages after split:", $scope.editor.content.linkages);
            },
            splitExternalLinkageBlocks : function(stream, side) {
                // split the externals in all linkage blocks into their own blocks
                // really only makes sense for when a new parallel text is loaded
                var newLinkages = [];

                for (var i = 0, j = 0; i < stream.length; i++) {
                    if (stream[i].external) {
                        newLinkages.push(this.newLinkageBlock());
                        j++;
                        newLinkages[j][side] = [stream[i]];
                        j++;
                    }
                    else {
                        if (newLinkages.length <= j) {
                            newLinkages.push(this.newLinkageBlock());
                        }
                        newLinkages[j][side].push(stream[i]);
                    }
                }

                return newLinkages;
            },
            updateParallelText : function(n, api) {
                $scope.editor.content.links[n] = {
                    resource : api.replace(/^(\/exist\/restxq\/api)/, "")
                };
                
                var restapi = "/api/data/" + api.replace(/(\/exist\/restxq\/api)?\/data\//, "").split("/")[0]
                // the resource URI needs to be decoded because it is already encoded from the open dialog. It will become double-encoded otherwise
                var res = decodeURIComponent(api.split("/").pop());
                // load the resource from the API
                return res ? RestApi[restapi].get({resource : res },
                    function(data) {
                      var data = data.xml;
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
                      ).toArray();
                      console.log("loaded:", $scope.editor.content.links[n].stream);
                    },
                    function(error) {
                        ErrorService.addApiError(error.data.xml);
                    }
                ).$promise : $q.reject("No resource loaded");
            },
            saveDocument : function() {
                // convert scope.editor.content.linkages to XML
                var leftDomain = $scope.editor.content.links[0].resource;
                var rightDomain = $scope.editor.content.links[1].resource;
                var blockToTarget = function(block, domain) {
                    return domain+"#"+(
                        (block.length == 1) ? 
                            block[0].id : 
                            ("range("+block[0].id+","+block[block.length - 1].id+")"));
                };
                var linkageXml = ""+ 
                    $scope.editor.content.linkages.filter(
                        function(linkageBlock) {
                            return (
                                (linkageBlock.left.length > 0 && linkageBlock.right.length > 0) &&
                                !(linkageBlock.left[0].isExternal || linkageBlock.right[0].isExternal) 
                                );
                        }
                    ).map(function(linkageBlock) {
                            var targets = blockToTarget(linkageBlock.left, leftDomain) + " " + blockToTarget(linkageBlock.right, rightDomain);
                            return "<tei:link target=\""+ targets +"\"/>";
                        }
                    ).join("\n");

                // title
                var $doc = $($scope.editor.content.loaded);
                var docTitle = ($scope.editor.content.title.text == "") ? 
                    { "text" : "Linkage of " + decodeURI($scope.editor.content.links[0].resource.split("/").pop()) + " and " + decodeURI($scope.editor.content.links[1].resource.split("/").pop()),
                      "lang" : "en" } :
                    $scope.editor.content.title ;
                $doc.find("title[type=main]").replaceWith("<tei:title type=\"main\" xml:lang=\""+docTitle.lang+"\">"+docTitle.text+"</tei:title>");
                // license
                $doc.find("licence").attr("target", $scope.editor.content.license);
                // idno
                $doc.find("parallelText").find("idno").replaceWith("<tei:idno>"+$scope.editor.content.idno+"</tei:idno>");                

                // domains
                $doc.find("parallelText").find("linkGrp").attr("domains", $scope.editor.content.links.map(function(x) {return x.resource+"#"+x.domain;} ).join(" "));

                var newContent = XsltService.serializeToString( 
                    $doc.find("parallelText").find("linkGrp").html(linkageXml).parent().parent().parent() // tei:TEI
                    .parent()[0]        // document node
                );
                
                console.log("Saving:", newContent);
                
                // save operation
                var httpOperation = (this.isNew) ? 
                    RestApi["/api/data/linkage"].post : 
                    RestApi["/api/data/linkage"].put;
                var resource = (this.isNew) ? "" : $scope.editor.currentDocument;
                httpOperation({"resource" : resource}, newContent,
                    function(data, headers) {
                        $scope.trForm.$setPristine();
                        if ($scope.editor.isNew) {
                            $scope.editor.isNew = 0;
                            $scope.editor.currentDocument=decodeURI(headers('Location').replace("/exist/restxq/api/data/linkage/", ""));
                            // save the access model for the new document
                            $scope.editor.saveAccessModel();
                        };
                        // reload the document to get the change log in there correctly
                        // add a 1s delay to allow the server some processing time before reload
                        setTimeout(
                            function() { 
                                $scope.editor.setDocument(); 
                            }, 1000
                        );
                    },
                    function(error) {
                        ErrorService.addApiError(error.data.xml);
                        console.log("error saving ", resource);
                    }
                );

            },
            newButton : function() {
                if ($location.path() == "/translations")
                    $route.reload();
                else 
                    $location.path("/translations");
            }
        };

        $scope.saveButtonText = function() {
            return this.trForm.$pristine ? (($scope.editor.isNew) ? "Unsaved, No changes" : "Saved" ) : "Save";
        };

        var selectionWatchCtr = 0;
        $scope.$watch("selection",
            function(selection) { 
                if (!selectionWatchCtr) {
                    selectionWatchCtr++;
                }
                else {
                    var resourceName = decodeURIComponent(selection.split("/").pop());
                    if (resourceName && resourceName != $scope.editor.currentDocument)
                        $location.path( "/translations/" + resourceName );
                }
            }
        );
        

        $scope.$watch("temporary.link1", 
            function(t) {
                if (t != "") {
                    $scope.editor.updateParallelText(0, t)
                    .then( function () {
                        $scope.editor.resetLinkageBlocks(); 
                    } );
                }
            }
        );
        $scope.$watch("temporary.link2", 
            function(t) {
                if (t != "") {
                    $scope.editor.updateParallelText(1, t)
                    .then( function () {
                        $scope.editor.resetLinkageBlocks();
                    } ); 
                }
            }
        );

        $scope.$watch("editor.content.linkages", function(newVal, oldVal) {
            if (newVal == oldVal || oldVal.length == 0) {  
                // skip the watch before data is loaded
                return; 
            }
            $scope.trForm.$setDirty();
        }, true );

        $scope.editor.setDocument();
    }
    ]
);
