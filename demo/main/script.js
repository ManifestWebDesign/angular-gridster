angular.module('app')

.directive('integer', function() {
	return {
		require: 'ngModel',
		link: function(scope, ele, attr, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (viewValue === '' || viewValue === null || typeof viewValue === 'undefined') {
					return null;
				}
				return parseInt(viewValue, 10);
			});
		}
	};
})

.controller('MainCtrl', function($scope) {

	$scope.gridsterOpts = {
		margins: [20, 20],
		draggable: {
			enabled: false
		},
		resizable: {
			enabled: false
		}
	};

	$scope.gridsterOpts1 = {
		fields: ['position[0]', 'position[1]', 'size.x', 'size.y']
	};

	// these map directly to gridsterItem options
	$scope.standardItems = [{
		sizeX: 2,
		sizeY: 1,
		row: 0,
		col: 0
	}, {
		sizeX: 2,
		sizeY: 2,
		row: 0,
		col: 2
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 0,
		col: 4
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 0,
		col: 5
	}, {
		sizeX: 2,
		sizeY: 1,
		row: 1,
		col: 0
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 1,
		col: 4
	}, {
		sizeX: 1,
		sizeY: 2,
		row: 1,
		col: 5
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 2,
		col: 0
	}, {
		sizeX: 2,
		sizeY: 1,
		row: 2,
		col: 1
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 2,
		col: 3
	}, {
		sizeX: 1,
		sizeY: 1,
		row: 2,
		col: 4
	}];

	// these are non-standard, so they require mapping options
	$scope.customItems = [{
		size: {
			x: 2,
			y: 1
		},
		position: [0, 0]
	}, {
		size: {
			x: 2,
			y: 2
		},
		position: [0, 2]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [0, 4]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [0, 5]
	}, {
		size: {
			x: 2,
			y: 1
		},
		position: [1, 0]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [1, 4]
	}, {
		size: {
			x: 1,
			y: 2
		},
		position: [1, 5]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [2, 0]
	}, {
		size: {
			x: 2,
			y: 1
		},
		position: [2, 1]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [2, 3]
	}, {
		size: {
			x: 1,
			y: 1
		},
		position: [2, 4]
	}];

	$scope.emptyItems = [{
		name: 'Item1'
	}, {
		name: 'Item2'
	}, {
		name: 'Item3'
	}, {
		name: 'Item4'
	}];

});
