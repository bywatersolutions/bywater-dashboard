(function(angular) {
	'use strict';

	angular.module('dashboardApp').controller('reportsCtrl', function($scope, $http, $log) {
		$scope.config = [];

		$scope.query = 0;
		$scope.department = undefined;
		$scope.grouping = "";

		$http.post('/json/reports/get', {}).then( function(response) {
			$scope.config = response.data.config;
			$scope.update_data();
		} );

		$scope.update_data = function () {
			$http.post('/json/reports/get_data', { query: $scope.query, department: $scope.department } ).then( function(response) {
				console.log( response.data );
				var tickets = response.data.tickets;

				var keys = {};
				var groups = {};
				var data = {};
				for ( var ticket_id in tickets ) {
					var ticket = tickets[ ticket_id ];
					var date = new Date( ticket.Created );
					var key = ( 1900 + date.getYear() ) + "-" + date.getMonth() + "-" + date.getDate();
					var group;

					if ( !$scope.grouping ) {
						group = "All";
					} else {
						group = ticket[ $scope.grouping ];
					}

					if ( !data[ group ] ) data[ group ] = {};
					if ( !data[ group ][ key ] ) data[ group ][ key ] = [];
					data[ group ][ key ].push( ticket );

					keys[ key ] = 1;
					groups[ group ] = 1;
				}

				keys   = Object.keys(keys  ).sort(function(a,b){ return a.localeCompare(b); });
				groups = Object.keys(groups).sort(function(a,b){ return a.localeCompare(b); });

				$scope.tickets = data;

				var chart_data = [];
				for ( var group_idx in groups ) {
					var group = groups[ group_idx ];
					var serie = [];
					for ( var key_idx in keys ) {
						var key = keys[ key_idx ];
						if ( !data[ group ] || !data[ group ][ key ] ) {
							serie.push( 0 );
						} else {
							serie.push( data[ group ][ key ].length );
							if ( !$scope.tickets[ group ] ) $scope.tickets[ group ] = {};
						}
					}
					chart_data.push( serie );
				}

				$scope.labels = keys;
				$scope.series = groups;
				$scope.data = chart_data;
			} );
		}

		$scope.onClick = function (points, evt) {
			console.log(points, evt);
		};
	});
})(angular);