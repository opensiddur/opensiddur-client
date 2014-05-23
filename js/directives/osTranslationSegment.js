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
                    block : "=",
                    side : "@"
                },
                controller: ['$scope', function ($scope) {
                    var newLinkageBlock = function() { return { left : [], right : [] }; };

                    console.log("In translation segment controller");
                    $scope.otherSide = $scope.side == "left" ? "right" : "left";
                    $scope.hideBreakButton = function(item) {
                        var idx = $scope.block[$scope.side].indexOf(item);
                        var hb =
                            idx == $scope.block[$scope.side].length - 1 ||
                            (
                                $scope.block[$scope.side].length > 0 &&
                                $scope.block[$scope.side][idx].external
                            );
                        return hb;
                    };
                    $scope.hideCombineButton = function() {
                        var blockInt = $scope.model.indexOf($scope.block);
                        return (
                        blockInt >= $scope.model.length - 1 ||
                        $scope.block[$scope.side].length == 0 || 
                        $scope.block[$scope.side][0].external ||
                        (blockInt + 2 < $scope.model.length  &&
                         (
                            $scope.model[blockInt + 1][$scope.side].length > 0 &&
                            $scope.model[blockInt + 1][$scope.side][0].external)
                         ) || $scope.model[blockInt + 1][$scope.side].length == 0
                        );
                    };
                    $scope.breakAtSegment = function(item) {
                        var newlb = newLinkageBlock(); 
                        var linkages = $scope.model;
                        var linkageIdx = linkages.indexOf($scope.block);
                        var domain = $scope.side;
                        var segmentIdx = linkages[linkageIdx][domain].indexOf(item);
                        var firstSegmentIdx = segmentIdx + 1;
                        var lastSegmentIdx = linkages[linkageIdx][domain].length - 1;
                        console.log("Break at segment: ", linkageIdx, segmentIdx, domain);
                        
                        // with hashkey removal...
                        var movedSegments = angular.fromJson(angular.toJson(linkages[linkageIdx][domain].splice(firstSegmentIdx, lastSegmentIdx - firstSegmentIdx + 1)));
                        newlb[domain] = movedSegments;
                        linkages.splice(linkageIdx + 1, 0, newlb);
                    };
                    $scope.combineLinkageGroups = function() {
                        var linkages = $scope.model;
                        var linkageIdx = $scope.model.indexOf($scope.block);
                        var domain = $scope.side;
                        var oppositeDomain = (domain == "left") ? "right" : "left";
                        var firstSegmentIdx = 0;
                        var lastSegmentIdx = linkages[linkageIdx][domain].length - 1;
                        var movedSegments = angular.fromJson(angular.toJson(linkages[linkageIdx][domain].splice(firstSegmentIdx, lastSegmentIdx - firstSegmentIdx + 1)));
                        linkages[linkageIdx + 1][domain] = movedSegments.concat(linkages[linkageIdx + 1][domain]);
                        // if linkages[linkageIdx] is empty in both right and left side, remove it
                        if (linkages[linkageIdx].left.length == 0 && linkages[linkageIdx].right.length == 0) {
                            linkages.splice(linkageIdx, 1);
                        }

                    };

                    $scope.hideMoveLinkageGroupButton = function(direction) {
                        var linkages = $scope.model;
                        var linkageIdx = $scope.model.indexOf($scope.block);
                        var domain = $scope.side;
                        var oppositeDomain = (domain == "left") ? "right" : "left";
                        var isExternal = $scope.block[domain].length > 0 && $scope.block[domain][0].external
                        var oppositeDomainOccupied = linkages[linkageIdx][oppositeDomain].length > 0;
                        return (
                            ($scope.block[domain].length == 0) ||
                            (linkageIdx == 0 && direction < 0 && !oppositeDomainOccupied) ||
                            (linkageIdx == linkages.length -1 && direction > 0 && !oppositeDomainOccupied) ||
                            ( (linkageIdx + direction) >= 0 && (linkageIdx + direction) < linkages.length &&
                                !isExternal &&
                                !oppositeDomainOccupied &&
                                linkages[linkageIdx + direction][domain].length > 0
                            ) ||
                            ( (linkageIdx + direction) >= 0 && (linkageIdx + direction) < linkages.length &&
                                isExternal &&
                                linkages[linkageIdx + direction][domain].length > 0
                            )
                        );
                    };

                    $scope.moveLinkageGroup = function(direction) {
                        var linkages = $scope.model;
                        var linkageIdx = $scope.model.indexOf($scope.block);
                        var domain = $scope.side;
                        var oppositeDomain = (domain == "left") ? "right" : "left";
                        var isExternal = $scope.block[domain].length > 0 && $scope.block[domain][0].external
                        var oppositeDomainOccupied = linkages[linkageIdx][oppositeDomain].length > 0;
                        var movedSegments = angular.fromJson(angular.toJson(linkages[linkageIdx][domain].splice(0, $scope.block[domain].length)));
                        
                        if (!oppositeDomainOccupied && !isExternal) {
                            for (var delta = direction; 
                                (linkageIdx + delta) >= 0 && 
                                    (linkageIdx + delta) < linkages.length && 
                                    linkages[linkageIdx + delta][oppositeDomain].length > 0 &&
                                    linkages[linkageIdx + delta][oppositeDomain][0].external; 
                                    delta += direction);
                            linkages[linkageIdx + delta][domain] = movedSegments;
                        }
                        else {
                            var newlb = newLinkageBlock();
                            var delta = (direction < 0) ? (direction + 1) : direction;
                            if (isExternal) {
                                delta += direction;
                            }
                            newlb[domain] = movedSegments;
                            linkages.splice(linkageIdx + delta, 0, newlb);
                            linkageIdx -= (direction < 0) ? delta : 0;
                        }

                        // if linkages[linkageIdx] is empty in both right and left side, remove it
                        if (linkages[linkageIdx].left.length == 0 && linkages[linkageIdx].right.length == 0) {
                            linkages.splice(linkageIdx, 1);
                        }
                         
                    };


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


