(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('ticketPopupCtrl', function($scope, $http, $mdDialog, ticket, ticket_id, $log) {
        $scope.ticket_id = ticket_id;
        $scope.ticket = ticket;
        $scope.correspondence = "";
        $scope.selected_tab_index = 0;
        $scope.privacy = "private";

        $scope.update_ticket = function() {
            var postData = angular.merge({}, $scope.ticket);
            postData.ticket_id = $scope.ticket_id;
            $http.post('/json/update_ticket', postData).then(
                function(response) {
                    $log.debug( response.data );
                    $mdDialog.hide();
                }
            );
        };

        $scope.close_dialog = function () {
            $mdDialog.hide();
        };

        $scope.add_correspondence = function () {
            $http.post('/json/ticket_add_history', { ticket_id: ticket_id, correspondence: $scope.correspondence} )
                .then(function() {
                    $scope.selected_tab_index = 1;
                    $scope.history = undefined;
                    get_history();
                })
                .catch(function() {
                    $scope.selected_tab_index = 1;
                    $scope.history = undefined;
                    get_history();
                });
        };

        function get_sugar_crm_data () {
            $http.post( '/json/sugarcrm/get_contact', { email: ticket["Creator"] } ).success( function(data) {
                $scope.sugar_crm_data = data.data;
                $scope.contact = data.data.contacts[0]; // for easy configuration of pop-up window read-only data

                $scope.sugar_crm_data_parsed = $scope.sugar_crm_data.contacts.map(function(contact) {
                    var rows = [],
                        row = [];

                    for(var key in contact) {
                        if (contact.hasOwnProperty(key)) {
                            if (row.length == 2) {
                                rows.push(row);
                                row = [];
                            }

                            row.push({
                                key: $scope.sugar_crm_data.labels[key],
                                value: contact[key]
                            });
                        }
                    }

                    return rows;
                });

                $log.debug($scope.sugar_crm_data_parsed);
            });
        }
        get_sugar_crm_data();

        function get_history() {
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
        }
        get_history();
    });
})(angular);