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
      accept: function (sourceItemHandleScope, destSortableScope) { return true }, //override to determine drag is allowed or not. default is true.
      itemMoved: function (event) {},
      orderChanged: function(event) {},
  };

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
