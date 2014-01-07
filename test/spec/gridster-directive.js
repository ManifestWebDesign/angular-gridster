'use strict';

describe('Controller: GridsterCtrl', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var scope,
		opts,
		element;

	beforeEach(inject(function($rootScope, $compile) {
		scope = $rootScope.$new();

		opts = {
			colWidth: 100,
			rowHeight: 100,
			columns: 6,
			margins: [10, 10],
			defaultHeight: 1,
			defaultWidth: 2,
			minRows: 3,
			maxRows: 100,
			mobileBreakPoint: 600
		};

		element = angular.element('<div gridster="opts"></div>');
		$compile(element)(scope);
		scope.$digest();
	}));


	it('should add a class of gridster', function(){
		expect(element.hasClass('gridster')).toBe(true);
	});


//	it('should override options', function(){
//		scope.opts = opts;
//		scope.$digest();
//		//var cont = element.data('controller');
//		expect(element.scope().minRows).toBe(opts.minRows);
//	});

});
