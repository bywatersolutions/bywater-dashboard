(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('ticketPopupCtrl', function($scope, $http, $mdDialog, ticket, ticket_id, $log) {
        $scope.ticket_id = ticket_id;
        $scope.ticket = ticket;
        $scope.message = "";
        $scope.selected_tab_index = 0;
        $scope.privacy = "private";
        $scope.showContact = {};
        $scope.contacts_count = 0;

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
            $http.post('/json/ticket/add_correspondence', { ticket_id: ticket_id, message: $scope.message, privacy: $scope.privacy } )
                .then(function() {
                    $scope.history = undefined;
                    get_history();
                })
                .catch(function() {
                    $scope.history = undefined;
                    get_history();
                });
        };

        function get_sugar_crm_data () {
            $http.post( '/json/sugarcrm/get_contact', { email: ticket["Creator"] } )
            //$http.get( '/custom/get_contact.json' )
                .then(function( response ) {
                    $scope.sugar_crm_data = null;
                    $scope.sugar_crm_data_parsed = {};
                    if (response.data.contacts.length == 0) {
                        return;
                    }

                    $scope.sugar_crm_data = response.data;
                    $scope.contact = response.data.contacts[0]; // for easy configuration of pop-up window read-only data
                    $scope.contacts_count = response.data.contacts.length;
                    $scope.system = response.data.system;
                    $scope.sugar_crm_data.contacts.forEach(function(contact) {
                        var rows = [],
                            row = [],
                            contactKey;

                        if (angular.isDefined(contact['full_name']) && contact['full_name']) {
                            contactKey = contact['full_name'];
                        } else if (angular.isDefined(contact['name']) && contact['name']) {
                            contactKey = contact['name'];
                        }
                        if (angular.isDefined(contact['email']) && angular.isDefined(contactKey)) {
                            contactKey += ' (' + ( contact['email'] || contact['email1'] ) + ')';
                        } else {
                            contactKey = contact['email'];
                        }

                        for(var key in contact) {
                            if (contact.hasOwnProperty(key)) {
                                if (row.length == 2) {
                                    rows.push(row);
                                    row = [];
                                }

                                row.push({
                                    key: $scope.sugar_crm_data.labels['Contacts'][key],
                                    value: contact[key]
                                });
                            }
                        }

                        $scope.sugar_crm_data_parsed[contactKey] = rows;
                    });
                })
                .catch( function() {
                    $scope.sugar_crm_data = 'error';
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