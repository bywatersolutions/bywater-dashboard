var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ui.sortable', 'ngMaterial']);

dashboardApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/main', {
        templateUrl: 'templates/main.html',
        controller: 'mainCtrl'
      }).
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }).
      otherwise({
        redirectTo: '/main'
      });
  }]
);

dashboardApp.controller( 'mainCtrl', [ '$scope', '$http', '$timeout', '$location', function($scope, $http, $timeout, $location) {
  $http.get('/main/dashboard').success(function(data) {
    if ( data.error ) {
      $location.path( "/login" );
    } else {
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
    
    $http.post( '/main/save_columns', columns ).success( function(data) {
      console.log( data );
    } ).error( function (data, status) {
      alert("An unexpected error occurred!");
    } );
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
