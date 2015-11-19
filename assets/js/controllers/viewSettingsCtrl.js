(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('viewSettingsCtrl', function($scope, $http, $mdDialog) {
        $scope.close_dialog = function () {
            $mdDialog.hide();
        };
    });
})(angular);