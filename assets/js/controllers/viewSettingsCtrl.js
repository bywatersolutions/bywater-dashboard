(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('viewSettingsCtrl', function($scope, $http, $mdDialog, $log) {
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

        $scope.move = function( is_move_up, index ) {
          var new_index = is_move_up ? index + 1 : index - 1;
          if ( new_index >= $scope.columns.length || new_index <= 0 ) return;

          $scope.columns.splice( index + 1 , 0, $scope.columns.splice(index, 1)[0]);
        }

        $scope.delete = function( index ) {
          $scope.columns.splice(index, 1);
        }

        $scope.add = function () {
          $scope.columns.push({});
        }
    });
})(angular);