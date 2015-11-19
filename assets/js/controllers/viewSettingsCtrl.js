(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('viewSettingsCtrl', function($scope, $http, $mdDialog, $log) {
        $scope.close_dialog = function () {
            $mdDialog.cancel();
        };

        $scope.save_settings = function() {
            var columns = angular.merge([], $scope.columns);
            $http.post('/json/view/save_settings', { columns: columns, view_id: $scope.view_id }).then(
               function(response) {
                   $log.debug( response.data );
                   $mdDialog.hide();
               }
            );
        };
    });
})(angular);