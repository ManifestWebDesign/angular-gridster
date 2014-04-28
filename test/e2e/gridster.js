'use strict';

describe('Controller: GridsterCtrl', function () {
	beforeEach(function () {
		browser.get('http://localhost:9000/index.html');
		browser.driver.manage().window().setSize(1000, 1000);
	});

	it('should have a page with elements', function () {
		browser.findElements(by.repeater('item in standardItems')).then(function (els) {
			expect(els.length).toEqual(11);
		});

		browser.findElement(by.css('h2:first-child')).then(function (el) {
			return el.getText().then(function (text) {
				expect(text).toBe('Standard Items');
			});
		});
	});

	it('should allow the user to enter a size', function () {
		var width = 0;

		browser.findElement(by.css('.gridster-item:first-child')).then(function (el) {
			return el.getSize().then(function (size) {
				expect(size.width).toBeGreaterThan(0);

				width = size.width;

				return el;
			});
		}).then(function (el) {
			return el.findElement(by.model('item.sizeX'));
		}).then(function (input) {
			return input.sendKeys('2').then(function () {
				return input.sendKeys(protractor.Key.TAB);
			});
		}).then(function () {
			return browser.findElement(by.css('.gridster-item:first-child'));
		}).then(function (el) {
			return el.getSize();
		}).then(function (size) {
			expect(size.width).toBeGreaterThan(width);
		});
	});
});
