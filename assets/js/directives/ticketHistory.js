(function (angular) {
    'use strict';

    angular.module('dashboardApp').directive('ticketHistory', function($log, $filter) {
        function recursiveMessages(messageElement) {
            var text = '<li>';

            if (angular.isArray(messageElement)) {
                text += '<ul>';

                messageElement.forEach(function(element) {
                   text += recursiveMessages(element);
                });

                text += '</ul>';
            } else {
                text += $filter('nl2br')(messageElement, false);
            }

            text += '</li>';

            return text;
        }

        return {
            restrict: 'A',
            template:
                '<div class="ticket-history__wrapper" ng-class="{\'ticket-history__wrapper--has-more\': moreMessages.length > 0}">' +
                    '<div class="ticket-history__title" layout="row" layout-sm="column">' +
                        '<div class="ticket-history__description md-subhead">{{ ticket.Description }}</div>' +
                        '<div class="ticket-history__creator md-caption">&nbsp;by&nbsp;{{ ticket.Creator }}</div>' +
                    '</div>' +
                    '<div class="ticket-history__message ticket-history__message--first" ng-bind-html="firstMessage|nl2br"></div>' +
                    '<div class="ticket-history__message ticket-history__more ng-hide" ng-show="showMore && moreMessages.length > 0" layout="row" layout-sm="column" ng-bind-html="moreMessagesHtml"></div>' +
                    '<div class="ticket-history__show-btn md-caption ng-hide" ng-show="!showMore && moreMessages.length > 0" ng-click="showMore = true"><i class="fa fa-bars fa-lg"></i>&nbsp;Expand</div>' +
                    '<div class="ticket-history__hide-btn md-caption ng-hide" ng-show="showMore && moreMessages.length > 0" ng-click="showMore = false"><i class="fa fa-close fa-lg"></i>&nbsp;Hide</div>' +
                    '<md-divider></md-divider>' +
                '</div>',
            scope: {
                ticket: '=ticketHistory'
            },
            link: function(scope) {
                scope.showMore = false;
                scope.firstMessage = angular.isArray(scope.ticket.Content) ?
                    scope.ticket.Content[0] : scope.ticket.Content;
                scope.moreMessages = angular.isArray(scope.ticket.Content) && scope.ticket.Content.length > 1 ? scope.ticket.Content.slice(1) : [];
                scope.moreMessagesHtml = '';

                if (scope.moreMessages.length == 0) {
                    return;
                }

                scope.moreMessagesHtml = '<ul>';
                scope.moreMessages.forEach(function(message) {
                    scope.moreMessagesHtml += recursiveMessages(message);
                });
                scope.moreMessagesHtml += '</ul>';
            }
        };
    });
})(angular);