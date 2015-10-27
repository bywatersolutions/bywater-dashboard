(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('ticketPopupCtrl', function($scope, $http, $mdDialog, ticket, ticket_id, $log) {
        $scope.ticket_id = ticket_id;
        $scope.ticket = ticket;
        $scope.correspondence = "";
        $scope.selected_tab_index = 0;

        $scope.get_history = function () {
            $http.post('/json/ticket_history', {ticket_id: ticket_id}).then(
                function(response) {
                    var data = response.data;

                    $scope.history = data.filter(function(history_entry) {
                        // Filter out unhelpful entries

                        // While we should incorporate email success/failure at some point, for now it's
                        // clutter
                        if (history_entry.Type.match(/EmailRecord$/))
                            return false;

                        // These are always followed by a Given entry
                        if (history_entry.Type == 'SetWatcher' && history_entry.Field == 'Owner')
                            return false;

                        // Pre-process history

                        // ¿Por qué, RT?
                        if (history_entry.Content == 'This transaction appears to have no content') {
                            history_entry.Content = '';
                        }

                        return true;
                    });
                }
            );
        };

        $scope.get_history();

        $scope.update_ticket = function() {
            $scope.update_dialog.ticket_id = $scope.ngDialogData.ticket_id;
            $http.post('/json/update_ticket', $scope.update_dialog).then(
                function(response) {
                    $log.debug( response.data );
                }
            );

            return true;
        };

        $scope.close_dialog = function () {
            $mdDialog.hide();
        };

        $scope.add_correspondence = function () {
            $http.post('/json/ticket_add_history', {ticket_id: ticket_id, correspondence: $scope.correspondence});

            $scope.selected_tab_index = 1;
            $scope.history = undefined;
            $scope.get_history();
        };
    });
})(angular);