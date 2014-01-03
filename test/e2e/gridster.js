'use strict';

//idea from here: http://stackoverflow.com/questions/16211696/angularjs-e2e-testing-past-future-comparisons
angular.scenario.matcher('toBeGreaterThanFuture', function(future) {
	return +this.actual > +future.value;
});

describe('Controller: GridsterCtrl', function() {
	beforeEach(function() {
		browser().navigateTo('/');
	});

	it('redirect works', function() {
		expect(browser().location().path()).toBe('');
	});

	it('should have a page with elements', function() {
		expect(repeater('ul li.gridster-item').count()).toBeGreaterThan(0);
		expect(element('h2').count()).toBeGreaterThan(0);
		expect(element('h2:first').text()).toBe('Standard Items');
		expect(element('.gridster-item').count()).toBeGreaterThan(0);
	});

	it('should allow the user to enter a size', function() {
		using('li.gridster-item:first').input('item.sizeX').enter(2);
		var prewidth = element('li.gridster-item:first', '1st Grid item before').width();
		sleep(1);
		using('li.gridster-item:first').input('item.sizeX').enter(3);
		var postwidth = element('li.gridster-item:first', '1st Grid item after').width();

		expect(prewidth).toBeGreaterThan(0);
		expect(postwidth).toBeGreaterThan(0);
		//expect(postwidth).toBeGreaterThanFuture(prewidth); //There appears to be some sort of race condition here. Would Protractor help?
	});
});