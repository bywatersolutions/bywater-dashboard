(function(angular) {
    'use strict';

    angular.module('dashboardApp').factory('httpInterceptor', function($q, $location, $log) {
        return {
            response: function(response) {
                if (response.data.error) {
                    alert(response.data.error);
                    return $q.reject(response);
                }

                return response;
            },
            responseError: function(response) {
                if (response.status == 401) {
                    $location.path("/login");
                } else if (response.data && response.data.error) {
                    alert(response.data.error);
                } else {
                    alert("Unknown error ocurred.");
                    $log.error(response);
                }

                return $q.reject(response);
            }
        };
    });
})(angular);