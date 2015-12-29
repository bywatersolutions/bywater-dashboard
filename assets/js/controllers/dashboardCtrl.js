(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller( 'DashboardController', function($scope, $http, $mdDialog, $log) {
        var vm = {
            show_settings: show_settings,
            check_role: check_role,
            roles: []
        };

        function update_roles() {
            $http.get('/json/get_roles').then(
                function(response) {
                    vm.roles = response.data.roles;
                }
            );
        }

        update_roles();

        $scope.$on('logged-in', update_roles);
        $scope.$on('logged-out', function() {
            vm.roles = [];
        });

        function show_settings() {
            $mdDialog.show({
                controller: 'ViewSettingsController',
                controllerAs: 'settings',
                parent: 'body',
                templateUrl: 'partials/view-settings-popup.html'
            }).then(function(){
                $log.debug("View settings dialog promise resolved");
                $scope.$broadcast("settingsUpdated", {});
            });
        }

        function check_role(role) {
            return vm.roles.indexOf(role) > -1;
        }

        return vm;
    });
})(angular);