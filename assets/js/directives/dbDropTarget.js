(function (angular) {
    'use strict';

    angular.module('dashboardApp').directive('dbDropTarget', function($log) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var onDrop;

                scope.$watch(attrs.dbOnDrop, function(value) {
                    $log.debug(value);
                    onDrop = value;
                } );

                element.css({
                    height: '100%',
                    position: 'relative',
                    width: '100%'
                });

                var dropTarget = angular.element('<div class="db-drop-target">');

                dropTarget.attr('class', 'db-drop-target');
                dropTarget.css({
                    height: '100%',
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: '100%'
                });
                element.append(dropTarget);

                Sortable.create(dropTarget[0], {
                    group: attrs.dbDropGroup,

                    onAdd: function(evt) {
                        var el = evt.item;

                        el.parentNode.removeChild(el);
                        onDrop(angular.element(element[0]).scope(), angular.element(el).scope());
                    }
                });
            }
        };
    });
})(angular);