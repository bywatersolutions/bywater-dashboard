(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller( 'employeeCtrl', function($scope, $http, $interval, $location, $mdDialog, ticketUpdater, $log) {
        $scope.update_tickets = function() {
            $scope.updater_promise = $http.get('/json/employee/tickets').then(
                function(response) {
                    var data = response.data;

                    $scope.updater_promise = undefined;

                    data.columns = $.map(data.columns, function(column, id){
                        column.column_id = id;
                        column.tickets = column.tickets || [];

                        return column;
                    }).sort(function(a,b){ return a.column_order - b.column_order; });

                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            $scope[key] = data[key];
                        }
                    }

                    if (!$scope.updater_promise) {
                        $scope.updater_promise = ticketUpdater($scope.columns, $scope.tickets).then(
                            function(data) {
                                for (var ticket_id in data) {
                                    if (data.hasOwnProperty(ticket_id)) {
                                        $scope.tickets[ticket_id] = data[ticket_id];
                                    }
                                }
                            }
                        ).finally(function() { $scope.updater_promise = undefined; });
                    }
                },
                function () {
                    $scope.updater_promise = undefined;
                }
            );
        };

        $scope.tickets = {};
        $scope.update_tickets();

        var update_interval = $interval(function() {
            if (!dragTicketProgress) {
                $scope.update_tickets();
            }
        }, 15000);
        $scope.$on('$destroy', function() {
            $interval.cancel(update_interval);
        });

        // We have to create separate sortable configs for each column, but we have to cache them so
        // Angular doesn't see neverending changes
        var dragTicketProgress = false;
        var columnsFromPut = [];
        function create_sortable(column) {
            if (column.type == 'rt' && columnsFromPut.indexOf('employee-tickets' + column.column_id) == -1) {
                columnsFromPut.push('employee-tickets' + column.column_id);
            }

            return {
                animation: 50,
                group: column.type == 'rt' ?
                    'employee-tickets' + column.column_id :
                    {
                        name: 'employee-tickets-rt',
                        put: columnsFromPut,
                    },
                sort: false,

                onStart: function() {
                    dragTicketProgress = true;
                },

                onEnd: function() {
                    dragTicketProgress = false;
                },

                onAdd: function() {
                    var columns = {};

                    $http.post('/json/employee/save_columns', columns).then(
                        function(response) {
                            $log.debug(response.data);
                        }
                    );
                },

                onMove: function(evt) {
                    $log.debug(evt, angular.element(evt.to).scope());
                }
            };
        }

        var sortables = [];
        $scope.column_sortable = function(column) {
            if (!sortables[column.column_id]) {
                sortables[column.column_id] = create_sortable(column);
            }

            return sortables[column.column_id];
        };

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
