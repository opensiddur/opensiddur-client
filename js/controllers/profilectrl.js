/* 
 * controller for profile page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */


OpenSiddurClientApp.controller(
  'ProfileCtrl',
  ['$scope', '$routeParams', '$http', /*'AccessService',*/ 'AuthenticationService', 'XsltService',
  function ($scope, $routeParams, $http, /*AccessService,*/ AuthenticationService, XsltService) {
    console.log("Profile controller.")
    
    $scope.errorMessage = "";
    $scope.access = {
        read : true,
        write : true,
        chmod : true
    };
    $scope.loggedIn = AuthenticationService.loggedIn;
    $scope.loggedInUser = AuthenticationService.userName;
    $scope.userName = $routeParams.userName;    
    $scope.userApi = $scope.userName ? ("/api/user/" + $scope.userName) : "";
    $scope.profileType = 'unknown'; // may be 'self', 'other' or 'thirdparty'
    $scope.isNew = $routeParams.userName == "";
    $scope.get = function () {
        $http.get(
          host + (this.userApi) ? this.userApi : "/templates/contributor.xml",
          {
            transformResponse: function(data, headers) {
                console.log(data);
                xsltTransformed = XsltService.transformString('profileFormTemplate', data);
                console.log(xsltTransformed);
                jsTransformed = x2js.xml2json(xsltTransformed);
                console.log(jsTransformed);
                if ($scope.userApi) {
                    var splits = $scope.userApi.split("/")
                    $scope.profileType =  
                        ($scope.loggedIn && decodeURI(splits[splits.length - 1]) == $scope.loggedInUser) ?
                            'self' : 'thirdparty';
                }
                else {
                    $scope.profileType = 'thirdparty';
                }
                return jsTransformed;
            }
          })
          .success(
              function(data, status, headers, config) {
                  $scope.errorMessage = "";
                  console.log(data);
                  $scope.profile = data;
                  $scope.profileType = ($scope.profile.contributor.orgName.length > 0) ? 'organization' : 'individual';
              }
          )
          .error(
              function(data, status, headers, config) {
                $scope.errorMessage = getApiError(data)
              }
          );
        
    };
    $scope.save = function () {       
        $http.put(host + "/api/user/" + this.userName,
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
                $scope.errorMessage = "";
                $scope.profileForm.$setPristine();
            }
        )
        .error(
            function(data, status, headers, config) {
              $scope.errorMessage = getApiError(data);
            }  
        );
        
    };
    $scope.saveButtonText = function() {
        return this.profileForm.$pristine ? "Saved" : "Save";
    };
    
    $scope.$watch("userApi", 
        function(newUser, oldUser) { $scope.get(); }
    );
    $scope.get();
  }
  ]
);
