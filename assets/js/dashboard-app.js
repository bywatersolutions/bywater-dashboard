(function(angular) {
   'use strict';

    angular.module('dashboardApp', ['ngRoute', 'ngMaterial', 'ng-sortable'])
        .config(function($mdIconProvider, $mdThemingProvider, $httpProvider) {
            $mdIconProvider.defaultFontSet('fa');
            $mdThemingProvider.theme('default')
                .primaryPalette('light-blue', {
                    'default': '500'
                });

            $httpProvider.interceptors.push('httpInterceptor');
        });
})(angular);
