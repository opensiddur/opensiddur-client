/*
    Profile service

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later  
*/
osProfileModule.factory("ProfileService", [
    "$http", "$q", "XsltService", 
    function($http, $q, XsltService) {
    
    var transformResponse = function(data, headers, httpStatus) {
        console.log(data);
        if (httpStatus >= 400 || data.match("<error")) {
            return data;
        }
        xsltTransformed = XsltService.transformString('/js/profile/ProfileForm.template.xsl', data);
        console.log(xsltTransformed);
        jsTransformed = x2js.xml2json(xsltTransformed);
        console.log(jsTransformed);
        return jsTransformed;
    };

    var loadData = function(thiz, template, userName) {
        return $http.get(template,
            { transformResponse : transformResponse })
            .then(
                function(response) {
                    var data = response.data;
                    thiz.userName = userName;
                    thiz.profile = data;
                    thiz.profileType = (thiz.profile.contributor.orgName.__text) ? 'organization' : 'individual';
                    return data; 
                },
                function(error) { 
                    return $q.reject(error.data); 
                });
    };

    return {
        userName : "",  // stores the currently active userName
        profile : {},   // JSON representation of a profile
        exists : function(userName) {
            // return (a promise of) true if the userName exists, false otherwise
            return $http.get("/api/user/" + userName)
            .then(
                function(response) { return true; },
                function(response) {
                    if (response.status == 404) return false;
                    else return true;
                }
            )
        },
        loadNew : function() {
            // load a new profile
            var thiz = this;
            return loadData(this, "/templates/contributor.xml", "");
        },
        load : function(userName) {
            // load a profile with this user name
            return loadData(this, "/api/user/" + userName, userName);
        },
        save : function() {
            // save the current profile
            var thiz = this;
            var userName = this.userName || this.profile.contributor.idno.__text;
            return $http.put("/api/user/" + userName,  
                // x2js can't be used because we need to maintain the order
                "<j:contributor xmlns:tei='http://www.tei-c.org/ns/1.0' xmlns:j='http://jewishliturgy.org/ns/jlptei/1.0' xml:lang='" + (this.profile.contributor._lang || "") + "'>" + 
                    "<tei:idno>" + (this.profile.contributor.idno.__text || "") + "</tei:idno>" +
                    "<tei:name>" + (this.profile.contributor.name.__text || "") + "</tei:name>" +
                    "<tei:orgName>" + (this.profile.contributor.orgName.__text || "") + "</tei:orgName>" +
                    "<tei:email>" + (this.profile.contributor.email.__text || "") + "</tei:email>" +
                    "<tei:address>" +
                        this.profile.contributor.address.addrLine.map(function(al) { 
                            return "<tei:addrLine>" + (al.__text || "") + "</tei:addrLine>"; }).join("") +
                    "</tei:address>" +
                    "<tei:affiliation>" +
                        "<tei:orgName>" + (this.profile.contributor.affiliation.orgName.__text || "") + "</tei:orgName>" +
                        "<tei:address>" +
                            this.profile.contributor.affiliation.address.addrLine.map(function(al) { 
                                return "<tei:addrLine>" + (al.__text || "") + "</tei:addrLine>"; }).join("") +
                        "</tei:address>" +
                    "</tei:affiliation>" +
                    "<tei:ptr type='url' target='" + (this.profile.contributor.ptr._target || "") + "'/>" +
                "</j:contributor>",
                {
                    transformRequest : function(data, header) {
                        var formCleaned = XsltService.transformString("/js/profile/CleanupForm.xsl" , data);
                        return XsltService.serializeToStringTEINSClean(formCleaned);
                    },
                    headers : { "Content-type" : "application/xml" } 
                }
                )
            .then( function(response) {
                var data = response.data;
                if (!thiz.userName) {
                    thiz.userName = decodeURI(response.headers("Location").split("/").pop());
                }
                return data;
            },
            function (error) { 
                return $q.reject(error.data); 
            });
                    
        }
    };
}]);
