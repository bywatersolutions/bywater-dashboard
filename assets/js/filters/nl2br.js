(function(angular) {
    'use strict';

    angular.module('dashboardApp').filter('nl2br', function($sce) {
       return function(text) {
           text = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');

           return $sce.trustAsHtml(text);
       }
    });
})(angular);