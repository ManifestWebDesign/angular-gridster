'use strict';

describe('gridster directive', function() {

	beforeEach(module('gridster'));

	var $scope;
	var $timeout;
	var $window;
	var GridsterCtrl;
	var $el;
	var resizeStartCount;
	var resizeResizeCount;
	var resizeStopCount;
	var dragStartCount;
	var dragDragCount;
	var dragStopCount;
	var el1, el2, el3, el4, el5;

	//var dragHelper = function(el, dx, dy) {
	//dx = dx || 0;
	//dy = dy || 0;

	//var dragger = el.data('ui-draggable');
	//var x = el.position().left;
	//var y = el.position().top;

	//dragger.options.helper = ''; // hack jquery draggable to bypass returning early since element is not in the DOM
	//dragger._mouseStart({pageX: x, pageY: y});
	//dragger._mouseDrag({pageX: x + dx, pageY: y + dy});
	//$timeout.flush();
	//dragger._mouseStop({pageX: x + dx, pageY: y + dy});
	//};

	//var resizeHelper = function(el, handle, dx, dy) {
	//dx = dx || 0;
	//dy = dy || 0;

	//var resizer = el.data('ui-resizable');
	//var x;
	//var y;

	//switch(handle) {
	//case 'e':
	//x = el.position().left + el.outerWidth();
	//y = el.position().top + (el.outerHeight() / 2);
	//break;
	//case 'w':
	//x = el.position().left;
	//y = el.position().top + (el.outerHeight() / 2);
	//break;
	//case 'n':
	//x = el.position().left + (el.outerWidth() / 2);
	//y = el.position().top;
	//break;
	//case 's':
	//x = el.position().left;
	//y = el.position().top + el.outerHeight();
	//break;
	//}

	//el.find('.ui-resizable-' + handle).trigger('mouseover');

	//resizer._mouseStart({pageX: x, pageY: y});
	//resizer._mouseDrag({pageX: x + dx, pageY: y + dy});
	//$timeout.flush();
	//resizer._mouseStop({pageX: x + dx, pageY: y + dy});

	//el.find('.ui-resizable-' + handle).trigger('mouseout');
	//};

	//var checkDragCounts = function(count) {
	//expect(dragStartCount).toBe(count);
	//expect(dragDragCount).toBe(count);
	//expect(dragStopCount).toBe(count);
	//};

	//var checkResizeCounts = function(count) {
	//expect(resizeStartCount).toBe(count);
	//expect(resizeResizeCount).toBe(count);
	//expect(resizeStopCount).toBe(count);
	//};

	beforeEach(inject(function($rootScope, $compile, _$timeout_, _$window_, gridsterConfig) {
		console.log('babab', gridsterConfig.modes);
		$scope = $rootScope.$new();
		$timeout = _$timeout_;
		$window = _$window_;
		dragStartCount = dragDragCount = dragStopCount = resizeStartCount = resizeResizeCount = resizeStopCount = 0;

		$scope.gridsterOptions = {
			minRows: 4
			//draggable: {
			//enabled: true,
			//start: function(e, widget, $el) {
			//dragStartCount++;
			//expect($el.hasClass('gridster-item-moving')).toBe(true);
			//},
			//drag: function() {
			//dragDragCount++;
			//},
			//stop: function() {
			//dragStopCount++;
			//expect($el.hasClass('gridster-item-moving')).toBe(false);
			//}
			//},
			//resizable: {
			//enabled: true,
			//start: function(e, widget, $el) {
			//resizeStartCount++;
			//expect($el.hasClass('gridster-item-moving')).toBe(true);
			//},
			//resize: function() {
			//resizeResizeCount++;
			//},
			//stop: function() {
			//resizeStopCount++;
			//expect($el.hasClass('gridster-item-moving')).toBe(false);
			//}
			//}
		};

		$scope.dashboard = {
			widgets: [{
				id: 'item1',
				desktop: {
					row: 0,
					col: 0,
					sizeX: 2,
					sizeY: 1
				}
			}, {
				id: 'item2'
			}, {
				id: 'item3',
				desktop: {
					row: 0,
					col: 3,
					sizeX: 3,
					sizeY: 2
				}
			}, {
				id: 'item4',
				desktop: {
					row: 1,
					col: 9,
					sizeX: 2,
					sizeY: 1
				}
			}, {
				id: 'item5',
				desktop: {
					row: 4,
					col: 0,
					sizeX: 5,
					sizeY: 2
				}
			}]
		};

		$el = angular.element('<div id="grid" gridster="gridsterOptions" items="dashboard.widgets">({{ item.row }},{{ item.col }})-{{ item.sizeX }}x{{ item.sizeY }}</div>');

		$('body').append($el);

		$compile($el)($scope);

		$('.gridster').width(1300);

		console.log('BURN');

		$scope.$digest();
		$timeout.flush();

		GridsterCtrl = $el.controller('gridster');

		el1 = $el.find('.gridster-item').eq(0);
		el2 = $el.find('.gridster-item').eq(1);
		el3 = $el.find('.gridster-item').eq(2);
		el4 = $el.find('.gridster-item').eq(4);
		el5 = $el.find('.gridster-item').eq(3);
	}));

	afterEach(function() {
		$('#grid').remove();
	});

	describe('Init', function() {
		it('should add widgets to DOM', function() {
			expect($el.find('.gridster-item').length).toBe(5);
		});

		//it('should not change item1', function() {
		//expect($scope.dashboard.widgets[0].desktop.sizeX).toBe(2);
		//expect($scope.dashboard.widgets[0].desktop.sizeY).toBe(1);
		//expect($scope.dashboard.widgets[0].desktop.row).toBe(0);
		//expect($scope.dashboard.widgets[0].desktop.col).toBe(0);
		//});

		//it('should have resolved item2', function() {
		//expect($scope.dashboard.widgets[1].desktop.sizeX).toBe(1);
		//expect($scope.dashboard.widgets[1].desktop.sizeY).toBe(1);
		//expect($scope.dashboard.widgets[1].desktop.row).toBe(0);
		//expect($scope.dashboard.widgets[1].desktop.col).toBe(2);
		//});

		//it('should not change item3', function() {
		//expect($scope.dashboard.widgets[2].desktop.sizeX).toBe(3);
		//expect($scope.dashboard.widgets[2].desktop.sizeY).toBe(2);
		//expect($scope.dashboard.widgets[2].desktop.row).toBe(0);
		//expect($scope.dashboard.widgets[2].desktop.col).toBe(3);
		//});

		//it('should have resolved item4 since it didnt fit in the desired spot', function() {
		//expect($scope.dashboard.widgets[3].desktop.sizeX).toBe(2);
		//expect($scope.dashboard.widgets[3].desktop.sizeY).toBe(1);
		//expect($scope.dashboard.widgets[3].desktop.row).toBe(0);
		//expect($scope.dashboard.widgets[3].desktop.col).toBe(6);
		//});

		//it('should have floated item5 up', function() {
		//expect($scope.dashboard.widgets[4].desktop.sizeX).toBe(5);
		//expect($scope.dashboard.widgets[4].desktop.sizeY).toBe(2);
		//expect($scope.dashboard.widgets[4].desktop.row).toBe(2);
		//expect($scope.dashboard.widgets[4].desktop.col).toBe(0);
		//});

		//it('should have placed & ordered the widget elements in the DOM', function() {
		//expect(el1.text()).toBe('(0,0)-2x1');

		//expect(el2.text()).toBe('(0,2)-1x1');
		////expect(el3.text()).toBe('(0,3)-3x2');
		//expect(el4.text()).toBe('(1,0)-5x2');
		////expect(el5.text()).toBe('(3,0)-2x1');
		//});

		//it('should place widgets in the same row at the same distance from top', function() {
		//expect(w1.position().top).toBe(w2.position().top);
		//expect(w2.position().top).toBe(w3.position().top);
		//});

		//it('should override default options with options passed to gridster', function() {
		//expect(GridsterCtrl.options.minRows).toBe($scope.gridsterOptions.minRows);
		//});

		//it('should update size options on config change', function() {
		//spyOn(GridsterCtrl, 'setOptions').and.callThrough();

		//$scope.gridsterOptions.colWidth = 100;
		//$scope.$apply();

		//expect(GridsterCtrl.options.curColWidth).toBe(100);
		//expect(GridsterCtrl.setOptions.calls.count()).toBe(1);
		//});

		//it('should set widget sizes', function() {
		//var GridsterItemCtrl = w1.controller('gridster-item');

		//expect(GridsterItemCtrl.sizeX).toBe(1);
		//expect(GridsterItemCtrl.sizeY).toBe(1);
		//expect(w1.width()).toBe(155);
		//expect(w1.height()).toBe(155);
		//});

		//it('should call removeItem if item removed', function() {
		//spyOn(GridsterCtrl, 'removeItem').and.callThrough();
		//expect($el.find('li').length).toBe(5);
		//expect($scope.dashboard.widgets.length).toBe(5);
		//$scope.dashboard.widgets.splice(0, 1);
		//expect($scope.dashboard.widgets.length).toBe(4);
		//$scope.$apply();
		//expect(GridsterCtrl.removeItem.calls.count()).toBe(1);
		//expect($el.find('li').length).toBe(4);
		//});

		//it('should sort items', function() {
		// w1
		//expect($scope.dashboard.widgets[0].row).toBe(0);
		//expect($scope.dashboard.widgets[0].col).toBe(0);
		//expect($scope.dashboard.widgets[0].sizeX).toBe(1);
		//expect($scope.dashboard.widgets[0].sizeY).toBe(1);

		//// w2
		//expect($scope.dashboard.widgets[1].row).toBe(0);
		//expect($scope.dashboard.widgets[1].col).toBe(1);
		//expect($scope.dashboard.widgets[1].sizeX).toBe(2);
		//expect($scope.dashboard.widgets[1].sizeY).toBe(1);

		//// w3
		//expect($scope.dashboard.widgets[2].row).toBe(0);
		//expect($scope.dashboard.widgets[2].col).toBe(3);
		//expect($scope.dashboard.widgets[2].sizeX).toBe(3);
		//expect($scope.dashboard.widgets[2].sizeY).toBe(2);

		////			// w4
		////			expect($scope.dashboard.widgets[3].row).toBe(3);
		////			expect($scope.dashboard.widgets[3].col).toBe(0);
		////			expect($scope.dashboard.widgets[3].sizeX).toBe(2);
		////			expect($scope.dashboard.widgets[3].sizeY).toBe(1);
		////
		////			// w5
		////			expect($scope.dashboard.widgets[4].row).toBe(1);
		////			expect($scope.dashboard.widgets[4].col).toBe(0);
		////			expect($scope.dashboard.widgets[4].sizeX).toBe(1);
		////			expect($scope.dashboard.widgets[4].sizeY).toBe(2);
		//});

		//it('should set positions', function() {
		//expect(w1.css('left')).toBe('10px');
		//expect(w1.css('top')).toBe('10px');

		//expect(w2.css('left')).toBe('175px');
		//expect(w2.css('top')).toBe('10px');

		//expect(w3.css('left')).toBe('505px');
		//expect(w3.css('top')).toBe('10px');

		//expect(w4.css('left')).toBe('10px');
		//expect(w4.css('top')).toBe('505px');

		//expect(w5.css('left')).toBe('10px');
		//expect(w5.css('top')).toBe('175px');
		//});

		//it('should move overlapping items', function() {
		////expect(w4.css('top')).not.toBe(w5.css('top'));
		//});
	});

	//describe('Config', function() {

	//it('should fire draggable-changed/resizable-changed if respective options have changed', function() {
	//var dragChangedCount = 0;
	//var resizeChangedCount = 0;

	//w1.scope().$on('draggable-changed', function() {
	//dragChangedCount++;
	//});

	//w1.scope().$on('resizable-changed', function() {
	//resizeChangedCount++;
	//});

	//$scope.gridsterOptions.draggable.enabled = false;
	//$scope.$apply();

	//expect(dragChangedCount).toBe(1);
	//expect(resizeChangedCount).toBe(0); // should not fire resizable-changed event

	//$scope.gridsterOptions.resizable.enabled = false;
	//$scope.$apply();

	//expect(dragChangedCount).toBe(1); // should not fir draggable-changed event
	//expect(resizeChangedCount).toBe(1);
	//});

	//it('should fire draggable-changed if draggable options have changed', function() {
	//var count = 0;
	//w1.scope().$on('draggable-changed', function() {
	//count++;
	//});

	//$scope.gridsterOptions.draggable.enabled = false;
	//$scope.$apply();

	//expect(count).toBe(1);
	//});

	//});

	//describe('Draggable:', function() {
	//it('should initialize draggable', function() {
	//expect(w1.hasClass('ui-draggable')).toBe(true);
	//});

	//it('should trigger events on drag', function() {
	//checkDragCounts(0);
	//dragHelper(w1, 50, 0);
	//checkDragCounts(1);
	//});

	//it('should update widget model & dimensions on drag & trigger events', function() {
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);

	//// drag w1 right by 120px
	//dragHelper(w1, 120, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(1);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(1);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(155);
	//expect(w1.height()).toBe(155);
	//checkDragCounts(1);

	//// w2 should have been pushed down
	//expect($scope.dashboard.widgets[1].row).toBe(1);

	//// w4 & w5 should float up
	//expect($scope.dashboard.widgets[4].row).toBe(0);
	//expect($scope.dashboard.widgets[3].row).toBe(2);

	//// drag w1 down
	//dragHelper(w1, 0, 200);

	//// w1 should be floated back up to original position
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(1);
	//checkDragCounts(2);

	//// drag w1 on top of w4
	//dragHelper(w1, -200, 505);
	//expect($scope.dashboard.widgets[0].row).toBe(3);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//checkDragCounts(3);

	//// w4 should be pushed down below w1
	//expect($scope.dashboard.widgets[3].row).toBe(2);
	//});
	//});

	//describe('Resizable:', function() {

	//it('should initialize resizable', function() {
	//var $widget = $el.find('li:first-child');

	//expect($widget.hasClass('ui-resizable')).toBe(true);
	//expect($widget.find('.ui-resizable-e').length).toBe(1);
	//});

	//it('should trigger resizable events on resize', function() {
	//checkResizeCounts(0);
	//resizeHelper(w1, 'e', 50, 0);
	//checkResizeCounts(1);
	//});

	//it('should update widget model & dimensions on resize & trigger events', function() {
	//// increase w1-e by 50px
	//resizeHelper(w1, 'e', 50, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(2);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(320);
	//expect(w1.height()).toBe(155);
	//checkResizeCounts(1);

	//// w2 should have been pushed down
	//expect($scope.dashboard.widgets[1].row).toBe(1);

	//// increase w1-e by 1000px, max it out
	//resizeHelper(w1, 'e', 1000, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(6);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(980);
	//expect(w1.height()).toBe(155);
	//checkResizeCounts(2);

	//// decrease w1-e by 200px
	//resizeHelper(w1, 'e', -200, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(5);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(815);
	//expect(w1.height()).toBe(155);
	//checkResizeCounts(3);

	//// increase w1-s by 50px
	//resizeHelper(w1, 's', 0, 50);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(5);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(2);
	//expect(w1.width()).toBe(815);
	//expect(w1.height()).toBe(320);
	//checkResizeCounts(4);

	//// decrease w1-s by 200px
	//resizeHelper(w1, 's', 0, -200);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(5);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(815);
	//expect(w1.height()).toBe(155);
	//checkResizeCounts(5);

	//// increase w1-w by 200px
	//resizeHelper(w1, 'w', 200, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(1);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(4);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(650);
	//expect(w1.height()).toBe(155);
	//checkResizeCounts(6);
	//});

	//it('should stay within gridster west boundary', function() {
	//resizeHelper(w1, 'w', -200, 0);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(1);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(1);
	//expect(w1.width()).toBe(155);
	//expect(w1.height()).toBe(155);
	//});

	//it('should stay within south boundary', function() {
	//GridsterCtrl.options.maxRows = 4;
	//GridsterCtrl.setOptions();

	//resizeHelper(w1, 's', 0, 2000);
	//expect($scope.dashboard.widgets[0].row).toBe(0);
	//expect($scope.dashboard.widgets[0].col).toBe(0);
	//expect($scope.dashboard.widgets[0].sizeX).toBe(1);
	//expect($scope.dashboard.widgets[0].sizeY).toBe(4);
	//expect(w1.width()).toBe(155);
	//expect(w1.height()).toBe(650);
	//});

	//});

	//describe('Window resize:', function() {
	//var resizeCount;
	//beforeEach(function() {
	//resizeCount = 0;
	//w1.scope().$on('gridster-resized', function() {
	//resizeCount++;
	//});
	//});

	//it('should resize grid on window resize', function() {
	//angular.element($window).trigger('resize');
	//$timeout.flush();

	//expect(resizeCount).toBe(1);
	//});

	//it('should remove resize binding on destroy', function() {
	//$scope.$destroy();

	//angular.element($window).trigger('resize');
	//try {
	//$timeout.flush();
	//} catch(e) {}

	//expect(resizeCount).toBe(0);
	//});

	//it('should add class gridster-mobile if in mobile mode', function() {
	//$el.width(400);

	//angular.element($window).trigger('resize');

	//$timeout.flush();

	//expect($el.hasClass('gridster-mobile')).toBe(true);
	//});
	//});
});
