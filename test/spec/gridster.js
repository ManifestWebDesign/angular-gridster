'use strict';

describe('Controller: GridsterCtrl', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var gridster,
		scope,
		item1x1,
		item2x1,
		item2x2,
		opts;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		gridster = $controller('GridsterCtrl', {
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
		item1x1 = { width: 1, height: 1 };
		item2x1 = { width: 2, height: 1 };
		item2x2 = { width: 2, height: 2 };
		gridster.init(null, null, opts);
		gridster.initializing = false;
	}));

	it('should have a grid Array', function() {
		expect(gridster.grid.constructor).toBe(Array);
	});

	describe('putItem', function(){
		it('should be place an item', function() {
			gridster.putItem(item1x1, [0, 0]);
			expect(gridster.getItem([0, 0])).toBe(item1x1);
		});

		it('should place an item without a position', function() {
			gridster.putItem(item1x1);
			expect(gridster.getItem([0, 0])).toBe(item1x1);
		});

		it('should float an item up', function() {
			gridster.putItem(item1x1, [3, 0]);
			expect(gridster.getItem([0, 0])).toBe(item1x1);
		});

		it('should stack items when they float up', function() {
			gridster.putItem(item1x1, [3, 0]);
			expect(gridster.getItem([0, 0])).toBe(item1x1);

			gridster.putItem(item2x1, [3, 0]);
			expect(gridster.getItem([1, 0])).toBe(item2x1);

			gridster.putItem(item1x1, [3, 1]);
			expect(gridster.getItem([1, 1])).toBe(item1x1);
		});

		it('should not float items if initializing', function() {
			gridster.initializing = true;
			gridster.putItem(item1x1, [3, 0]);
			expect(gridster.getItem([0, 0])).toBe(null);
			expect(gridster.getItem([3, 0])).toBe(item1x1);
		});

		it('should not create two references to the same item', function() {
			gridster.putItem(item1x1, [0, 0]);
			expect(gridster.getItem([0, 0])).toBe(item1x1);
			gridster.putItem(item1x1, [0, 5]);
			expect(gridster.getItem([0, 0])).toBe(null);
			expect(gridster.getItem([0, 5])).toBe(item1x1);
		});
	});

	describe('getItem', function(){
		it('should match any column of a multi-column item', function(){
			gridster.initializing = true;
			gridster.putItem(item2x2, [0, 2]);

			// all 4 corners should return the same item
			expect(gridster.getItem([0, 2])).toBe(item2x2);
			expect(gridster.getItem([1, 2])).toBe(item2x2);
			expect(gridster.getItem([0, 3])).toBe(item2x2);
			expect(gridster.getItem([1, 3])).toBe(item2x2);
		});
	});

	describe('getItems', function(){
		it('should ', function(){
			gridster.initializing = true;
			gridster.putItem(item2x2, [0, 1]);
			gridster.putItem(item2x1, [2, 0]);

			// verify they are still where we put them
			expect(gridster.getItem([0, 1])).toBe(item2x2);
			expect(gridster.getItem([2, 0])).toBe(item2x1);

			var items = gridster.getItems([1, 0], 2, 1);
			expect(items.length).toBe(1);
			expect(items[0]).toBe(item2x2);
		});
	});

	describe('floatItemsUp', function(){
		it('should correctly stack multi-column items when their primary coordinates do not stack', function(){
			gridster.initializing = true;
			gridster.putItem(item2x2, [0, 2]);
			gridster.putItem(item2x1, [2, 1]);

			// verify they are still where we put them
			expect(gridster.getItem([0, 2])).toBe(item2x2);
			expect(gridster.getItem([2, 1])).toBe(item2x1);

			// allow them to float up
			gridster.initializing = false;
			gridster.floatItemsUp();

			// verify they are still where we put them
			expect(gridster.getItem([0, 2])).toBe(item2x2);
			expect(gridster.getItem([2, 1])).toBe(item2x1);
		});
	});

	describe('moveOverlappingItems', function(){
		it('should correctly stack items on resize when their primary coordinates do not stack', function(){
			gridster.initializing = true;
			gridster.putItem(item1x1, [0, 0]);
			gridster.putItem(item2x2, [0, 2]);
			gridster.putItem(item2x1, [1, 0]);

			// verify they are still where we put them
			expect(gridster.getItem([0, 0])).toBe(item1x1);
			expect(gridster.getItem([0, 2])).toBe(item2x2);
			expect(gridster.getItem([1, 0])).toBe(item2x1);

			item2x1.width = 3;
			gridster.moveOverlappingItems(item2x1);
			expect(gridster.getItem([1, 2])).toBe(item2x1);

			expect(item2x2.position[0]).toBe(2);
		});
	});
});