'use strict';

describe('Controller: GridsterCtrl', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var gridster,
		scope,
		item1x1,
		item2x1,
		item1x2,
		item2x2;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		gridster = $controller('GridsterCtrl', {
			$scope: scope
		});
		item1x1 = { sizeX: 1, sizeY: 1, id: '1x1' };
		item2x1 = { sizeX: 2, sizeY: 1, id: '2x1' };
		item2x2 = { sizeX: 2, sizeY: 2, id: '2x2' };
		item1x2 = { sizeX: 1, sizeY: 2, id: '1x2' };
	}));

	it('should have a grid Array', function() {
		expect(gridster.grid.constructor).toBe(Array);
	});

	describe('setOpts', function(){
		it('should set properties', function() {
			gridster.setOpts({
				width: 1200,
				colWidth: 120,
				rowHeight: 120,
				columns: 7,
				margins: [15, 15],
				maxRows: 500
			});

			expect(gridster.width).toBe(1200);
			expect(gridster.colWidth).toBe(120);
			expect(gridster.rowHeight).toBe(120);
			expect(gridster.columns).toBe(7);
			expect(gridster.margins).toEqual([15, 15]);
			expect(gridster.maxRows).toBe(500);
		});
	});

	describe('setRowHeight', function(){
		it('should set the value if valid integer or "match"', function() {
			var oldColWidth = gridster.rowHeight;
			gridster.setRowHeight('abc');
			expect(gridster.rowHeight).toBe(oldColWidth);

			gridster.setColumns(6);
			gridster.setMargins([0, 0]);
			gridster.setWidth(1200);
			gridster.setColWidth('auto');

			gridster.setRowHeight('match');
			expect(gridster.rowHeight).toBe(200);

			gridster.setRowHeight(100);
			expect(gridster.rowHeight).toBe(100);
		});

		it('should only set the value if not falsey', function() {
			var oldColWidth = gridster.rowHeight;
			gridster.setRowHeight(0);
			expect(gridster.rowHeight).toBe(oldColWidth);
		});
	});

	describe('setColWidth', function(){
		it('should set the value if valid integer or "auto"', function() {
			var oldColWidth = gridster.colWidth;
			gridster.setColWidth('abc');
			expect(gridster.colWidth).toBe(oldColWidth);

			gridster.setColumns(6);
			gridster.setMargins([0, 0]);
			gridster.setWidth(1200);
			gridster.setColWidth('auto');
			expect(gridster.colWidth).toBe(200);

			gridster.setColWidth(100);
			expect(gridster.colWidth).toBe(100);
		});

		it('should only set the value if not falsey', function() {
			var oldColWidth = gridster.colWidth;
			gridster.setColWidth(0);
			expect(gridster.colWidth).toBe(oldColWidth);
		});
	});

	describe('setMaxRows', function(){
		it('should only set the value if valid integer', function() {
			var oldMaxRows = gridster.maxRows;
			gridster.setMaxRows('abc');
			expect(gridster.maxRows).toBe(oldMaxRows);

			gridster.setMaxRows(123);
			expect(gridster.maxRows).not.toBe(oldMaxRows);
			expect(gridster.maxRows).toBe(123);
		});

		it('should only set the value if not falsey', function() {
			var oldMaxRows = gridster.maxRows;
			gridster.setMaxRows(0);
			expect(gridster.maxRows).toBe(oldMaxRows);
		});
	});

	describe('putItem', function(){
		it('should be place an item', function() {
			gridster.putItem(item1x1, 0, 0);
			expect(gridster.getItem(0, 0)).toBe(item1x1);
		});

		it('should place an item without a position', function() {
			gridster.putItem(item1x1);
			expect(gridster.getItem(0, 0)).toBe(item1x1);
		});

		it('should not allow items to be placed with negative indices', function() {
			gridster.putItem(item1x1, -1, -1);
			expect(gridster.getItem(0, 0)).toBe(item1x1);
			expect(item1x1.row).toBe(0);
			expect(item1x1.col).toBe(0);
		});

		it('should not float items until told to', function() {
			gridster.putItem(item1x1, 3, 0);
			expect(gridster.getItem(0, 0)).toBe(null);
			expect(gridster.getItem(3, 0)).toBe(item1x1);
		});

		it('should not create two references to the same item', function() {
			gridster.putItem(item1x1, 0, 0);
			expect(gridster.getItem(0, 0)).toBe(item1x1);
			gridster.putItem(item1x1, 0, 4);
			expect(gridster.getItem(0, 4)).toBe(item1x1);
			expect(gridster.getItem(0, 0)).toBe(null);
		});
	});

	describe('getItem', function(){
		it('should match any column of a multi-column item', function(){
			gridster.putItem(item2x2, 0, 2);

			// all 4 corners should return the same item
			expect(gridster.getItem(0, 2)).toBe(item2x2);
			expect(gridster.getItem(1, 2)).toBe(item2x2);
			expect(gridster.getItem(0, 3)).toBe(item2x2);
			expect(gridster.getItem(1, 3)).toBe(item2x2);
		});
	});

	describe('getItems', function(){
		it('should get items within an area', function(){
			gridster.putItem(item2x2, 0, 1);
			gridster.putItem(item2x1, 2, 0);

			// verify they are still where we put them
			expect(gridster.getItem(0, 1)).toBe(item2x2);
			expect(gridster.getItem(2, 0)).toBe(item2x1);

			var items = gridster.getItems(1, 0, 2, 1);
			expect(items.length).toBe(1);
			expect(items[0]).toBe(item2x2);
		});
	});

	describe('floatItemsUp', function(){
		it('should float an item up', function() {
			gridster.putItem(item1x1, 3, 0);
			gridster.floatItemsUp();
			expect(gridster.getItem(0, 0)).toBe(item1x1);
		});

		it('should stack items when they float up', function() {
			gridster.putItem(item1x1, 3, 0);
			gridster.floatItemsUp();
			expect(gridster.getItem(0, 0)).toBe(item1x1);

			gridster.putItem(item2x1, 3, 0);
			gridster.floatItemsUp();
			expect(gridster.getItem(1, 0)).toBe(item2x1);

			gridster.putItem(item1x1, 3, 1);
			gridster.floatItemsUp();
			expect(gridster.getItem(1, 1)).toBe(item1x1);
		});

		it('should correctly stack multi-column items when their primary coordinates do not stack', function(){
			gridster.putItem(item2x2, 0, 2);
			gridster.putItem(item2x1, 2, 1);

			// verify they are still where we put them
			expect(gridster.getItem(0, 2)).toBe(item2x2);
			expect(gridster.getItem(2, 1)).toBe(item2x1);

			// allow them to float up
			gridster.floatItemsUp();

			// verify they are still where we put them
			expect(gridster.getItem(0, 2)).toBe(item2x2);
			expect(gridster.getItem(2, 1)).toBe(item2x1);
		});
	});

	describe('moveOverlappingItems', function(){
		it('should correctly stack items on resize when their primary coordinates do not stack', function(){
			gridster.putItem(item1x1, 0, 0);
			gridster.putItem(item2x2, 0, 2);
			gridster.putItem(item2x1, 1, 0);

			// verify they are still where we put them
			expect(gridster.getItem(0, 0)).toBe(item1x1);
			expect(gridster.getItem(0, 2)).toBe(item2x2);
			expect(gridster.getItem(1, 0)).toBe(item2x1);

			item2x1.sizeX = 3;
			gridster.moveOverlappingItems(item2x1);
			expect(gridster.getItem(1, 2)).toBe(item2x1);

			expect(item2x2.row).toBe(2);
		});

		it('should correctly push items down', function(){
			gridster.putItem(item2x2, 0, 0);
			gridster.putItem(item1x1, 2, 0);
			gridster.putItem(item1x2, 1, 1);
			gridster.floatItemsUp();

			// verify they are still where we put them
			expect(gridster.getItem(2, 0)).toBe(item2x2);
			expect(gridster.getItem(0, 0)).toBe(item1x1);
			expect(gridster.getItem(0, 1)).toBe(item1x2);
		});
	});
});