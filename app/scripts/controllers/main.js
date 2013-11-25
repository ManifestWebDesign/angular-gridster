'use strict';

angular.module('app')

	.controller('MainCtrl', function($scope) {

		$scope.items = [
			{
				size: { width: 2, height: 1 },
				position: [0, 0]
			},
			{
				size: { width: 2, height: 2 },
				position: [0, 2]
			},
			{
				size: { width: 1, height: 1 },
				position: [0, 4]
			},
			{
				size: { width: 1, height: 1 },
				position: [0, 5]
			},
			{
				size: { width: 2, height: 1 },
				position: [1, 0]
			},
			{
				size: { width: 1, height: 1 },
				position: [1, 4]
			},
			{
				size: { width: 1, height: 2 },
				position: [1, 5]
			},
			{
				size: { width: 1, height: 1 },
				position: [2, 0]
			},
			{
				size: { width: 2, height: 1 },
				position: [2, 1]
			},
			{
				size: { width: 1, height: 1 },
				position: [2, 3]
			},
			{
				size: { width: 1, height: 1 },
				position: [2, 4]
			}
		];

		$scope.gridsterItemOpts = {
			width: 'item.size.width',
			height: 'item.size.height',
			position: 'item.position'
		};

		$scope.gridsterOpts = {
			margins: [20, 20]
		};

	});