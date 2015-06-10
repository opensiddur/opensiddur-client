/*
 * Truncate filter based on https://gist.github.com/dcsg/2478654
 * Original license is unknown, but this is pretty trivial code.
 */
 
/**
 * Truncate Filter
 * @Param string
 * @Param int, default = 10
 * @Param string, default = "..."
 * @return string
 */
var osTruncateModule = angular.module('osClient.truncate', []).
    filter('truncate', function () {
        return function (text, length, end) {
            length = length || 10;
            end = end || "…"; 
 
            return (text) ? 
                ((text.length <= length || text.length - end.length <= length) ?
                    text :
                    String(text).substring(0, length-end.length) + end)
                : "";
 
        };
    });
 
 
/**
 * Example - see the jsfiddle: http://jsfiddle.net/tUyyx/
 *
 * var myText = "This is an example.";
 *
 * {{myText|truncate}}
 * {{myText|truncate:5}}
 * {{myText|truncate:25:" ->"}}
 * 
 * Output
 * "This is..."
 * "Th..."
 * "This is an e ->"
 *
 */
