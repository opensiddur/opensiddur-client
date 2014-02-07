/* 
 * controller for profile page 
 *
 * This page has a lot of state:
 * If it's started as /contributors/:userName, it's in thirdparty mode and will have a search bar and new buttons
 * If it's started as /profile/:userName, it's in self mode and will not allow the userName to be changed
 *
 * If no username is provided, profile ownership is thirdparty and the profile is new.
 * If the userName and the logged in name are the same, profile ownership is self.
 * If they are different and there is no write access, profile ownership is other.
 * If they are different and there is write access, profile ownership is thirdparty
 *
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */


OpenSiddurClientApp.controller(
  'ProfileCtrl',
  ['$scope', '$location', '$rootScope', '$routeParams', '$http', 'AuthenticationService', 'ErrorService', 'IndexService', 'RestApi', 'XsltService',
  function ($scope, $location, $rootScope, $routeParams, $http, AuthenticationService, ErrorService, IndexService, RestApi, XsltService) {
    console.log("Profile controller.");
    

    $scope.userName = $routeParams.userName;    
    $scope.loggedIn = AuthenticationService.loggedIn;
    $scope.loggedInUser = AuthenticationService.userName;

    $scope.mode = ($location.path().indexOf("/contributors")==0 ? "thirdparty" : "self");
    $scope.isNew = !$scope.userName; 

    $scope.search = IndexService.search;

    $scope.access = {
        read : true,
        write : true,
        chmod : true
    };
    
    // set up the index service
    if ($scope.mode == "thirdparty") {
        IndexService.search.enable( "/api/user" );
    }
    else {
        IndexService.search.disable();
    }

   
    $scope.get = function ( ) {  
        // HTTP interaction with the API
        // TODO: use a RestApi service 
        $http.get(
          host + ((this.isNew) ? "/templates/contributor.xml" : ("/api/user/" + this.userName)),
          {
            transformResponse: function(data, headers) {
                console.log(data);
                xsltTransformed = XsltService.transformString('profileFormTemplate', data);
                console.log(xsltTransformed);
                jsTransformed = x2js.xml2json(xsltTransformed);
                console.log(jsTransformed);
                return jsTransformed;
            }
          })
          .success(
              function(data, status, headers, config) {
                  console.log(data);
                  $scope.profile = data;
                  $scope.profileType = ($scope.profile.contributor.orgName.__text) ? 'organization' : 'individual';
                  
                  if ($scope.userName) {
                    $scope.access = RestApi["/api/user"].getAccess({
                        resource : $scope.userName
                    }, function ( acc ) {
                        $scope.ownership =  
                            ($scope.loggedIn && $scope.userName == $scope.loggedInUser) ?
                                'self' : 
                                ((acc.owner == $scope.profile.contributor.idno.__text) ? 'other' : 'thirdparty');
    
                    });

                    $scope.isNew = 0;
                  }
                  else {
                    $scope.ownership = 'thirdparty';
                    $scope.isNew = 1;
                  }
              }
          )
          .error(
              function(data, status, headers, config) {
                ErrorService.addApiError(data)
              }
          );
        
    };

    // load a profile or start a new one
    $scope.$watch("search.selection", function ( selection ) {
        if (selection) {
            $location.path( "/contributors/" + selection.split("/").pop() ); 
        }
    });
    $scope.newProfile = function() {
        $location.path( "/contributors" );    
    };


    $scope.save = function () {       
        $http.put(host + "/api/user/" + ((this.userName) ? this.userName : this.profile.contributor.idno.__text),
            $(".instance").html(),
            {
                transformRequest: function (data, headerGetters) {
                    var formTei = XsltService.transformString('htmlToTei', data);
                    var formCleaned = XsltService.transform('cleanupForm', formTei); 
                    return formCleaned;
                }
            }
        )
        .success(
            function(data, status, headers, config) {
                $scope.profileForm.$setPristine();
                if ($scope.isNew) {
                    IndexService.search.addResult({
                        title:  $( ($scope.profileType == "individual") ? ".tei-name" : ".tei-orgName", ".instance").html(), 
                        url : headers('Location'),
                        contexts : []
                    });
                }
                $scope.isNew = 0;
                $scope.userName = headers("Location").split("/").pop();
            }
        )
        .error(
            function(data, status, headers, config) {
              ErrorService.addApiError(data);
            }  
        );
        
    };
    $scope.saveButtonText = function() {
        return ($scope.access.write) ? (
                    this.profileForm.$pristine ? ((this.isNew) ? "Unsaved" : "Saved") : "Save")
                    : "Read-only";
    };
    
    $scope.get();
  }
  ]
);
