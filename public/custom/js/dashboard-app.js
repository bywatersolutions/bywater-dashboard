var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ui.sortable', 'ngMaterial', 'ngDialog', 'ngDragDrop', 'ngMaterial']);

// Theming
dashboardApp.config(['$mdIconProvider', function($mdIconProvider) {
    // Add our font icon library
    $mdIconProvider.defaultFontSet('fa');
}]);

dashboardApp.config(['$mdThemingProvider', function($mdThemingProvider) {
    // Set custom colors
    $mdThemingProvider.theme('default')
        .primaryPalette('light-blue', {
            'default': '500',
        });
}]);

dashboardApp.factory( 'httpInterceptor', [ '$q', '$location', function( $q, $location ) {
    return {
        response: function ( response ) {
            if ( response.data.error ) {
                alert( response.data.error );
                return $q.reject( response );
            }

            return response;
        },
        responseError: function( response ) {
            if ( response.status == 401 ) {
                $location.path( "/login" );
            } else if ( response.data.error ) {
                alert( response.data.error );
            } else {
                alert( "Unknown error ocurred." );
                console.log( response );
            }

            return $q.reject( response );
        }
    };
} ] );

dashboardApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
}]);

dashboardApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/employee', {
                templateUrl: 'templates/employee-view.html',
                controller: 'employeeCtrl'
            }).
            when('/lead', {
                templateUrl: 'templates/lead-view.html',
                controller: 'leadCtrl'
            }).
            when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            }).
            otherwise({
                template: 'Please wait.',
                controller: 'redirectCtrl'
            });
    }]
);

dashboardApp.factory( 'ticketUpdater', [ '$q', '$http', function ( $q, $http ) {
    return function ( columns, tickets ) {
        var new_ticket_ids = [];

        for ( var column_id in columns ) {
            var ticket_ids = columns[ column_id ].tickets;
            if ( !ticket_ids ) continue;

            for ( var i = 0; i < ticket_ids.length; i++ ) {
                var ticket_id = ticket_ids[i];
                if ( !tickets[ ticket_id ] ) new_ticket_ids.push( ticket_id );
            }
        }

        for ( var ticket_id in tickets ) {
            var ticket = tickets[ticket_id];
            if ( ticket['__updated'] < new Date() ) {
                ticket['__updated'] = new Date( new Date().getTime() + Math.round( Math.random() * 9 ) * 10000 + 60000 );
                new_ticket_ids.push( ticket_id );
            }
        }

        var deferred = $q.defer();

        if ( new_ticket_ids.length ) {
            $http.post( '/json/ticket_details', { 'ids': new_ticket_ids } )
            .success( function( data ) {
                for ( ticket_id in data ) {
                    data[ticket_id]['__updated'] = new Date( new Date().getTime() + Math.round( Math.random() * 9 ) * 10000 + 60000 );
                }
                deferred.resolve( data );
            } ).error( function ( data ) {
                deferred.reject( data )
            } );
        } else {
            deferred.reject();
        }

        return deferred.promise;
    }
} ] );

dashboardApp.controller( 'employeeCtrl', [ '$scope', '$http', '$interval', '$location', 'ngDialog', 'ticketUpdater', function($scope, $http, $interval, $location, ngDialog, ticketUpdater) {
    // This is duplicate code and shoud by DRY if possible - ID:2
    $http.get('/json/get_roles').success(function(data) {
        $scope.roles = data.roles;
    });

    $scope.update_tickets = function() {
        $scope.updater_promise = $http.get('/json/employee/tickets')

        .success(function(data) {
            $scope.updater_promise = undefined;

            $scope.col_ids = Object.keys( data.columns );
            $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });

            for ( key in data ) {
                $scope[ key ] = data[ key ];
            }

            if ( !$scope.updater_promise ) {
                $scope.updater_promise = ticketUpdater( $scope.columns, $scope.tickets ).then( function( data ) {
                    for ( ticket_id in data ) {
                        $scope.tickets[ ticket_id ] = data[ ticket_id ];
                    }
                } ).finally( function () { $scope.updater_promise = undefined; } );
            }
        })

        .error(function () {
            $scope.updater_promise = undefined;
        });
    };

    $scope.tickets = {};
    $scope.update_tickets();
    var update_interval = $interval( function() { $scope.update_tickets(); }, 15000 );
    $scope.$on( 'destroy', function() {
        update_interval.cancel();
    } );

    $scope.sortListeners = {
            accept: function (sourceItemHandleScope, destSortableScope) {
                return false;
                return $scope.columns[destSortableScope.column_id].name.type != 'rt'; // disallow dropping items into TicketSQL columns
            },
            itemMoved: function (event) { $scope.save( event.source, event.dest ); },
            orderChanged: function(event) { console.log( event ); },
    };

    $scope.save = function ( src, dst ) {
        var src_scope = src.sortableScope.$parent;
        var dst_scope = dst.sortableScope.$parent;

        var columns = {};

        if ( !src_scope.column.search_query ) {
            columns[ src_scope.column_id ] = src_scope.column.tickets;
        }

        if ( !dst_scope.column.search_query ) {
            columns[ dst_scope.column_id ] = dst_scope.column.tickets;
        }

        $http.post( '/json/employee/save_columns', columns ).success( function(data) { console.log( data ); } );
    }

    $scope.show_popup = function ( ticket_id ) {
        ngDialog.open({
            template: 'partials/ticket-popup.html',
            data: { ticket_id: ticket_id, ticket: $scope.tickets[ticket_id] },
            controller: 'ticketPopupCtrl',
            scope: $scope
        });
    }
} ]
);

dashboardApp.controller( 'leadCtrl', [ '$scope', '$http', '$interval', '$location', 'ngDialog', 'ticketUpdater', function($scope, $http, $interval, $location, ngDialog, ticketUpdater) {
    // This is duplicate code and shoud by DRY if possible - ID:2
    $http.get('/json/get_roles').success(function(data) {
        $scope.roles = data.roles;
    });

    $scope.update_tickets = function() {
        $scope.updater_promise = $http.get('/json/lead/tickets')
        .success(function(data) {
            $scope.updater_promise = undefined;

            $scope.col_ids = Object.keys( data.columns );
            $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });

            for ( key in data ) {
                $scope[ key ] = data[ key ];
            }

            if ( !$scope.updater_promise ) {
                $scope.updater_promise = ticketUpdater( $scope.columns, $scope.tickets ).then( function( data ) {
                    for ( ticket_id in data ) {
                        $scope.tickets[ ticket_id ] = data[ ticket_id ];
                    }
                } ).finally( function () { $scope.updater_promise = undefined; } );
            }
        })
        .error(function () {
            $scope.updater_promise = undefined;
        });
    }

    $scope.tickets = {};
    $scope.update_tickets();
    var update_interval = $interval( function() { $scope.update_tickets(); }, 15000 );
    $scope.$on( 'destroy', function() {
        update_interval.cancel();
    } );

    $scope.sortListeners = {
        accept: function (sourceItemHandleScope, destSortableScope) {
            return false;
            //return !destSortableScope.$parent.column.search_query; // disallow dropping items into TicketSQL columns
        },
        itemMoved: function (event) { /*$scope.save( event.source, event.dest );*/ },
        orderChanged: function(event) { console.log( event ); }
    };

    $scope.onDragStart = function () {
        this.isDragged = true;
    }

    $scope.onDrop = function ( event, ui ) {
        $http.post( '/json/update_ticket', { ticket_id: this.dndDragItem, user_id: this.user_id } ).success( function(data) {
            console.log( data );
        } );
    }

    $scope.save = function ( src, dst ) {
        var src_scope = src.sortableScope.$parent;
        var dst_scope = dst.sortableScope.$parent;

        var columns = {};

        if ( !src_scope.column.search_query ) {
            columns[ src_scope.column_id ] = src_scope.column.tickets;
        }

        if ( !dst_scope.column.search_query ) {
            columns[ dst_scope.column_id ] = dst_scope.column.tickets;
        }

        $http.post( '/json/lead/save_columns', columns ).success( function(data) {
            console.log( data );
        } );
    }

    $scope.show_popup = function ( ticket_id ) {
        if ( this.isDragged ) {
            this.isDragged = false;
            return;
        }

        ngDialog.open({
            template: 'partials/ticket-popup.html',
            data: { ticket_id: ticket_id, ticket: $scope.tickets[ticket_id] },
            controller: 'ticketPopupCtrl',
            scope: $scope
        });
    }
} ]
);

dashboardApp.controller( 'loginCtrl', [ '$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location) {
    $scope.credentials = {};

    $scope.submit = function () {
        $http.post('/json/login', $scope.credentials).success(function(data) {
            if ( data.role == "lead" ) {
                $location.path( "/lead" );
            } else {
                $location.path( "/employee" );
            }
        });
    };
} ] );

dashboardApp.controller( 'redirectCtrl', [ '$scope', '$http', '$location', function($scope, $http, $location) {
    $http.get('/json/get_roles').success(function(data) {
        var role = data.roles[0]; // Just grab the first role for now
        if ( role == "lead" ) {
            $location.path("/lead");
        } else {
            $location.path("/employee");
        }
    });
} ] );

dashboardApp.controller( 'ticketPopupCtrl', [ '$scope', '$http', function($scope, $http) {
    $http.post( '/json/ticket_history', { ticket_id: $scope.ngDialogData.ticket_id } ).success( function(data) {
        $scope.history = data;
    } );

    $scope.update_ticket = function() {
        $scope.update_dialog.ticket_id = $scope.ngDialogData.ticket_id;
        $http.post( '/json/update_ticket', $scope.update_dialog ).success( function(data) {
            console.log( data );
        } );
        return true;
    }
} ] );
