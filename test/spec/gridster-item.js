'use strict';

describe('Controller: GridsterItemCtrl', function() {
	// load the controller's module
	beforeEach(module('gridster'));

	var gridster,
		scope,
		item1x1,
		item2x1,
		item1x2,
		item2x2,
		opts,
		gridsterItem;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		gridster = $controller('GridsterCtrl', {
			$scope: scope
		});
		gridsterItem = $controller('GridsterItemCtrl', {
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
			mobileBreakPoint: 600,
			defaultSizeX: 1,
			defaultSizeY: 2
		};
		item1x1 = { sizeX: 1, sizeY: 1, id: '1x1' };
		item2x1 = { sizeX: 2, sizeY: 1, id: '2x1' };
		item2x2 = { sizeX: 2, sizeY: 2, id: '2x2' };
		item1x2 = { sizeX: 1, sizeY: 2, id: '1x2' };
		gridster.init(null, null);
		gridster.setOpts(opts);
		gridsterItem.init(null, gridster);
	}));

	it('should get defaults from gridster', function(){
		expect(gridsterItem.sizeX).toBe(opts.defaultSizeX);
		expect(gridsterItem.sizeY).toBe(opts.defaultSizeY);
	});

});