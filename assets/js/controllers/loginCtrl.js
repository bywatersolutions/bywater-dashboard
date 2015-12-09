(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('loginCtrl', function($scope, $http, $timeout, $location) {
        $scope.credentials = {};
        $scope.$emit('logged-out');

        $scope.submit = function () {
            $http.post('/json/login', $scope.credentials).then(
                function(response) {
                    var data = response.data;

                    $scope.$emit('logged-in');
                    if (data.role == "lead") {
                        $location.path("/lead");
                    } else {
                        $location.path("/employee");
                    }
                }
            );
        };
    });
})(angular);