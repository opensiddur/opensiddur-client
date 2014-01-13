/* 
 * controller for profile page 
 * Open Siddur Project
 * Copyright 2013-2014 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */


OpenSiddurClientApp.controller(
  'ProfileCtrl',
  ['$scope', '$rootScope', '$routeParams', '$http', 'AccessService', 'AuthenticationService', 'XsltService',
  function ($scope, $rootScope, $routeParams, $http, AccessService, AuthenticationService, XsltService) {
    console.log("Profile controller.");
    
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
    $scope.profileOwnership = 'unknown'; // may be 'self', 'other' or 'thirdparty'
    $scope.isNew = Number($routeParams.userName == "");
    $scope.newProfile = function() {
        $scope.userApi = "";
    }; 
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
                return jsTransformed;
            }
          })
          .success(
              function(data, status, headers, config) {
                  $scope.errorMessage = "";
                  console.log(data);
                  $scope.profile = data;
                  $scope.profileType = ($scope.profile.contributor.orgName.__text) ? 'organization' : 'individual';
                  
                  if ($scope.userApi) {
                    var splits = $scope.userApi.split("/");
                    AccessService.get($scope.userApi).then(
                        function(acc) { 
                            $scope.profileOwnership =  
                                ($scope.loggedIn && decodeURI(splits[splits.length - 1]) == $scope.loggedInUser) ?
                                    'self' : 
                                    ((acc.owner == $scope.profile.contributor.idno.__text) ? 'other' : 'thirdparty');
                            $scope.access = acc;
                            return acc; 
                        }
                    );
                    $scope.isNew = 0;
                  }
                  else {
                    $scope.profileOwnership = 'thirdparty';
                    $scope.isNew = 1;
                  }
              }
          )
          .error(
              function(data, status, headers, config) {
                $scope.errorMessage = getApiError(data)
              }
          );
        
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
                $scope.errorMessage = "";
                $scope.profileForm.$setPristine();
                if ($scope.isNew) {
                    $rootScope.$broadcast("ListBox.Append_profile",
                        [x2js.xml_str2json(
                            "<li class='result'><a class='document' href='"+headers('Location')+"'>" +
                            $( ($scope.profileType == "individual") ? ".tei-name" : ".tei-orgName", ".instance").html() +
                            "</a></li>").li
                        ]);
                }
                $scope.isNew = 0;
            }
        )
        .error(
            function(data, status, headers, config) {
              $scope.errorMessage = getApiError(data);
            }  
        );
        
    };
    $scope.saveButtonText = function() {
        return ($scope.access.write) ? (
                    this.profileForm.$pristine ? ((this.isNew) ? "Unsaved" : "Saved") : "Save")
                    : "Read-only";
    };
    
    $scope.$watch("userApi", 
        function(newUser, oldUser) { $scope.get(); }
    );
    $scope.get();
  }
  ]
);
