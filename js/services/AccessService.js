/* Access get/set on resources
 * 
 * Open Siddur Project
 * Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or above
 */
OpenSiddurClientApp.service( 
    'AccessService', 
    ["$http", "AuthenticationService",
    function( $http, AuthenticationService ) {
        var getDefaultAccess =  function() {
            // default access model, dependent on login state (userName == "" or undefined for not logged in)
            var userName = AuthenticationService.userName;
            return {
                owner : userName,
                group : "everyone",
                groupWrite : Boolean(userName),
                worldRead : true,
                worldWrite : false,
                read : true,
                write : Boolean(userName),
                relicense : Boolean(userName),
                chmod : Boolean(userName),
                grantGroups : [],
                grantUsers :[],
                denyGroups : [],
                denyUsers : []

            } 
        };
        return {
            _resource : "",
            _resourceApi : "",
            access : getDefaultAccess(),        // data
            "default" : getDefaultAccess,
            reset : function() {
                // reset to default
                this.access = getDefaultAccess();
                this.setResource("", "");
                return this;
            },
            setResource : function(resourceApi, resource) { // set resource (new)
                this._resourceApi = resourceApi;
                this._resource = resource;
                return this;
            },
            load : function(resourceApi, resource) {
                var thiz = this;
                return $http.get(resourceApi + "/" + encodeURIComponent(resource) + "/access", {
                    transformResponse : function( data, hdr, httpStatus ) {
                        if (httpStatus >= 300) {
                            return data;
                        }
                        var acc = $(data);
                        var you = acc.find("a\\:you");
                        var aclToJs = 
                            function ( cindex, context, attribute ) {
                                var c = $(context);
                                var name = c.text();
                                var permission = c.attr(attribute);
                                return {
                                    "group" : name,
                                    "value" : permission 
                                };
                            };
                        var aclToJsW = function (cindex, context) { return aclToJs( cindex, context, "write"); }
                        var aclToJsR = function (cindex, context) { return aclToJs( cindex, context, "read"); }
                        var flatten = function ( arrayOfObjects ) {
                            var obj = {};
                            for (var i = 0; i < arrayOfObjects.length; i++) {
                                obj[arrayOfObjects[i].group] = arrayOfObjects[i].value;
                            }
                            return obj;
                        };
                        return {
                            owner : acc.find("a\\:owner").text(),
                            group : acc.find("a\\:group").text(),
                            groupWrite : acc.find("a\\:group").attr("write") == "true",
                            worldRead : acc.find("a\\:world").attr("read") == "true",
                            worldWrite : acc.find("a\\:world").attr("write") == "true",
                            read : you.attr("read") == "true",
                            write : you.attr("write") == "true",
                            relicense : you.attr("relicense") == "true",
                            chmod : you.attr("chmod") == "true",
                            grantGroups : flatten(acc.find("a\\:grant-group").map(aclToJsW)),
                            grantUsers : flatten(acc.find("a\\:grant-user").map(aclToJsW)),
                            denyGroups : flatten(acc.find("a\\:deny-group").map(aclToJsR)),
                            denyUsers : flatten(acc.find("a\\:deny-user").map(aclToJsR))
                        };
                    }
                })
                .success(function(data) {
                    thiz._resourceApi = resourceApi;
                    thiz._resource = resource;
                    thiz.access = data;
                    return thiz;
                });
            },
            save : function() {
                var thiz = this;
                return $http.put(this._resourceApi + "/" + encodeURIComponent(this._resource) + "/access", 
                    this.access, {
                    requestType : "xml", 
                    transformRequest : function( acc ) {
                        var grantGroups =
                            (acc.grantGroups) ? 
                                $.map(acc.grantGroups, function ( i, group ) {
                                    return "<a:grant-group write='"+acc.grantGroups[group]+"'>"+group+"</a:grant-group>";
                                }).join("") : "";
                        var grantUsers = 
                            (acc.grantUsers) ? 
                                $.map(acc.grantUsers, function ( i, user ) {
                                    return "<a:grant-user write='"+acc.grantUsers[user]+"'>"+user+"</a:grant-user>";
                                }).join("") : "";
                        var denyGroups =
                            (acc.denyGroups) ? 
                                $.map(acc.denyGroups, function ( i, group ) {
                                    return "<a:deny-group read='"+acc.denyGroups[group]+"'>"+group+"</a:deny-group>";
                                }).join("") : "";
                        var denyUsers =
                            (acc.denyUsers) ? 
                                $.map(acc.denyUsers, function ( i, user ) {
                                    return "<a:deny-user read='"+acc.denyUsers[user]+"'>"+user+"</a:deny-user>";
                                }).join("") : "";
                        var grants = 
                            (grantGroups || grantUsers) ?
                                "<a:grant>"+ grantGroups + grantUsers + "</a:grant>" :
                                "";
                        var denies = 
                            (denyGroups || denyUsers) ?
                                "<a:deny>"+ denyGroups + denyUsers + "</a:deny>" :
                                "";
                        return (
                            "<a:access xmlns:a='http://jewishliturgy.org/ns/access/1.0'>" +
                                "<a:owner>" + acc.owner + "</a:owner>" +
                                "<a:group write='"+ acc.groupWrite +"'>" + acc.group + "</a:group>" +
                                "<a:world read='"+ acc.worldRead + "' write='" + acc.worldWrite + "'/>" + 
                                grants +
                                denies +
                            "</a:access>"
                        );
                    }
                });
            },
            simpleAccessModel : function(newModel) {
                // newModel should be one of "public" or "restricted"
                if (newModel) {
                    if (newModel == "public") {
                        this.access.groupWrite = true;
                        this.access.group = "everyone";
                    }
                    else {  // restricted
                        this.access.groupWrite = false;
                        this.access.group = "everyone";
                    }
                    return this;
                }
                
                return (this.access.group == "everyone" && this.access.groupWrite) ? "public" : "restricted";
            }
        };
    }
    ]
);



