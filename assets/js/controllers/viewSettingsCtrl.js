(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('ViewSettingsController', function($http, $mdDialog, $log) {
        var vm = {
            sortable: {
                animation: 50,
                group: 'settings-columns',
                sort: true,
                handle: '.db-settings__drag-handle'
            },
            columns: [],
            view_id: null,
            showFlags: {},
            progress: true,
            error: null,
            close_dialog: close_dialog,
            save_settings: save_settings,
            delete_column: delete_column,
            add: add
        };

        $http.get('/json/employee/tickets')
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
            });

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

        function delete_column(index, $event) {
            $event.stopPropagation();

            if (confirm("Delete column '" + vm.columns[index].name + "'")) {
                vm.columns.splice(index, 1);
            }
        }

        function add() {
            vm.columns.push({ name: 'New column' });
        }

        return vm;
    });
})(angular);