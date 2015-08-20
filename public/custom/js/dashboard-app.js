var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ngMaterial']);

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

dashboardApp.controller( 'employeeCtrl', [ '$scope', '$http', '$interval', '$location', '$mdDialog', 'ticketUpdater', function($scope, $http, $interval, $location, $mdDialog, ticketUpdater) {
    // This is duplicate code and shoud by DRY if possible - ID:2
    $http.get('/json/get_roles').success(function(data) {
        $scope.roles = data.roles;
    });

    $scope.update_tickets = function() {
        $scope.updater_promise = $http.get('/json/employee/tickets')

        .success(function(data) {
            $scope.updater_promise = undefined;

            data.columns = $.map( data.columns, function( column, id ) {
                column.column_id = id;
                column.tickets = column.tickets || [];
                return column;
            } );
            data.columns.sort(function(a,b){ return a.order - b.order });

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
    $scope.$on( '$destroy', function() {
        $interval.cancel( update_interval );
    } );

    // We have to create separate sortable configs for each column, but we have to cache them so
    // Angular doesn't see neverending changes
    function create_sortable(column) {
        return {
            animation: 300,
            group: 'employee-tickets',
            sort: false,

            onMove: function(evt) {
                var from_column = angular.element(evt.from).scope().column;
                var to_column = angular.element(evt.to).scope().column;
                return to_column.type != 'rt'; // disallow dropping items into TicketSQL columns
            },

            onAdd: function(evt) {
                var columns = {};

                if ( !column.search_query ) {
                    columns[ column.column_id ] = evt.models;
                }

                $http.post( '/json/employee/save_columns', columns ).success( function(data) { console.log( data ); } );
            },
        };
    };

    var sortables = [];
    $scope.column_sortable = function(column) {
        if ( !sortables[column.column_id] ) {
            sortables[column.column_id] = create_sortable(column);
        }

        return sortables[column.column_id];
    };

    $scope.show_popup = function ( ticket_id, $event ) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: 'partials/ticket-popup.html',
            locals: { ticket_id: ticket_id, ticket: $scope.tickets[ticket_id] },
            controller: 'ticketPopupCtrl',
            scope: $scope
        });
    }
} ]
);

dashboardApp.directive( 'dbDropTarget', [ '$timeout', function( $timeout ) {
    return {
        restrict: 'E',
        link: function( scope, element, attrs ) {
            var onDrop;
            scope.$watch( attrs.dbOnDrop, function(value) {
                console.log(value);
                onDrop = value;
            } );

            element.css({
                height: '100%',
                position: 'relative',
                width: '100%',
            });

            var dropTarget = $('<div class="db-drop-target">');
            dropTarget.attr('class', 'db-drop-target');
            dropTarget.css({
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100%',
            });
            element.append(dropTarget);

            Sortable.create( dropTarget[0], {
                group: attrs.dbDropGroup,

                onAdd: function(evt) {
                    var el = evt.item;
                    el.parentNode.removeChild(el);
                    onDrop( angular.element( element[0] ).scope(), angular.element(el).scope() );
                },
            } );
        },
    };
} ] );

dashboardApp.controller( 'leadCtrl', [ '$scope', '$http', '$interval', '$location', '$mdDialog', 'ticketUpdater', function($scope, $http, $interval, $location, $mdDialog, ticketUpdater) {
    // This is duplicate code and shoud by DRY if possible - ID:2
    $http.get('/json/get_roles').success(function(data) {
        $scope.roles = data.roles;
    });

    $scope.update_tickets = function() {
        $scope.updater_promise = $http.get('/json/lead/tickets')
        .success(function(data) {
            $scope.updater_promise = undefined;

            data.columns = $.map( data.columns, function( column, id ) {
                column.column_id = id;
                column.tickets = column.tickets || [];
                return column;
            } );
            data.columns.sort(function(a,b){ return a.order - b.order });

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
    $scope.$on( '$destroy', function() {
        $interval.cancel( update_interval );
    } );

    $scope.column_sortable = {
        animation: 300,
        group: 'lead-tickets',
        sort: false,
    };

    $scope.onDrop = function ( dest, item ) {
        $http.post( '/json/update_ticket', { ticket_id: item.ticket_id, user_id: dest.user_id } ).success( function(data) {
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

    $scope.show_popup = function ( ticket_id, $event ) {
        $mdDialog.show({
            templateUrl: 'partials/ticket-popup.html',
            locals: { ticket_id: ticket_id, ticket: $scope.tickets[ticket_id] },
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

dashboardApp.controller( 'ticketPopupCtrl', [ '$scope', '$http', '$mdDialog', 'ticket', 'ticket_id', function($scope, $http, $mdDialog, ticket, ticket_id) {
    $scope.ticket_id = ticket_id;
    $scope.ticket = ticket;
    $http.post( '/json/ticket_history', { ticket_id: ticket_id } ).success( function(data) {
        $scope.history = data;
    } );

    $scope.update_ticket = function() {
        $scope.update_dialog.ticket_id = $scope.ngDialogData.ticket_id;
        $http.post( '/json/update_ticket', $scope.update_dialog ).success( function(data) {
            console.log( data );
        } );
        return true;
    }

    $scope.close_dialog = function () {
        $mdDialog.hide();
    }
} ] );
