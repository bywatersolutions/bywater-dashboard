var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ngDragDrop', 'ngMaterial']);

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
        console.log( data );
        $scope.columns = data.columns;
        $scope.tickets = data.tickets;
      }
    });
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
