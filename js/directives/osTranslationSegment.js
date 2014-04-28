/* Translation segment
 *
 * Usage:
 * <os-translation-segment model="" block="" side="" />
 * model points to all linkages, block indexes which block this segment is
 *
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
OpenSiddurClientApp.directive(
        'osTranslationSegment',
        [
        function() {
            return {
                restrict : 'AE',
                scope : {
                    model : "=",
                    block : "@",
                    side : "@"
                },
                controller: ['$scope', function ($scope) {
                    console.log("In translation segment controller");
                    $scope.otherSide = $scope.side == "left" ? "right" : "left";

                    $scope.moveSegment = function(linkage, segment, domain, direction) {
                        var newLinkageBlock = function() { return { left : [], right : [] }; };
                        var linkages = $scope.model;
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
                            var newlb = newLinkageBlock();
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
                            var newlb = newLinkageBlock();
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

                 }],
                /*
                link: function(scope, elem, attrs, ctrl) {
                 },
                */    
                transclude : false,
                 templateUrl : "/js/directives/osTranslationSegment.html"
             };
        }
        ]
);


