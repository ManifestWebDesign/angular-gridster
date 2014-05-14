'use strict';

describe('gridster directive', function() {

	// load the controller's module
	beforeEach(module('gridster'));

	var scope,
		GridsterCtrl,
		element;

	beforeEach(inject(function($rootScope, $compile) {
		scope = $rootScope.$new();

		scope.opts = {
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

		GridsterCtrl = element.controller('gridster');
	}));


	it('should add a class of gridster', function(){
		expect(element.hasClass('gridster')).toBe(true);
	});


	it('should override options', function(){
		expect(GridsterCtrl.options.minRows).toBe(scope.opts.minRows);
	});

});
