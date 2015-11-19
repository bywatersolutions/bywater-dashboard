(function(angular) {
    'use strict';

    angular.module('dashboardApp').controller( 'employeeCtrl', function($scope, $http, $interval, $location, $mdDialog, ticketUpdater, $log) {
        $scope.update_tickets = function() {
            $scope.updater_promise = $http.get('/json/employee/tickets').then(
                function(response) {
                    var data = response.data;

                    $scope.veiw_id = data.view_id;
                    $scope.updater_promise = undefined;

                    data.columns = $.map(data.columns, function(column, id){
                        column.column_id = id;
                        column.tickets = column.tickets || [];

                        return column;
                    }).sort(function(a,b){ return a.order - b.order; });

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
        function create_sortable(column) {
            return {
                animation: 50,
                group: 'employee-tickets',
                sort: false,

                onStart: function() {
                    dragTicketProgress = true;
                },

                onEnd: function() {
                    dragTicketProgress = false;
                },

                onMove: function(evt) {
                    //var from_column = angular.element(evt.from).scope().column;
                    var to_column = angular.element(evt.to).scope().column;

                    return to_column.type != 'rt'; // disallow dropping items into TicketSQL columns
                },

                onAdd: function(evt) {
                    var columns = {};

                    if (column.type != "rt") {
                        columns[column.column_id] = evt.models;
                    }

                    $http.post('/json/employee/save_columns', columns).then(
                        function(response) {
                            $log.debug(response.data);
                        }
                    );
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

        $scope.show_popup = function(ticket_id, $event) {
            $mdDialog.show({
                controller: 'ticketPopupCtrl',
                locals: {
                    ticket_id: ticket_id,
                    ticket: angular.merge({}, $scope.tickets[ticket_id])
                },
                //parent: angular.element(document.body),
                scope: $scope.$new(),
                parent: 'body',
                //targetEvent: $event,
                templateUrl: 'partials/ticket-popup.html'
            });
        }

        $scope.$on("openViewSettingsEvent", function (event, args) {
            var $child_scope = $scope.$new();
            $child_scope.columns = $scope.columns;
            $child_scope.view_id = $scope.view_id;
            $mdDialog.show({
                controller: 'viewSettingsCtrl',
                locals: {},
                scope: $child_scope,
                parent: 'body',
                templateUrl: 'partials/view-settings-popup.html'
            }).then(function(){
                $log.debug("View settings dialog promise resolved");
                $scope.update_tickets();
            });
        });
    });
})(angular);