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

    var loadSegmentsFrom = function(resource, side) {
        return $http.get("/api/data/original/" + encodeURIComponent(resource), {
                transformResponse : function(data, headers, httpStatus) {
                    if (httpStatus >= 400 || data.match("<error")) {
                        return data;
                    }
                    var segs = XsltService.transformString("/js/translations/GetSegments.xsl", data, {
                        side : String(side)
                    }); 
                    var js = x2j.xml2json(segs).segments;
                    return ((js.segment.length > 1) ? js.segment : [js.segment])
                        .map(function(x) {
                            x.position = parseInt(x.position);
                            x.side = parseInt(x.side);
                            x.external = parseInt(x.external); 
                            return x;
                        });
                }
            });
    };
    
    var segmentTemplate = {
        position : "", // order
        side : 0,
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
        resetBlocks : function() {
            $.each(this.left, function(i, x) { x.inblock = 0; });
            $.each(this.right, function(i, x) { x.inblock = 0; });
            this.blocks = [];
        },
        clearLeft : function() {
            this.leftResource = "";
            this.left = [];
            this.resetBlocks();
        },
        setLeft : function(leftResource) {
            var thiz = this;
            return loadSegmentsFrom(leftResource, 0)
                .then(function(response) {
                    thiz.left = response.data;
                    thiz.leftResource = leftResource;
                    thiz.resetBlocks();
                });
        },
        clearRight : function() {
            this.rightResource = "";
            this.right = [];
            this.resetBlocks();
        },
        setRight : function(rightResource) {
            var thiz = this;
            return loadSegmentsFrom(rightResource, 1)
                .then(function(response) {
                    thiz.right = response.data;
                    thiz.rightResource = rightResource;
                    thiz.resetBlocks();
                });
        },
        canInsert : function(segment, block) { 
            // immediate failure modes:
            var fromSide = segment.side;
            var blockIndex = this.blocks.indexOf(block);
            if (segment.external
                || this.left.length == 0 || this.right.length == 0
                || segment.inblock > 0) return false;
            // immediate success modes:
            if (this.blocks.length == 1 && block[fromSide].length == 0) {
                // there's only 1 block, it's this one, and it's empty
                return true;
            }

            var lastPossibleSegment = (fromSide == 0) ? 
                this.left[this.left.length - 1].position : 
                this.right[this.right.length - 1].position;
            var thisBlockFirst = (block[fromSide].length > 0) ? 
                block[fromSide][0].position : null;
            var thisBlockLast = (block[fromSide].length > 0) ? 
                block[fromSide][block[fromSide].length - 1].position : 
                null;
            // find the prior occupied block and the next occupied block
            var priorOccupiedBlock = blockIndex - 1;
            var nextOccupiedBlock = blockIndex + 1;
            while (priorOccupiedBlock > 0 && this.blocks[priorOccupiedBlock][fromSide].length == 0) 
                priorOccupiedBlock--;
            while (nextOccupiedBlock < this.blocks.length && this.blocks[nextOccupiedBlock][fromSide].length == 0) 
                nextOccupiedBlock++;
            var priorBlockLast = (
                priorOccupiedBlock >= 0 &&
                priorOccupiedBlock < blockIndex && 
                this.blocks[priorOccupiedBlock][fromSide].length > 0) ? 
                this.blocks[priorOccupiedBlock][fromSide][this.blocks[priorOccupiedBlock][fromSide].length - 1].position : 
                null;
            var nextBlockFirst = (
                nextOccupiedBlock < this.blocks.length && 
                nextOccupiedBlock > blockIndex && this.blocks[nextOccupiedBlock][fromSide].length > 0) ? 
                this.blocks[nextOccupiedBlock][fromSide][0].position : 
                null;

            var firstInsertablePosition = (
                priorBlockLast ||
                0
            );
            var lastInsertablePosition = (
                nextBlockFirst ||
                lastPossibleSegment
            );
            
            if (segment.position >= firstInsertablePosition && segment.position <= lastInsertablePosition) {
                // check that inserting this segment will not cross an external pointer
                var checkStartPosition = Math.min(segment.position, thisBlockFirst);
                var checkEndPosition = Math.max(segment.position, thisBlockLast);
                var allSegments = (fromSide == 0) ? this.left : this.right;
                for (var i = checkStartPosition; i <= checkEndPosition; i++) {
                    if (allSegments[i].external) 
                        return false;
                }
                return true;
            }
            else return false;
        },
        insertIntoBlock : function(segment, block) {
            var fromSide = segment.side;
            if (this.canInsert(segment, block)) {
                // determine what position to insert at
                var blockArray = block[fromSide];
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
        removeFromBlock : function(segment, block) {
            var toSide = segment.side;
            var blocksArray = block[toSide];
            blocksArray.splice(blocksArray.indexOf(segment), 1);
            segment.inblock = 0;
            return this;
        },
        insertEmptyBlock : function(block, beforeOrAfter) { // before or after = 0 for before, 1 for after
            if (this.blocks.length == 0) {
                this.blocks = [[[], []]];
                return this;
            }
            var blockIndex = this.blocks.indexOf(block);
            var newBlock = [[], []];
            this.blocks.splice(blockIndex+beforeOrAfter, 0, newBlock);
            return this;
        },
        removeBlock : function(block) { // remove an existing block
            var blockIndex = this.blocks.indexOf(block);
            for (var side = 0; side <= 1; side++) {
                for (var i = 0; i < block[side].length; i++) {
                    block[side][i].inblock = 0;
                }
            }
            this.blocks.splice(blockIndex, 1);
            return this;
        }
    };
}]);
