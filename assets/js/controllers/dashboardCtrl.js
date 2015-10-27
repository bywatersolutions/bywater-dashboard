(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller( 'dashboardCtrl', function($scope, $http) {
        function update_roles() {
            $http.get('/json/get_roles').then(
                function(response) {
                    $scope.roles = response.data.roles;
                }
            );
        }

        update_roles();

        $scope.$on('logged-in', update_roles);
        $scope.$on('logged-out', function() {
            $scope.roles = [];
        });
    });
})(angular);