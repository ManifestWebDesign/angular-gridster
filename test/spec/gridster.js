'use strict';

describe('Controller: GridsterCtrl', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var GridsterCtrl,
		scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($controller, $rootScope) {
		scope = $rootScope.$new();
		GridsterCtrl = $controller('GridsterCtrl', {
			$scope: scope
		});
		var opts = {
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
		GridsterCtrl.init(null, null, opts);
	}));

	it('should have a grid Array', function() {
		expect(GridsterCtrl.grid.constructor).toBe(Array);
	});
});