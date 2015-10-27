(function(angular) {
    'use strict';

    angular.module('dashboardApp').config(function($routeProvider) {
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
    });
})(angular);