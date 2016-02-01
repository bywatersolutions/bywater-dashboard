(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller('TicketPopupController', function($scope, $http, $mdDialog, ticket, ticket_id, $log) {
        var vm = {
            ticket_id: ticket_id,
            ticket: ticket,
            message: "",
            selected_tab_index: 0,
            privacy: "private",
            showContact: {},
            contacts_count: 0,
            update_ticket: update_ticket,
            close_dialog: close_dialog,
            add_correspondence: add_correspondence,
            popup_config: $scope.popup_config,
            statuses: $scope.statuses,
            queues: $scope.queues,
            rt_users: $scope.rt_users,
            showCorrespondence: false,
            is_history_data: is_history_data,
            get_history_data: get_history_data,
            history_progress: true,
            bugzilla_progress: true
        };

        function update_ticket() {
            var postData = angular.merge({}, vm.ticket);
            postData.ticket_id = vm.ticket_id;
            $http.post('/json/update_ticket', postData).then(
                function(response) {
                    $log.debug( response.data );
                    $mdDialog.hide();
                }
            );
        }

        function close_dialog() {
            $mdDialog.hide();
        }

        function add_correspondence() {
            $http.post('/json/ticket/add_correspondence', {ticket_id: ticket_id, message: vm.message, privacy: vm.privacy} )
                .then(function() {
                    vm.history = undefined;
                    get_history();
                })
                .catch(function() {
                    vm.history = undefined;
                    get_history();
                })
                .finally(function() {
                    vm.showCorrespondence = false;
                });
        }

        function is_history_data(data) {
            return angular.isDefined(vm[data[1]]) && angular.isDefined(vm[data[1]][data[2]]);
        }

        function get_history_data(data) {
            return vm[data[1]][data[2]];
        }

        function get_sugar_crm_data () {
            $http.post( '/json/sugarcrm/get_contact', { email: ticket["Creator"] } )
                .then(function( response ) {
                    vm.sugar_crm_data = null;
                    vm.sugar_crm_data_parsed = {};
                    if (response.data.contacts.length == 0) {
                        return;
                    }

                    vm.sugar_crm_data = response.data;
                    vm.contact = response.data.contacts[0]; // for easy configuration of pop-up window read-only data
                    vm.contacts_count = response.data.contacts.length;
                    vm.system = response.data.system;
                    vm.sugar_crm_data.contacts.forEach(function(contact) {
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
                                    key: vm.sugar_crm_data.labels['Contacts'][key],
                                    value: contact[key]
                                });
                            }
                        }

                        vm.sugar_crm_data_parsed[contactKey] = rows;
                    });
                })
                .catch( function() {
                    vm.sugar_crm_data = 'error';
                });
        }
        get_sugar_crm_data();

        function get_bugzilla_data() {
            if ( !vm.ticket.bugzilla_ids ) return;
            
            $http.post( '/json/bugzilla/get_bug', { bug_ids: vm.ticket.bugzilla_ids } )
                .then(function( response ) {
                    vm.bugzilla_data = response.data;
                    if ( response.data.error ) {
                        $log.warn( response.data.error );
                        vm.bugzilla_data = 'error';
                    }
                })
                .catch( function() {
                    vm.bugzilla_data = 'error';
                });
        }
        get_bugzilla_data();

        function get_history() {
            $http.post('/json/ticket_history', {ticket_id: ticket_id}).then(
                function(response) {
                    var data = response.data;

                    vm.history = data.filter(function(history_entry) {
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

        return vm;
    });
})(angular);
