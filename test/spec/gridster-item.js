'use strict';

describe('Controller: GridsterItemCtrl', function() {
	// load the controller's module
	beforeEach(module('gridster'));

	var scope,
		item1x1,
		item2x1,
		item1x2,
		item2x2,
		GridsterCtrl,
		GridsterItemCtrl;

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

		GridsterCtrl = $controller('GridsterCtrl', {
			$scope: scope
		});

		GridsterItemCtrl = $controller('GridsterItemCtrl', {
			$scope: scope
		});

		item1x1 = {
			sizeX: 1,
			sizeY: 1,
			id: '1x1'
		};
		item2x1 = {
			sizeX: 2,
			sizeY: 1,
			id: '2x1'
		};
		item2x2 = {
			sizeX: 2,
			sizeY: 2,
			id: '2x2'
		};
		item1x2 = {
			sizeX: 1,
			sizeY: 2,
			id: '1x2'
		};


		var $el = angular.element('<div></div>');
		var $preview = angular.element('<div></div>');

		GridsterCtrl.init($el, $preview);


		GridsterItemCtrl.setOptions();
		GridsterItemCtrl.init(null, GridsterCtrl);
	}));

	//	it('should get defaults from gridster', function() {
	//		expect(GridsterItemCtrl.sizeX).toBe(scope.config.defaultSizeX);
	//		expect(GridsterItemCtrl.sizeY).toBe(scope.config.defaultSizeY);
	//	});


});
