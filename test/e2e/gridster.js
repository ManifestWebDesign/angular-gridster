'use strict';



describe('Controller: GridsterCtrl', function() {

	angular.scenario.matcher('toBeGreaterThanFuture', function(future) {
  return +this.actual > +future.value;
});

	beforeEach(function() {
        browser().navigateTo('/');
    });

    it ('redirect works', function() {
        expect(browser().location().path()).toBe('');
    });

	it('should have a page with elements', function(){
		expect(repeater('ul li.gridster-item').count()).toBeGreaterThan(0);
		expect(element('h2').count()).toBeGreaterThan(0);
		expect(element('h2:first').text()).toBe('Standard Items');
		expect(element('.gridster-item').count()).toBeGreaterThan(0);
	});

	it('should allow the user to enter a size', function(){
		using('li.gridster-item:first').input('item.sizeX').enter(2);
		var prewidth = element('li.gridster-item:first', '1st Grid item before').width();
		using('li.gridster-item:first').input('item.sizeX').enter(3);
		var postwidth = element('li.gridster-item:first', '1st Grid item after').width();
		expect(prewidth).toBeGreaterThan(0);
		expect(postwidth).toBeGreaterThan(0);
		expect(postwidth).toBeGreaterThanFuture(prewidth);
	});
});