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
		gridsterItem;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();

		scope.config = {
			colWidth: 100,
			rowHeight: 100,
			columns: 6,
			margins: [10, 10],
			defaultHeight: 1,
			defaultWidth: 2,
			minRows: 2,
			maxRows: 100,
			mobileBreakPoint: 600,
			defaultSizeX: 3,
			defaultSizeY: 4
		};

		gridster = $controller('GridsterCtrl', {
			$scope: scope
		});
		gridsterItem = $controller('GridsterItemCtrl', {
			$scope: scope
		});

		item1x1 = { sizeX: 1, sizeY: 1, id: '1x1' };
		item2x1 = { sizeX: 2, sizeY: 1, id: '2x1' };
		item2x2 = { sizeX: 2, sizeY: 2, id: '2x2' };
		item1x2 = { sizeX: 1, sizeY: 2, id: '1x2' };


		var $el = angular.element('<div></div>');
		var $preview = angular.element('<div></div>');

		gridster.init($el, $preview);


		gridster.setOptions();
		gridsterItem.init(null, gridster);
	}));

	it('should get defaults from gridster', function(){
		expect(gridsterItem.sizeX).toBe(scope.config.defaultSizeX);
		expect(gridsterItem.sizeY).toBe(scope.config.defaultSizeY);
	});

});
