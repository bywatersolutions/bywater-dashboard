(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller( 'leadCtrl', function($scope, $http, $interval, $location, $mdDialog, ticketUpdater, $log) {
        $scope.update_tickets = function() {
            $scope.updater_promise = $http.get('/json/lead/tickets').then(
                function(response) {
                    var data = response.data;
                    $scope.updater_promise = undefined;

                    data.columns = $.map(data.columns, function(column, id) {
                        column.column_id = id;
                        column.tickets = column.tickets || [];

                        return column;
                    }).sort(function(a,b){ return a.order - b.order; });

                    for (var key in data ) {
                        if(data.hasOwnProperty(key)) {
                            $scope[key] = data[key];
                        }
                    }

                    if (!$scope.updater_promise) {
                        $scope.updater_promise = ticketUpdater($scope.columns, $scope.tickets).then(
                            function( data ) {
                                for (var ticket_id in data ) {
                                    if (data.hasOwnProperty(ticket_id)) {
                                        $scope.tickets[ ticket_id ] = data[ ticket_id ];
                                    }
                                }
                            }
                        ).finally( function() { $scope.updater_promise = undefined; } );
                    }
                },
                function () {
                    $scope.updater_promise = undefined;
                }
            );
        };

        $scope.tickets = {};
        $scope.update_tickets();
        var update_interval = $interval(function() { $scope.update_tickets(); }, 15000);
        $scope.$on('$destroy', function() {
            $interval.cancel(update_interval);
        });

        $scope.column_sortable = {
            animation: 300,
            group: 'lead-tickets',
            sort: false
        };

        $scope.onDrop = function(dest, item) {
            $http.post('/json/update_ticket', {ticket_id: item.ticket_id, user_id: dest.user_id}).then(
                function(response) {
                    $log.debug(response.data);
                }
            );
        };

        /* FIXME -- not needed anymore?
        $scope.save = function(src, dst) {
            var src_scope = src.sortableScope.$parent;
            var dst_scope = dst.sortableScope.$parent;

            var columns = {};

            if (!src_scope.column.search_query) {
                columns[src_scope.column_id] = src_scope.column.tickets;
            }

            if (!dst_scope.column.search_query) {
                columns[dst_scope.column_id] = dst_scope.column.tickets;
            }

            $http.post( '/json/lead/save_columns', columns ).then(
                function(response) {
                    $log.debug( response.data );
                }
            );
        };*/

        /* FIXME duplicated in both employee and lead controllers */
        $scope.show_popup = function(ticket_id) {
            if ( $scope.tickets[ticket_id] ) {
                $mdDialog.show({
                    controller: 'TicketPopupController',
                    controllerAs: 'ticketPopup',
                    scope: $scope.$new(),
                    locals: {
                        ticket_id: ticket_id,
                        ticket: angular.merge({}, $scope.tickets[ticket_id])
                    },
                    parent: 'body',
                    templateUrl: 'partials/ticket-popup.html'
                });
            } else {
                $http.post( '/json/ticket_details', {'ids': [ ticket_id ]} ).then( function(response) {
                    var data = response.data;
                    $mdDialog.show({
                        controller: 'TicketPopupController',
                        controllerAs: 'ticketPopup',
                        scope: $scope.$new(),
                        locals: {
                            ticket_id: ticket_id,
                            ticket: response.data[ticket_id]
                        },
                        parent: 'body',
                        templateUrl: 'partials/ticket-popup.html'
                    });
                } );
            }
        };

        // Updated columns settings
        $scope.$on('settingsUpdated', function() {
            $scope.update_tickets();
        });
        
        // Search dialog ticket selection
        $scope.$on('searchTicketOpen', function( event, id ) {
            $scope.show_popup( id );
        });
    });
})(angular);
