/* 
 * controller for profile page 
 *
 * This page has a lot of state:
 * If it's started as /contributors/:userName, it's in thirdparty mode and will have a search bar and new buttons
 * If it's started as /profile/:userName, it's in self mode and will not allow the userName to be changed
 *
 * If no username is provided, profile ownership is thirdparty and the profile is new.
 * If no username is provided, and not logged in, profile ownership is nobody (no editing is possible).
 * If the userName and the logged in name are the same, profile ownership is self.
 * If they are different and there is no write access, profile ownership is other.
 * If they are different and there is write access, profile ownership is thirdparty
 *
 * Open Siddur Project
 * Copyright 2013-2015 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */


osProfileModule.controller(
  'ProfileCtrl',
  ['$scope', '$location', '$rootScope', '$routeParams', '$http',  
   'AccessService', 'AuthenticationService', 'DialogService', 'ErrorService', 'ProfileService',
  function ($scope, $location, $rootScope, $routeParams, $http, 
    AccessService, AuthenticationService, DialogService, ErrorService, ProfileService) {
    console.log("Profile controller.");
    
    $scope.DialogService = DialogService;
    $scope.AccessService = AccessService;
    AccessService.reset();
    $scope.ProfileService = ProfileService;

    $scope.loggedIn = AuthenticationService.loggedIn;
    $scope.loggedInUser = AuthenticationService.userName;

    $scope.mode = ($location.path().indexOf("/contributors")==0 ? "thirdparty" : "self");
    $scope.exists = false;

    var get = function ( ) {  
        // HTTP interaction with the API
        var userName = $routeParams.userName;    
        $scope.isNew = !userName; 
        var requestData =  ($scope.isNew) ? 
            ProfileService.loadNew() :
            ProfileService.load(userName);
        requestData.then(
              function(data) {
                  console.log(data);
                  
                  if (ProfileService.userName) {
                    AccessService.load("/api/user", ProfileService.userName)
                    .then(function(acc) {
                        $scope.ownership =  
                            ($scope.loggedIn && ProfileService.userName == $scope.loggedInUser) ?
                                'self' : 
                                ((acc.owner == ProfileService.profile.contributor.idno.__text) ? 'other' : 'thirdparty');
    
                    },
                    function (err) {
                        ErrorService.addApiError(err);
                    });

                    $scope.isNew = 0;
                  }
                  else {
                    $scope.ownership = ($scope.loggedIn) ? 'thirdparty' : 'nobody';
                    $scope.isNew = 1;
                  }
              },
              function(error) {
                    ErrorService.addApiError(error);
              }
          );
        
    };

    $scope.dialogCancel = function() {};
    // load a profile or start a new one
    $scope.openDocument = function(selection) {
        $location.path( "/contributors/" + decodeURIComponent(selection.split("/").pop()) );
        return true; 
    };
    $scope.newProfile = function() {
        $location.path( "/contributors" );    
    };


    $scope.checkExistence = function(userName) {
        if ($scope.isNew) {
            ProfileService.exists(userName)
            .then(function(doesExist) { $scope.exists = doesExist; });
        }
        else $scope.exists = false;
    };

    $scope.save = function () {
        if ($scope.isNew && $scope.exists) {
            ErrorService.addAlert("The username already exists", "error");
            return;
        } 
        ProfileService.save()
        .then(
            function(data) {
                $scope.profileForm.$setPristine();
                $scope.isNew = 0;
                $location.path("/contributors/" + encodeURIComponent(ProfileService.userName), false);
            },
            function(error) {
              ErrorService.addApiError(error);
            }
        );
        
    };
    $scope.saveButtonText = function() {
        return (AccessService.access.write) ? (
                    this.profileForm.$pristine ? ((this.isNew) ? "Unsaved" : "Saved") : "Save")
                    : "Read-only";
    };
    
    get();
  }
  ]
);
