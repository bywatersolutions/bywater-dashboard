(function(angular) {
	'use strict';

	angular.module('dashboardApp').controller('reportsCtrl', function($scope, $http, $log) {
		$scope.config = [];

		$scope.query = 0;
		$scope.department = "";
		$scope.grouping = "";
		$scope.is_loaded = false;

		$http.post('/json/reports/get', {}).then( function(response) {
			$scope.config = response.data.config;
			$scope.update_data();
		} );

		$scope.update_data = function () {
			$scope.is_loaded = false;
			$http.post('/json/reports/get_data', { query: $scope.query, department: $scope.department } ).then( function(response) {
				var tickets = response.data.tickets;
				$scope.is_loaded = true;

				var keys = {};
				var groups = {};
				var data = {};
				for ( var ticket_id in tickets ) {
					var ticket = tickets[ ticket_id ];
					var date = new Date( ticket.Created );
					var key = date.toISOString().substring(0, 10);
					
					ticket["DateCreated"] = key;
					
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
					groups[ group ] = true;
				}
				
				$scope.keys = keys;
				$scope.groups = groups;
				$scope.data = data;
				
				$scope.update_chart();
			} );
		};
		
		$scope.update_chart = function() {
			var canvas = document.getElementById('line');
			if (canvas){
				var ctx = canvas.getContext('2d');
				ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
			}

			var keys = Object.keys( $scope.keys ).sort(function(a,b){ return a.localeCompare(b); });
			
			var groups = [];
			angular.forEach( $scope.groups, function(value, key) {
				if ( value != 1 ) return;
				this.push(key);
			}, groups);
			//groups = Object.keys(groups).sort(function(a,b){ return a.localeCompare(b); });
			
			var data = $scope.data;

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
						if ( !$scope.data[ group ] ) $scope.data[ group ] = {};
					}
				}
				chart_data.push( serie );
			}
			
			$scope.labels = keys;
			$scope.series = groups;
			$scope.chart_data = chart_data;
		}
		
		$scope.checkbox_change = function () {
			$scope.update_chart();
		}

		$scope.onClick = function (points, evt) {
			console.log(points, evt);
		};
	});
})(angular);
