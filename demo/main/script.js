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
		outerMargin: false,
		pushing: true,
		floating: true,
		draggable: {
			enabled: false
		},
		resizable: {
			enabled: false,
			handles: ['n', 'e', 's', 'w', 'se', 'sw']
		}
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

	// map the gridsterItem to the custom item structure
	$scope.customItemMap = {
		sizeX: 'item.size.x',
		sizeY: 'item.size.y',
		row: 'item.position[0]',
		col: 'item.position[1]'
	};

	$scope.noSparseGridsterOpts = {
		sparse: true,
		pushing: true,
		floating: true,
		swapping: true,
		width: 'auto',
		columns: 24,
		colWidth: 'auto',
		minColumns: 1,
		rowHeight: 8,
		minRows: 5,
		maxRows: 1000,
		defaultSizeX: 6,
		defaultSizeY: 7,
		margins: [8, 8],
		outerMargin: true,
		mobileBreakPoint: 512,
		mobileModeEnabled: true,
		saveGridItemCalculatedHeightInMobile: true,
		resizable: {
			enabled: true,
			handles: ['s', 'e', 'n', 'w', 'se', 'ne', 'sw', 'nw']
		},
		draggable: {
			enabled: true,
			scrollSensitivity: 20,
			scrollSpeed: 20
		}
	};
	$scope.sparseGridsterOpts = angular.copy($scope.noSparseGridsterOpts);
	$scope.sparseGridsterOpts.sparse = true;

	$scope.noSparseItems = [{
		sizeX: 6,
		sizeY: 7,
		row: 0,
		col: 0
	}, {
		sizeX: 6,
		sizeY: 7,
		row: 0,
		col: 6
	}, {
		sizeX: 6,
		sizeY: 7,
		row: 0,
		col: 12
	}, {
		sizeX: 6,
		sizeY: 7,
		row: 0,
		col: 18
	}, {
		sizeX: 12,
		sizeY: 12,
		row: 7,
		col: 0
	}, {
		sizeX: 12,
		sizeY: 12,
		row: 7,
		col: 12
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 0
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 4
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 8
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 12
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 16
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 19,
		col: 20
	}, {
		sizeX: 24,
		sizeY: 14,
		row: 26,
		col: 0
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 0
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 4
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 8
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 12
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 16
	}, {
		sizeX: 4,
		sizeY: 7,
		row: 40,
		col: 20
	}];
	$scope.sparseItems = angular.copy($scope.noSparseItems);

});
