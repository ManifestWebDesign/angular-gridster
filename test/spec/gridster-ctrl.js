'use strict';

describe('GridsterCtrl:', function() {
	var GridsterCtrl,
		$gridElement,
		previewElement,
		itemElement,
		item1x1,
		item2x1,
		item2x2,
		item1x2,
		item3x1,
		scope,
		options;

	var setMode = function(mode) {
		switch (mode) {
			case 'desktop':
				$gridElement.width(1300);
				break;
			case 'tablet':
				$gridElement.width(1024);
				break;
			case 'mobile':
				$gridElement.width(300);
				break;
		}

		GridsterCtrl.resolveOptions();
	};

	beforeEach(module('gridster'));

	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();

		item1x1 = {
			id: '1x1',
			desktop: {
				row: 0,
				col: 0,
				sizeX: 3,
				sizeY: 3
			},
			tablet: {
				row: 0,
				col: 0,
				sizeX: 4,
				sizeY: 4
			},
			mobile: {
				row: 0
			}
		};
		item2x1 = {
			id: '2x1',
			desktop: {
				row: 0,
				col: 1,
				sizeX: 6,
				sizeY: 3
			},
			tablet: {
				row: 0,
				col: 1,
				sizeX: 6,
				sizeY: 3
			},
			mobile: {
				row: 1
			}
		};
		item2x2 = {
			id: '2x2',
			desktop: {
				row: 0,
				col: 3,
				sizeX: 6,
				sizeY: 6
			},
			tablet: {
				row: 0,
				col: 3,
				sizeX: 8,
				sizeY: 8
			},
			mobile: {
				row: 2
			}
		};
		item1x2 = {
			id: '1x2',
			desktop: {
				row: 1,
				col: 0,
				sizeX: 3,
				sizeY: 6
			},
			tablet: {
				row: 1,
				col: 0,
				sizeX: 4,
				sizeY: 8
			},
			mobile: {
				row: 3
			}
		};
		item3x1 = {
			id: '3x1',
			desktop: {
				row: 1,
				col: 9,
				sizeX: 9,
				sizeY: 3
			},
			tablet: {
				row: 1,
				col: 9,
				sizeX: 12,
				sizeY: 4
			},
			mobile: {
				row: 4
			}
		};

		scope.items = [item1x1, item2x1, item2x2, item1x2, item3x1];

		GridsterCtrl = $controller('GridsterCtrl', {
			$scope: scope
		});

		$gridElement = $('<div id="grid" class="gridster" style="width: 1300px"><div class="gridster-preview-holder"></div></div>');
		previewElement = $gridElement.find('.gridster-preview-holder')[0];

		itemElement = $('<div></div>')[0];

		$('body').append($gridElement);

		GridsterCtrl.init($gridElement);

		angular.extend(scope.options, options);

		GridsterCtrl.resolveOptions();

	}));

	afterEach(function() {
		$('#grid').remove();
	});

	describe('options', function() {
		it('should set default options', function() {
			expect(GridsterCtrl.getOption('width')).toBe('auto');
			expect(GridsterCtrl.getOption('colWidth')).toBe('auto');
			expect(GridsterCtrl.getOption('rowHeight')).toBe('match');
			expect(GridsterCtrl.getOption('margins')).toEqual([10, 10]);
			expect(GridsterCtrl.getOption('minRows')).toBe(3);
			expect(GridsterCtrl.getOption('defaultSizeX')).toBe(3);
			expect(GridsterCtrl.getOption('defaultSizeY')).toBe(3);
		});

		it('should update options', function() {
			angular.extend(scope.options, {
				width: 1200,
				colWidth: 120,
				rowHeight: 140,
				margins: [15, 15]
			});

			GridsterCtrl.resolveOptions();

			expect(GridsterCtrl.getOption('width')).toBe(1200);
			expect(GridsterCtrl.getOption('colWidth')).toBe(120);
			expect(GridsterCtrl.getOption('curColWidth')).toBe(120);
			expect(GridsterCtrl.getOption('rowHeight')).toBe(140);
			expect(GridsterCtrl.getOption('curRowHeight')).toBe(140);
			expect(GridsterCtrl.getOption('margins')).toEqual([15, 15]);
		});
	});

	describe('resolveOptions:', function() {
		it('Default: should resolve "auto" & "match" options', function() {
			GridsterCtrl.resolveOptions();
			expect(GridsterCtrl.getOption('curWidth')).toBe(1300);
			expect(GridsterCtrl.getOption('curColWidth')).toBe(107.5);
			expect(GridsterCtrl.getOption('curRowHeight')).toBe(107.5);
			expect(GridsterCtrl.getOption('columns')).toBe(12);

			setMode('tablet');

			expect(GridsterCtrl.getOption('curWidth')).toBe(1024);
			expect(GridsterCtrl.getOption('curColWidth')).toBe(84.5);
			expect(GridsterCtrl.getOption('curRowHeight')).toBe(84.5);
			expect(GridsterCtrl.getOption('columns')).toBe(12);

			setMode('mobile');

			expect(GridsterCtrl.getOption('curWidth')).toBe(300);
			expect(GridsterCtrl.getOption('curColWidth')).toBe(50);
			expect(GridsterCtrl.getOption('curRowHeight')).toBe(50);
			expect(GridsterCtrl.getOption('columns')).toBe(6);
		});

		it('should add mode class to grid element', function() {
			expect($gridElement.hasClass('gridster-desktop')).toBe(true);

			setMode('tablet');

			expect($gridElement.hasClass('gridster-desktop')).toBe(false);
			expect($gridElement.hasClass('gridster-tablet')).toBe(true);
		});

		it('should  options', function() {

		});
	});

	describe('isItemInArea:', function() {
		it('should return true if item occupies a portion of the area', function() {
			expect(GridsterCtrl.isItemInArea(item1x1, 0, 0, 1, 1)).toBe(true);
			//expect(GridsterCtrl.isItemInArea(item1x1, 0, 1, 5, 5)).toBe(false); // outside left
			//expect(GridsterCtrl.isItemInArea(item1x1, 1, 0, 5, 5)).toBe(false); // outside top

			//expect(GridsterCtrl.isItemInArea(item2x1, 0, 0, 2, 2)).toBe(true);
			//expect(GridsterCtrl.isItemInArea(item2x1, 0, 0, 1, 1)).toBe(false); // outside right
			//expect(GridsterCtrl.isItemInArea(item2x1, 2, 2, 1, 1)).toBe(false); // outside top

			//expect(GridsterCtrl.isItemInArea(item1x2, 0, 0, 1, 1)).toBe(false); // outside bottom

			//expect(GridsterCtrl.isItemInArea(item2x2, 0, 3, 1, 1)).toBe(true);
			//expect(GridsterCtrl.isItemInArea(item2x2, 0, 4, 1, 1)).toBe(true);
			//expect(GridsterCtrl.isItemInArea(item2x2, 1, 3, 1, 1)).toBe(true);
			//expect(GridsterCtrl.isItemInArea(item2x2, 1, 4, 1, 1)).toBe(true);
		});

	});

	describe('getItemsInArea:', function() {
		it('should return items within an area', function() {
			expect(GridsterCtrl.getItemsInArea(0, 0, 1, 1).length).toBe(1);
			//expect(GridsterCtrl.getItemsInArea(0, 0, 1, 1)[0]).toEqual(item1x1);

			//expect(GridsterCtrl.getItemsInArea(0, 0, 2, 1).length).toBe(2);
			//expect(GridsterCtrl.getItemsInArea(0, 0, 2, 1)[0]).toEqual(item1x1);
			//expect(GridsterCtrl.getItemsInArea(0, 0, 2, 1)[1]).toEqual(item2x1);

			//expect(GridsterCtrl.getItemsInArea(0, 0, 4, 1).length).toBe(3);
			//expect(GridsterCtrl.getItemsInArea(0, 0, 4, 1)[2]).toEqual(item2x2);
			//expect(GridsterCtrl.getItemsInArea(0, 2, 3, 3).length).toBe(2);
			//expect(GridsterCtrl.getItemsInArea(0, 2, 3, 3)[0]).toEqual(item2x1);
			//expect(GridsterCtrl.getItemsInArea(0, 2, 3, 3)[1]).toEqual(item2x2);

			//expect(GridsterCtrl.getItemsInArea(1, 0, 1, 1).length).toBe(1);
			//expect(GridsterCtrl.getItemsInArea(1, 0, 1, 1)[0]).toEqual(item1x2);
		});

		//it('should be able to exclude items from result', function() {
		//expect(GridsterCtrl.getItemsInArea(0, 0, 6, 6).length).toBe(4);
		//expect(GridsterCtrl.getItemsInArea(0, 0, 6, 6, item1x1).length).toBe(3);
		//expect(GridsterCtrl.getItemsInArea(0, 0, 5, 5, [item1x1, item2x1, item2x2]).length).toBe(1);
		//});
	});

	//describe('canItemOccupy', function() {
	//it('should determine if item can occupy a given space', function() {
	//expect(GridsterCtrl.canItemOccupy(0, 0, 1, 1)).toBe(false);
	//expect(GridsterCtrl.canItemOccupy(0, 2, 1, 1)).toBe(false);
	//expect(GridsterCtrl.canItemOccupy(0, 5, 1, 1)).toBe(true);
	//expect(GridsterCtrl.canItemOccupy(0, 8, 1, 1)).toBe(false);
	//expect(GridsterCtrl.canItemOccupy(99, 5, 1, 1)).toBe(true);
	//expect(GridsterCtrl.canItemOccupy(100, 5, 1, 1)).toBe(false); // past max rows
	//});
	//});

	//describe('getItemProperties', function() {
	//it('should get row from item', function() {
	//expect(GridsterCtrl.getRow(item2x2)).toBe(0);
	//});

	//it('should get col from item', function() {
	//expect(GridsterCtrl.getCol(item2x2)).toBe(3);
	//});

	//it('should get sizeX from item', function() {
	//expect(GridsterCtrl.getSizeX(item2x2)).toBe(2);
	//});

	//it('should get sizeY from item', function() {
	//expect(GridsterCtrl.getSizeY(item2x2)).toBe(2);
	//});
	//});

	//describe('setItemProperties', function() {
	//it('should set row on item', function() {
	//expect(GridsterCtrl.getRow(GridsterCtrl.setRow(item2x2, 4))).toBe(4);
	//});

	//it('should set col on item', function() {
	//expect(GridsterCtrl.getCol(GridsterCtrl.setCol(item2x2, 4))).toBe(4);
	//});

	//it('should set sizeX on item', function() {
	//expect(GridsterCtrl.getSizeX(GridsterCtrl.setSizeX(item2x2, 3))).toBe(3);
	//});
	//it('should set sizeY on item', function() {
	//expect(GridsterCtrl.getSizeY(GridsterCtrl.setSizeY(item2x2, 3))).toBe(3);
	//});

	//it('should not allow col to be set outside of grid', function() {
	//expect(GridsterCtrl.getCol(GridsterCtrl.setCol(item2x2, 10))).toBe(6);
	//});
	//});


	//describe('resolveItem', function() {
	//it('should convert strings to integers', function() {
	//expect(GridsterCtrl.resolveItem({desktop: {row: '10', col: '1', sizeX: '1', sizeY: '1'}})).toEqual({desktop: {row: 10, col: 1, sizeX: 1, sizeY: 1}});

	//});

	//it('should set default sizeX & sizeY values if not provided', function() {
	//expect(GridsterCtrl.resolveItem({desktop: {row: '1', col: '1'}})).toEqual({desktop: {row: 1, col: 1, sizeX: 1, sizeY: 1}});
	//});

	//it('should set next available row & col if not provided', function() {
	//expect(GridsterCtrl.resolveItem({name: 'new'})).toEqual({name: 'new', desktop: {row: 0, col: 5, sizeX: 1, sizeY: 1}});
	//});

	//it('should resolve stupid input', function() {
	//expect(GridsterCtrl.resolveItem({desktop: {row: '-1', col: -1}})).toEqual({desktop: {row: 0, col: 5, sizeX: 1, sizeY: 1}});
	//expect(GridsterCtrl.resolveItem({desktop: {row: 'real', col: 'dumb'}})).toEqual({desktop: {row: 0, col: 5, sizeX: 1, sizeY: 1}});
	//});
	//});

	//describe('getNextPosition', function() {
	//it('should get 0,0 on init', function() {
	//scope.items = [];
	//expect(GridsterCtrl.getNextPosition(1, 1)).toEqual({
	//row: 0,
	//col: 0
	//});
	//});

	//it('should get next open area', function() {
	//expect(GridsterCtrl.getNextPosition(1, 1)).toEqual({ row: 0, col: 5 });
	//});
	//});

	//describe('should resolve position parameters', function() {
	//it('should turn strings into integers', function() {
	//expect(GridsterCtrl.resolveParam('1')).toBe(1);
	//});

	//it('should turn undefined into null', function() {
	//expect(GridsterCtrl.resolveParam()).toBe(null);
	//});

	//it('should turn negative numbers into null', function() {
	//expect(GridsterCtrl.resolveParam(-1)).toBe(null);
	//});

	//it('should set defaults', function() {
	//expect(GridsterCtrl.resolveParam(undefined, 2, 3)).toBe(2);
	//expect(GridsterCtrl.resolveParam(undefined, undefined, 3)).toBe(3);
	//expect(GridsterCtrl.resolveParam(undefined, undefined, undefined)).toBe(null);
	//});
	//});

	//describe('floatItemsUp', function() {
	//beforeEach(function() {
	//spyOn(GridsterCtrl, 'getItemElement').and.returnValue(itemElement);
	//});

	//it('should float an item up', function() {
	//scope.items[0] = GridsterCtrl.setRow(scope.items[0], 6);

	//GridsterCtrl.floatItemsUp();

	//expect(GridsterCtrl.getRow(scope.items[0])).toEqual(3);
	//});

	////it('should not float above

	//it('should maintain stacking order', function() {
	//scope.items[0] = GridsterCtrl.setRow(scope.items[0], 3);
	//scope.items[0] = GridsterCtrl.setCol(scope.items[0], 0);
	//scope.items[1] = GridsterCtrl.setRow(scope.items[1], 4);
	//scope.items[1] = GridsterCtrl.setCol(scope.items[1], 0);
	//scope.items[2] = GridsterCtrl.setRow(scope.items[2], 7);
	//scope.items[2] = GridsterCtrl.setCol(scope.items[2], 0);
	//scope.items[3] = GridsterCtrl.setRow(scope.items[3], 10);
	//scope.items[3] = GridsterCtrl.setCol(scope.items[3], 0);
	//scope.items[4] = GridsterCtrl.setRow(scope.items[4], 13);
	//scope.items[4] = GridsterCtrl.setCol(scope.items[4], 0);

	//GridsterCtrl.orderItems();

	//GridsterCtrl.floatItemsUp();

	//expect(GridsterCtrl.getRow(scope.items[0])).toEqual(0);
	//expect(GridsterCtrl.getRow(scope.items[1])).toEqual(1);
	//expect(GridsterCtrl.getRow(scope.items[2])).toEqual(2);
	//expect(GridsterCtrl.getRow(scope.items[3])).toEqual(4);
	//});
	//});

	//describe('moveOverlappingItems', function() {
	//it('should push items in the way down of target item', function() {
	//if (scope.items[1].col) {
	//scope.items[1].col = 0;
	//} else {
	//scope.items[1].desktop.col = 0;
	//}

	//GridsterCtrl.moveOverlappingItems(item2x1, true);

	//expect(GridsterCtrl.getItemsInArea(0, 0, 1, 1).length).toBe(1);
	//expect(GridsterCtrl.getItemsInArea(0, 0, 1, 1)[0]).toEqual(item2x1);

	//// should move item1x1 down
	//expect(GridsterCtrl.getItemsInArea(1, 0, 1, 1).length).toBe(1);
	//expect(GridsterCtrl.getItemsInArea(1, 0, 1, 1)[0]).toEqual(item1x1);
	//});
	//});

	//describe('moveAllOverlappingItems', function() {
	//it('should not fail if items is not an array', function() {
	//scope.items = null;

	//GridsterCtrl.moveAllOverlappingItems();
	//});

	//it('should iterate items and moveOverlappingItems on each', function() {
	//spyOn(GridsterCtrl, 'moveOverlappingItems').and.callThrough();

	//GridsterCtrl.moveAllOverlappingItems();

	//expect(GridsterCtrl.moveOverlappingItems.calls.count()).toBe(scope.items.length);

	//// should iterate items in reverse so later items override earlier items
	//expect(GridsterCtrl.moveOverlappingItems.calls.argsFor(0)[0]).toEqual(item3x1);
	//expect(GridsterCtrl.moveOverlappingItems.calls.argsFor(scope.items.length - 1)[0]).toEqual(item1x1);
	//});
	//});

	//describe('pixelsToRows', function() {
	//beforeEach(function() {
	//scope.options.curRowHeight = 100;
	//});

	//it('should get ceiling', function() {
	//expect(GridsterCtrl.pixelsToRows(110.12, true)).toBe(2);
	//});

	//it('should get floor', function() {
	//expect(GridsterCtrl.pixelsToRows(110.49, false)).toBe(1);
	//});

	//it('should get rounded', function() {
	//expect(GridsterCtrl.pixelsToRows(110.20)).toBe(1);
	//});
	//});

	//describe('pixelsToColumns', function() {
	//beforeEach(function() {
	//scope.options.curColWidth = 100;
	//});

	//it('should get ceiling', function() {
	//expect(GridsterCtrl.pixelsToColumns(110.12, true)).toBe(2);
	//});

	//it('should get floor', function() {
	//expect(GridsterCtrl.pixelsToColumns(110.49, false)).toBe(1);
	//});

	//it('should get rounded', function() {
	//expect(GridsterCtrl.pixelsToColumns(110.20)).toBe(1);
	//});
	//});

	//describe('setElementPosition', function() {

	//it('should set the items element position', function() {
	//GridsterCtrl.setElementPosition(itemElement, GridsterCtrl.getrow', item1x2), GridsterCtrl.getcol', item1x2));

	//expect(itemElement.style.top).toBe('171.25px');
	//expect(itemElement.style.left).toBe('10px');
	//});

	////it('should set the preview position if item is the moving item', function() {
	////scope.movingItem = item1x2;
	////GridsterCtrl.setElementPosition(itemElement, item1x2);

	////expect(itemElement.style.top).toBe('');
	////expect(previewElement.style.top).toBe('175px');
	////expect(previewElement.style.left).toBe('10px');
	////});

	//it('should set the preview position if el param is null', function() {
	//GridsterCtrl.setElementPosition(null, GridsterCtrl.getrow', item1x2), GridsterCtrl.getcol', item1x2));

	//expect(previewElement.style.top).toBe('171.25px');
	//expect(previewElement.style.left).toBe('10px');
	//});

	//it('should position it to zero if mobile', function() {
	//});
	//});

	//describe('setElementWidth', function() {
	//it('should set item element width', function() {
	//GridsterCtrl.setElementWidth(itemElement, GridsterCtrl.getSizeX(item1x1));
	//expect(itemElement.style.width).toBe('151.25px');
	//});

	//it('should set previewElement if el is null', function() {
	//GridsterCtrl.setElementWidth(null, GridsterCtrl.getSizeX(item1x1));
	//expect(previewElement.style.width).toBe('151.25px');
	//});
	//});

	//describe('setElementHeight', function() {
	//it('should set item element height', function() {
	//scope.options.isLoaded = true;
	//GridsterCtrl.setElementHeight(itemElement, GridsterCtrl.getSizeY(item1x1));
	//expect(itemElement.style.height).toBe('151.25px');
	//});

	//it('should set previewElement if item is null', function() {
	//scope.options.isLoaded = true;
	//GridsterCtrl.setElementHeight(null, GridsterCtrl.getSizeY(item1x1));
	//expect(previewElement.style.height).toBe('151.25px');
	//});
	//});

	//describe('orderItems', function() {
	//it('should order items by row, col', function() {
	//expect(scope.items[0]).toBe(item1x1);
	//scope.items[0].desktop.row = 4;
	//GridsterCtrl.orderItems();
	//expect(scope.items[0]).toBe(item2x1);
	//expect(scope.items[scope.items.length - 1]).toBe(item1x1);

	//scope.items[scope.items.length - 1].desktop.row = 0;
	//GridsterCtrl.orderItems();
	//expect(scope.items[0]).toBe(item1x1);
	//});
	//});

});
