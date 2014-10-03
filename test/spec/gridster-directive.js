'use strict';

describe('gridster directive', function() {

	beforeEach(module('gridster'));

	var $scope;
	var GridsterCtrl;
	var $el;
	var startCount;
	var resizeCount;
	var stopCount;

	var dragHelper = function(el, dx, dy) {
		el.simulate('mouseover').simulate('drag', {
			moves: 1,
			dx: dx,
			dy: dy
		});
	};

	beforeEach(inject(function($rootScope, $compile) {
		$scope = $rootScope.$new();
		startCount = resizeCount = stopCount = 0;

		$scope.opts = {
			minRows: 3,
			resizable: {
				enabled: true,
				handles: ['n', 'e', 's', 'w', 'se', 'sw'],
				start: function() {
					startCount++;
				},
				resize: function() {
					resizeCount++;
				},
				stop: function() {
					stopCount++;
				}
			}
		};

		$scope.dashboard = {
			widgets: [{
				id: 1,
				row: 0,
				col: 0,
				sizeX: 1,
				sizeY: 1
			}, {
				id: 2,
				row: 0,
				col: 3,
				sizeX: 2,
				sizeY: 1
			}, {
				id: 3,
				row: 1,
				col: 3,
				sizeX: 2,
				sizeY: 2
			}]
		};

		$el = angular.element('<div gridster="opts" style="width: 1000px;">' +
			'<ul><li gridster-item="widget" ng-repeat="widget in dashboard.widgets">' +
			'</div>');

		$el.appendTo(document.body); // append to body so jquery-simulate works

		$compile($el)($scope);
		$scope.$digest();

		GridsterCtrl = $el.controller('gridster');
	}));


	it('should add a class of gridster', function() {
		expect($el.hasClass('gridster')).toBe(true);
	});

	it('should override options', function() {
		expect(GridsterCtrl.minRows).toBe($scope.opts.minRows);
	});

	it('should add widgets to DOM', function() {
		expect($el.find('li').length).toBe($scope.dashboard.widgets.length);
	});

	it('should initialize resizable', function() {
		var $widget = $el.find('li:first-child');
		setTimeout(function() {
			expect($widget.find('.handle-n').length).toBe(1);
		});
	});

	it('should update widget dimensions on resize & trigger custom resize events', function() {

		setTimeout(function() {
			var $widget = $el.find('li:first-child');
			var handle = $widget.find('.handle-e');

			expect($widget.width()).toBe(155);
			expect($scope.dashboard.widgets[0].sizeX).toBe(1);
			expect(startCount).toBe(0);
			expect(resizeCount).toBe(0);
			expect(stopCount).toBe(0);

			dragHelper(handle, 50); // should resize to next width step

			expect($widget.width()).toBe(320);
			expect($scope.dashboard.widgets[0].sizeX).toBe(2);
			expect(startCount).toBe(1);
			expect(resizeCount).toBe(1);
			expect(stopCount).toBe(1);
		});
	});

});
