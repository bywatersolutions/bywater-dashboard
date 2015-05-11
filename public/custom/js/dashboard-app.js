var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ui.sortable', 'ngMaterial', 'ngDialog', 'ngDragDrop']);

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
    
    var deferred = $q.defer();
    
    $http.post( '/json/ticket_details', { 'ids': new_ticket_ids } )
    .success( function( data ) {
      for ( ticket_id in data ) {
        data[ticket_id]['__updated'] = new Date();
      }
      deferred.resolve( data );
    } ).error( function ( data ) {
      deferred.reject( data )
    } );
    
    return deferred.promise;
  }
} ] );

dashboardApp.controller( 'employeeCtrl', [ '$scope', '$http', '$timeout', '$location', 'ngDialog', 'ticketUpdater', function($scope, $http, $timeout, $location, ngDialog, ticketUpdater) {
  $http.get('/json/employee/tickets').success(function(data) {
    $scope.col_ids = Object.keys( data.columns );
    $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });
    
    for ( key in data ) {
      $scope[ key ] = data[ key ];
    }
    
    ticketUpdater( $scope.columns, $scope.tickets ).then( function( data ) {
      for ( ticket_id in data ) {
        $scope.tickets[ ticket_id ] = data[ ticket_id ];
      }
    } );
  });
  
  $scope.tickets = {};
  
  $scope.sortListeners = {
      accept: function (sourceItemHandleScope, destSortableScope) {
        return !destSortableScope.$parent.column.search_query; // disallow dropping items into TicketSQL columns
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
      template: 'templates/ticket-popup.html',
      data: $scope.tickets[ticket_id],
      controller: 'ticketPopupCtrl',
      scope: $scope
    });
  }
} ]
);

dashboardApp.controller( 'leadCtrl', [ '$scope', '$http', '$timeout', '$location', 'ngDialog', 'ticketUpdater', function($scope, $http, $timeout, $location, ngDialog, ticketUpdater) {
  $http.get('/json/lead/tickets').success(function(data) {
    $scope.col_ids = Object.keys( data.columns );
    $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });
    
    for ( key in data ) {
      $scope[ key ] = data[ key ];
    }

    ticketUpdater( $scope.columns, $scope.tickets ).then( function( data ) {
      for ( ticket_id in data ) {
        $scope.tickets[ ticket_id ] = data[ ticket_id ];
      }
    } );
  });
  
  $scope.tickets = {};
  
  $scope.sortListeners = {
      accept: function (sourceItemHandleScope, destSortableScope) {
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
    } ).error( function (data, status) {
      alert("An unexpected error occurred!");
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
      template: 'templates/ticket-popup.html',
      data: $scope.tickets[ticket_id],
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
  $http.get('/json/get_role').success(function(data) {
    if ( data.role == "employee" ) {
      $location.path("/employee");
    } else {
      $location.path("/lead");
    }
  });
} ] );

dashboardApp.controller( 'ticketPopupCtrl', [ '$scope', '$http', function($scope, $http) {
} ] );
