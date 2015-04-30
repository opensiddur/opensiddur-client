/*
    API Query service

    Open Siddur Project
    Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
*/
osSearchModule.factory(
    "QueryService", [
    "$http",
    function($http) {
    var defaultParams = {
        q : "",
        start : 1,
        "max-results" : 100
    };
    return {
        query : function(api, queryParams) {
            var queryParams = $.extend(defaultParams, queryParams);
            return $http.get(api, {
                params : queryParams,
                headers : {
                    Accept : "application/xhtml+xml"
                },
                transformResponse : function( data, headers, httpStatus ) {
                    if (httpStatus >= 400 || data.match("<error"))  {
                        return data;
                    }
                    return $( $.parseXML( data ) )
                        .find( "li.result" )
                        .map( function( index, result ) {
                            var doc = $("a.document", result);
                            return {
                                title : doc.html(),
                                url : doc.attr("href"),
                                contexts : $(".context", result).map(
                                    function( cindex, context ) {
                                        return {
                                            previous : $(".previous", context).html(),
                                            match : $(".match", context).html(),
                                            following : $(".following", context).html()
                                        }
                                    }
                                )
                            };
                        });
                }
            })
        }
    };

}]);
