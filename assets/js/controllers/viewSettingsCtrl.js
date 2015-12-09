(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('viewSettingsCtrl', function($scope, $http, $mdDialog, $log, columns, view_id) {
        $scope.columns = columns;
        $scope.view_id = view_id;
        $scope.showFlags = {};

        $scope.close_dialog = function () {
            $mdDialog.cancel();
        };

        $scope.save_settings = function() {
            var columns = $scope.columns;
            $http.post('/json/view/save_settings', { columns: columns, view_id: $scope.view_id }).then(
               function(response) {
                   $log.debug( response.data );
                   $mdDialog.hide();
               }
            );
        };

        $scope.sortable = {
            animation: 50,
            group: 'settings-columns',
            sort: true,
            handle: '.db-settings__drag-handle'
        };

        /*
        $scope.move = function( is_move_up, index ) {
            var new_index = is_move_up ? index + 1 : index - 1;
            if (
                (is_move_up && new_index >= $scope.columns.length) ||
                (!is_move_up && new_index < 0)
            ) {
                return;
            }

            $log.debug('down', new_index);

            $scope.columns.splice(new_index, 0, $scope.columns.splice(index, 1)[0]);
        };
        */

        $scope.delete = function( index, $event ) {
            $event.stopPropagation();

            if (confirm("Delete column '" + $scope.columns[index].name + "'")) {
                $scope.columns.splice(index, 1);
            }
        };

        $scope.add = function () {
          $scope.columns.push({ name: 'New column' });
        };
    });
})(angular);