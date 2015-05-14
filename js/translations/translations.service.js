/*
    Translations service
    Data model for translation documents. 
    Should extend TextService so the basic metadata functions in TextService continue to work.

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3
*/
translationsModule.factory("TranslationsService", [
    "$http", "$q", "TextService", "XsltService",  
    function($http, $q, TextService, XsltService) {
    var x2j = new X2JS({ "arrayAccessForm" : "none", emptyNodeForm : "text" });

    var loadSegmentsFrom = function(resource) {
        return $http.get("/api/data/original/" + encodeURIComponent(resource), {
                transformResponse : function(data, headers, httpStatus) {
                    if (httpStatus >= 400 || data.match("<error")) {
                        return data;
                    }
                    var segs = XsltService.transformString("/js/translations/GetSegments.xsl", data); 
                    var js = x2j.xml2json(segs).segments;
                    return (js.segment.length > 1) ? js.segment : [js.segment];
                }
            });
    };
    
    var segmentTemplate = {
        position : "", // order
        name : "",
        element : "",
        text : "", 
        target : "",
        external : null,
        inblock : 0
    };

    return {
        left : [],
        right : [],
        blocks : [],
        resource : "",
        leftResource : "",
        rightResource : "",
        translationId : function(id) {
            if (id) {
                TextService.content(
                    XsltService.transformString("/js/translations/TranslationId.set.xsl", TextService.content(), {
                        translationId : id
                    })
                );
                return this;
            }
            return $("j\\:parallelText tei\\:idno", TextService.content()).html()
        }, 
        load : function(resource) {
            var thiz = this;
            return TextService.load("/api/data/linkage", resource)
                .success(function(data) {
                    var $docXml = $.parseXML(data);
                    var $$docXml = $($docXml);
                    var linkGrp = $$docXml.find("parallelText").find("linkGrp");
                    var domains = linkGrp.attr("domains").split(/\s+/);
                    var leftDomain = decodeURIComponent(domains[0].split("#")[0].split("/").pop());
                    var rightDomain = decodeURIComponent(domains[1].split("#")[0].split("/").pop());
                    var l = thiz.setLeft(leftDomain)
                        .catch(function(err) {
                            console.log("Error loading left domain: ", err);
                        });
                    var r = thiz.setRight(rightDomain)
                        .catch(function(err) {
                            console.log("Error loading right domain: ", err);
                        });
                    thiz.blocks = [];
                    $q.all([l, r]).then(
                        function() {
                            // thiz.left has the left stream
                            // thiz.right has the right stream
                            // thiz.blocks is empty

                            var startAndEndFromTarget = function(target) {
                                var fragment = target.split("#")[1];
                                return ( 
                                    (fragment.match(/^range\(/)) ?
                                        fragment.replace(/(^range\()|(\)$)/g, "").split(",") :
                                        [fragment, fragment] );
                            };

                            leftCtr = 0;
                            rightCtr = 0;
                            linkGrp.find("link").each(
                                function(idx, link) {
                                    var targets = $(link).attr("target").split(/\s+/);
                                    var leftTarget = startAndEndFromTarget(targets[0]);
                                    var rightTarget = startAndEndFromTarget(targets[1]);
                                    var leftBlock = [];
                                    var rightBlock = [];

                                    // point leftCtr and rightCtr to the start of this linkGrp
                                    while (leftCtr < thiz.left.length && thiz.left[leftCtr].name != leftTarget[0]) {
                                        leftCtr++;
                                    }
                                    while (rightCtr < thiz.right.length && thiz.right[rightCtr].name != rightTarget[0]) {
                                        rightCtr++;
                                    }

                                    do {
                                        thiz.left[leftCtr].inblock = 1;
                                        leftBlock.push(thiz.left[leftCtr]);
                                        leftCtr++;
                                    } while (leftCtr < thiz.left.length && 
                                        thiz.left[leftCtr - 1].name != leftTarget[1]
                                        );
                                    do {
                                        thiz.right[rightCtr].inblock = 1;
                                        rightBlock.push(thiz.right[rightCtr]);
                                        rightCtr++;
                                    } while (rightCtr < thiz.right.length && 
                                        thiz.right[rightCtr - 1].name != rightTarget[1]);
                                               
                                    // push a block representing this group
                                    thiz.blocks.push([
                                        leftBlock, rightBlock
                                    ]);
                                    
                                }
                            );
                        }
                    )
                    
                }); 
        },
        loadNew : function() {
            var thiz = this;
            return $http.get("/js/translations/translations.template.xml")
                .success(function(data) {
                    TextService.setResource("/api/data/linkage", "", false);
                    TextService.content(data);
                    thiz.clearLeft();
                    thiz.clearRight();
                    thiz.blocks = [];
                });
        },
        save : function() {
            return TextService.save();
        },
        clearLeft : function() {
            this.leftResource = "";
            this.left = [];
            this.blocks = [];
        },
        setLeft : function(leftResource) {
            var thiz = this;
            return loadSegmentsFrom(leftResource)
                .then(function(response) {
                    thiz.left = response.data;
                    thiz.leftResource = leftResource;
                    thiz.blocks = [];
                });
        },
        clearRight : function() {
            this.rightResource = "";
            this.right = [];
            this.blocks = [];
        },
        setRight : function(rightResource) {
            var thiz = this;
            return loadSegmentsFrom(rightResource)
                .then(function(response) {
                    thiz.right = response.data;
                    thiz.rightResource = rightResource;
                    thiz.blocks = []
                });
        },
        canInsert : function(segment, block, fromSide) {    // fromSide = 0 for left, 1 for right
            // immediate failure modes:
            if (block < 0 || block > this.blocks.length || segment.external
                || this.left.length == 0 || this.right.length == 0) return false;
            // immediate success modes:
            if (this.blocks.length == 1 && this.blocks[block][side].length == 0) {
                // there's only 1 block, it's this one, and it's empty
                return true;
            }

            var lastPossibleSegment = (fromSide == 0) ? 
                this.left[this.left.length - 1].position : 
                this.right[this.right.length - 1].position;
            var priorOccupiedBlock = block;
            var nextOccupiedBlock = block;
            var thisBlockFirst = (this.blocks[block][side].length > 0) ? 
                this.blocks[block][side][0].position : -1;
            var thisBlockLast = (this.blocks[block][side].length > 0) ? 
                this.blocks[block][side][this.blocks[block][side].length - 1].position : 
                lastPossibleSegment + 1;
            // find the prior occupied block and the next occupied block
            while (priorOccupiedBlock > 0 && this.blocks[priorOccupiedBlock][side].length == 0) 
                priorOccupiedBlock--;
            while (nextOccupiedBlock < this.blocks.length && this.blocks[nextOccupiedBlock][side].length == 0) 
                nextOccupiedBlock++;
            var priorBlockLast = (this.blocks[priorOccupiedBlock][side].length > 0) ? 
                this.blocks[priorOccupiedBlock][side][this.blocks[priorOccupiedBlock][side].length - 1].position : 
                -1;
            var nextBlockFirst = (this.blocks[nextOccupiedBlock][side].length > 0) ? 
                this.blocks[nextOccupiedBlock][side][0].position : 
                lastPossibleSegment + 1;

            var firstInsertablePosition = Math.max([
                priorBlockLast,
                thisBlockFirst,
                0
            ]);
            var lastInsertablePosition = Math.min([
                nextBlockFirst,
                thisBlockLast,
                lastPossibleSegment
            ]);
            
            if (segment.position >= firstInsertablePosition && segment.position <= lastInsertablePosition) {
                // check that inserting this segment will not cross an external pointer
                var checkStartPosition = min([segment.position, thisBlockFirst]);
                var checkEndPosition = max([segment.position, thisBlockLast]);
                var allSegments = (side == 0) ? this.left : this.right;
                for (var i = checkStartPosition; i <= checkEndPosition; i++) {
                    if (allSegments[i].external) 
                        return false;
                }
                return true;
            }
            else return false;
        },
        insertIntoBlock : function(segment, block, fromSide) {
            if (canInsert(segment, block, fromSide)) {
                // determine what position to insert at
                var blockArray = this.blocks[block][fromSide];
                segment.inblock = 1;
                if (blockArray.length == 0) {
                    blockArray.push(segment);
                    return this;
                }
                var insertPosition = 0;
                for (var insertPosition = 0; 
                    insertPosition < blockArray.length && blockArray[insertPosition].position < segment.position; 
                    insertPosition++);
                blockArray.splice(insertPosition, 0, segment);
                return this;
            }
        },
        removeFromBlock : function(segment, block, toSide) {
            var blocksArray = this.blocks[block][toSide];
            blocksArray.splice(blocksArray.indexOf(segment), 1);
            segment.inblock = 0;
            return this;
        },
        insertEmptyBlock : function(block, beforeOrAfter) { // before or after = 0 for before, 1 for after
            var block = Math.max(Math.min(block, this.blocks.length - 1), 0);
            var newBlock = [[], []];
            this.blocks.splice(block+beforeOrAfter, 0, newBlock);
            return this;
        }
    };
}]);
