/* 
 * controller for profile page 
 * Open Siddur Project
 * Copyright 2013 Efraim Feinstein <efraim@opensiddur.org>
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */


OpenSiddurClientApp.controller(
  'ProfileCtrl',
  ['$scope', '$routeParams', '$http', 'XsltService',
  function ($scope, $routeParams, $http, XsltService) {
    console.log("Profile controller.")
    
    $scope.errorMessage = "";
    $scope.userName = $routeParams.userName;
    $scope.get = function () {
        $http.get(
          host + "/api/user/" + this.userName,
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
    
    $scope.get();
  }
  ]
);
