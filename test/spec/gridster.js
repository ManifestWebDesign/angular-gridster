'use strict';

describe('Controller: GridsterCtrl', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var GridsterCtrl,
		scope,
		item1x1,
		item2x1,
		opts;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		GridsterCtrl = $controller('GridsterCtrl', {
			$scope: scope
		});
		opts = {
			colWidth: 100,
			rowHeight: 100,
			columns: 6,
			margins: [10, 10],
			defaultHeight: 1,
			defaultWidth: 2,
			minRows: 2,
			maxRows: 100,
			mobileBreakPoint: 600
		};
		item1x1 = {
			width: 1,
			height: 1
		};
		item2x1 = {
			width: 2,
			height: 1
		};
		GridsterCtrl.init(null, null, opts);
		GridsterCtrl.initializing = false;
	}));

	it('should have a grid Array', function() {
		expect(GridsterCtrl.grid.constructor).toBe(Array);
	});

	it('should be able to place an item', function() {
		GridsterCtrl.putItem(item1x1, [0, 0]);
		expect(GridsterCtrl.getItem([0, 0])).toBe(item1x1);
	});

	it('should be able to place an item without a position', function() {
		GridsterCtrl.putItem(item1x1);
		expect(GridsterCtrl.getItem([0, 0])).toBe(item1x1);
	});

	it('should float an item up', function() {
		GridsterCtrl.putItem(item1x1, [3, 0]);
		expect(GridsterCtrl.getItem([0, 0])).toBe(item1x1);
	});

	it('should stack items when they float up', function() {
		GridsterCtrl.putItem(item1x1, [3, 0]);
		expect(GridsterCtrl.getItem([0, 0])).toBe(item1x1);

		GridsterCtrl.putItem(item2x1, [3, 0]);
		expect(GridsterCtrl.getItem([1, 0])).toBe(item2x1);

		GridsterCtrl.putItem(item1x1, [3, 1]);
		expect(GridsterCtrl.getItem([1, 1])).toBe(item1x1);
	});

	it('should not float items if initializing', function() {
		GridsterCtrl.initializing = true;
		GridsterCtrl.putItem(item1x1, [3, 0]);
		expect(GridsterCtrl.getItem([0, 0])).not.toBe(item1x1);
	});
});