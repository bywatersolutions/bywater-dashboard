(function(angular) {
    'use strict';

    angular.module('dashboardApp').factory('ticketUpdater', function($q, $http) {
        return function(columns, tickets) {
            var new_ticket_ids = [];

            for (var column_id in columns) {
                if (columns.hasOwnProperty(column_id)) {
                    var ticket_ids = columns[column_id].tickets;
                    if (!ticket_ids)
                        continue;

                    for (var i = 0; i < ticket_ids.length; i++) {
                        var ticket_id = ticket_ids[i];
                        if (!tickets[ticket_id ])
                            new_ticket_ids.push(ticket_id);
                    }
                }
            }

            for (var ticket_id in tickets) {
                if (tickets.hasOwnProperty(ticket_id)) {
                    var ticket = tickets[ticket_id];
                    if (ticket['__updated'] < new Date()) {
                        ticket['__updated'] = new Date( new Date().getTime() + Math.round( Math.random() * 9 ) * 10000 + 60000 );
                        new_ticket_ids.push(ticket_id);
                    }
                }
            }

            var deferred = $q.defer();

            if (new_ticket_ids.length) {
                $http.post('/json/ticket_details', {'ids': new_ticket_ids}).then(
                    function(response) {
                        var data = response.data;

                        for (ticket_id in data) {
                            if (data.hasOwnProperty(ticket_id)) {
                                data[ticket_id]['__updated'] = new Date( new Date().getTime() + Math.round( Math.random() * 9 ) * 10000 + 60000 );
                            }
                        }

                        deferred.resolve(data);
                    },
                    function(response) {
                        deferred.reject(response.data);
                    }
                );
            } else {
                deferred.reject();
            }

            return deferred.promise;
        }
    });
})(angular);