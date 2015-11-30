(function(angular) {
   'use strict';

    angular.module('dashboardApp', ['ngRoute', 'ngSanitize', 'ngMaterial', 'ng-sortable', 'chart.js', 'ngAnimate'])
        .config(function($mdIconProvider, $mdThemingProvider, $httpProvider) {
            $mdIconProvider.defaultFontSet('fa');
            $mdThemingProvider.theme('default')
                .primaryPalette('blue', {
                    'default': '500'
                });

            $httpProvider.interceptors.push('httpInterceptor');
        });
})(angular);
