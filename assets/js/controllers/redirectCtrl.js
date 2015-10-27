(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('redirectCtrl', function($scope, $http, $location) {
        // This causes a double-GET. Minor, but solvable?
        $http.get('/json/get_roles').then(
            function (response) {
                var data = response.data,
                    role = data.roles[0]; // Just grab the first role for now

                if (role == "lead") {
                    $location.path("/lead");
                } else {
                    $location.path("/employee");
                }
            }
        );
    });
})(angular);