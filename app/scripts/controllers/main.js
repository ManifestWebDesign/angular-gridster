'use strict';

angular.module('app')

.controller('MainCtrl', function($scope) {

	$scope.gridsterOpts = {
		margins: [20, 20]
	};

	// these map directly to gridsterItem options
	$scope.standardItems = [
		{ width: 2, height: 1, row: 0, column: 0 },
		{ width: 2, height: 2, row: 0, column: 2 },
		{ width: 1, height: 1, row: 0, column: 4 },
		{ width: 1, height: 1, row: 0, column: 5 },
		{ width: 2, height: 1, row: 1, column: 0 },
		{ width: 1, height: 1, row: 1, column: 4 },
		{ width: 1, height: 2, row: 1, column: 5 },
		{ width: 1, height: 1, row: 2, column: 0 },
		{ width: 2, height: 1, row: 2, column: 1 },
		{ width: 1, height: 1, row: 2, column: 3 },
		{ width: 1, height: 1, row: 2, column: 4 }
	];

	// these are non-standard, so they require mapping options
	$scope.customItems = [
		{ size: { x: 2, y: 1 }, position: [0, 0] },
		{ size: { x: 2, y: 2 }, position: [0, 2] },
		{ size: { x: 1, y: 1 }, position: [0, 4] },
		{ size: { x: 1, y: 1 }, position: [0, 5] },
		{ size: { x: 2, y: 1 }, position: [1, 0] },
		{ size: { x: 1, y: 1 }, position: [1, 4] },
		{ size: { x: 1, y: 2 }, position: [1, 5] },
		{ size: { x: 1, y: 1 }, position: [2, 0] },
		{ size: { x: 2, y: 1 }, position: [2, 1] },
		{ size: { x: 1, y: 1 }, position: [2, 3] },
		{ size: { x: 1, y: 1 }, position: [2, 4] }
	];

	$scope.emptyItems = [
		{ name: 'Item1' },
		{ name: 'Item2' },
		{ name: 'Item3' },
		{ name: 'Item4' }
	];

	// map the gridsterItem to the custom item structure
	$scope.customItemMap = {
		width: 'item.size.x',
		height: 'item.size.y',
		row: 'item.position[0]',
		column: 'item.position[1]'
	};

});