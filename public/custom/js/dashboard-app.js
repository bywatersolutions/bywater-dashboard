var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ui.sortable', 'ngMaterial', 'ngDialog']);

dashboardApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/employee', {
        templateUrl: 'templates/employee.html',
        controller: 'employeeCtrl'
      }).
      when('/lead', {
        templateUrl: 'templates/employee.html',
        controller: 'leadCtrl'
      }).
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }).
      otherwise({
        redirectTo: '/employee'
      });
  }]
);

dashboardApp.controller( 'employeeCtrl', [ '$scope', '$http', '$timeout', '$location', 'ngDialog', function($scope, $http, $timeout, $location, ngDialog) {
  $http.get('/main/employee_tickets').success(function(data) {
    if ( data.error ) {
      $location.path( "/login" );
    } else {
      $scope.col_ids = Object.keys( data.columns );
      $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });
      
      $scope.columns = data.columns;
      $scope.tickets = data.tickets;
    }
  });
  
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
    
    $http.post( '/main/employee_save_columns', columns ).success( function(data) {
      console.log( data );
    } ).error( function (data, status) {
      alert("An unexpected error occurred!");
    } );
  }
  
  $scope.show_popup = function ( ticket ) {
    child_scope = $scope.$new(true);
    child_scope.ticket = ticket;
    ngDialog.open({ template: 'card-popup', scope: child_scope });
  }
} ]
);

dashboardApp.controller( 'leadCtrl', [ '$scope', '$http', '$timeout', '$location', 'ngDialog', function($scope, $http, $timeout, $location, ngDialog) {
  $http.get('/main/lead_tickets').success(function(data) {
    if ( data.error ) {
      $location.path( "/login" );
    } else {
      $scope.col_ids = Object.keys( data.columns );
      $scope.col_ids.sort(function(a,b){ return data.columns[a].order - data.columns[b].order });
      
      $scope.columns = data.columns;
      $scope.tickets = data.tickets;
    }
  });
  
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
    
    $http.post( '/main/lead_save_columns', columns ).success( function(data) {
      console.log( data );
    } ).error( function (data, status) {
      alert("An unexpected error occurred!");
    } );
  }
  
  $scope.show_popup = function ( ticket ) {
    child_scope = $scope.$new(true);
    child_scope.ticket = ticket;
    ngDialog.open({ template: 'card-popup', scope: child_scope });
  }
} ]
);

dashboardApp.controller( 'loginCtrl', [ '$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location) {
    $scope.credentials = {};
    
    $scope.submit = function () {
        $http.post('/main/login', $scope.credentials).success(function(data) {
            $location.path( "/main" );
        });
    };
} ] );
