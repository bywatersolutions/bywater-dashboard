(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('SearchController', function($http, $mdDialog, $log) {
        var vm = {
            progress: false,
            error: null,
            close_dialog: close_dialog,
            save_settings: save_settings,
            query: ""
        };

        /*$http.get('/json/employee/tickets')
            .then(function(response) {
                var data = response.data;

                data.columns = $.map(data.columns, function(column, id){
                    column.column_id = id;
                    column.tickets = column.tickets || [];

                    return column;
                }).sort(function(a,b){ return a.column_order - b.column_order; });

                vm.columns = data.columns;
                vm.view_id = data.view_id;
                vm.progress = false;
            })
            .catch(function(response) {
                $log.error(response);
                vm.error = 'Error get settings from server';
                vm.progress = false;
            });*/

        function close_dialog() {
            $mdDialog.cancel();
        }

        function save_settings() {
            $http.post('/json/view/save_settings', { columns: vm.columns, view_id: vm.view_id }).then(
               function(response) {
                   $log.debug( response.data );
                   $mdDialog.hide();
               }
            );
        }

        return vm;
    });
})(angular);
