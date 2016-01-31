(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('SearchController', function($http, $mdDialog, $log) {
        var vm = {
            progress: false,
            error: null,
            close_dialog: close_dialog,
            save_settings: save_settings,
            query: "Id = ''",
            search: search,
            open_ticket: open_ticket,
            tickets: {}
        };

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
        
        function open_ticket( id ) {
            $mdDialog.hide( id );
        }
        
        function search() {
            vm.progress = true;
            $http.post('/json/ticket/search', { query: vm.query })
                .then(function(response) {
                    vm.tickets = response.data;
                    vm.progress = false;
                })
                .catch(function(response) {
                    $log.error(response);
                    vm.error = 'Error get settings from server';
                    vm.progress = false;
                });
        }

        return vm;
    });
})(angular);
