angular.module('app')

.controller('DashboardCtrl', ['$scope', '$timeout',
	function($scope, $timeout) {
		var setIframeHeight = function(el, height) {
			var frames = el.getElementsByTagName('iframe');
			if (frames.length) {
				frames[0].style.height = (height - 2) + 'px';
			}
		};

		$scope.$on('gridster.loaded', function() {
			//setTimeout(function() {
				//var els = document.getElementsByClassName('gridster-item');
				//for (var i=0, l=els.length; i<l; i++) {
					//var height = els[i].offsetHeight;

					//setIframeHeight(els[i], height);
				//}
			//}, 500);
		});

		$scope.gridsterOptions = {
			margins: [20, 20],
			trackByProperty: 'name',
			resizable: {
				onmove: function(e, $el, size) {
					setIframeHeight($el[0], size.height);
				}
			},
			updates: {
				height: setIframeHeight
			}
		};

		$scope.dashboards = DASHBOARDS;

		$scope.gridster = {};

		$scope.$on('gridster.item_changed', function(e, item) {
			// update your dashboard on this event
			// you probably want to debounce it since it gets fired a lot
			console.log('item changed', item);
		});

		$scope.clear = function() {
			$scope.dashboard.widgets = [];
		};

		$scope.addWidget = function() {
			var newItem = {
				name: "New Widget" + ($scope.dashboard.widgets.length + 1)
			};

			console.log('save item to server', newItem);

			$scope.dashboard.widgets.push(newItem);
		};

		$scope.dashboard = $scope.dashboards[0];
	}
])

.controller('CustomWidgetCtrl', ['$scope', '$modal', '$timeout', '$sce',
	function($scope, $modal, $timeout, $sce) {

		console.log($scope);

		$scope.remove = function() {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(scope.item), 1);
		};

		$scope.style = {
			'background-image': 'url("' + $scope.item.src +'")'
		};

		$scope.src = $sce.trustAsResourceUrl($scope.item.src);

		$scope.openSettings = function() {
			alert('click');
			$modal.open({
				scope: $scope,
				templateUrl: 'demo/dashboard/widget_settings.html',
				controller: 'WidgetSettingsCtrl',
				resolve: {
					widget: function() {
						return $scope.item;
					}
				}
			});
		};

	}
])

.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget',
	function($scope, $timeout, $rootScope, $modalInstance, widget) {
		$scope.widget = widget;

		$scope.form = {
			name: widget.name,
			sizeX: widget.sizeX,
			sizeY: widget.sizeY,
			col: widget.col,
			row: widget.row
		};

		$scope.sizeOptions = [{
			id: '1',
			name: '1'
		}, {
			id: '2',
			name: '2'
		}, {
			id: '3',
			name: '3'
		}, {
			id: '4',
			name: '4'
		}];

		$scope.dismiss = function() {
			$modalInstance.dismiss();
		};

		$scope.remove = function() {
			$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
			$modalInstance.close();
		};

		$scope.submit = function() {
			angular.extend(widget, $scope.form);

			$modalInstance.close(widget)
		};

	}
])

// helper code
.filter('object2Array', function() {
	return function(input) {
		var out = [];
		for (i in input) {
			out.push(input[i]);
		}
		return out;
	}
});
