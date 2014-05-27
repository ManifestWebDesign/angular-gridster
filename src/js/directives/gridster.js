/**
 * @name gridsterDirective
 */
app.directive('gridster', function($window, $timeout) {
	return {
		restrict: 'EA',
		controller: 'GridsterCtrl',
		scope: {
			items: '=',
			config: '=?gridster',
			api: '=?'
		},
		template: '<div class="gridster"><div ng-repeat="item in items track by item[options.trackByProperty]" gridster-item="item" gridster-options="options" class="gridster-item"><div class="gridster-item-content" inject></div><div class="resize-s-handle"></div><div class="resize-e-handle"></div><div class="gridster-item-overlay"></div></div><div class="gridster-preview-holder"></div></div>',
		replace: true,
		transclude: true,
		link: function(scope, $element, attrs, controller) {
			var windowResizeThrottle = null;

			// expose gridster methods to parent scope
			scope.api = {
				getNextPosition: function(sizeX, sizeY) {
					return controller.getNextPosition(sizeX, sizeY);
				},
				getOption: function(key) {
					return scope.options[key];
				},
				setOption: function(key, val) {
					scope.options[key] = val;
				}
			};

			var resize = function(e) {
				if (e.target === $window && windowResizeThrottle === null) {
					windowResizeThrottle = $timeout(function() {
						controller.resolveOptions();
						windowResizeThrottle = null;
					}, 200);
				}
			};

			angular.element($window).bind('resize', resize);

			scope.$on('$destroy', function() {
				angular.element($window).unbind('resize', resize);
			});

			controller.init($element);

			if (interact.supportsTouch() === true) {
				//var element = $element[0];

				//element.addEventListener('gesturestart', function(e) {
				//e.preventDefault(e);

				//scope.$broadcast('gridster.gesture_start', e);
				//}, false);

				//element.addEventListener('gesturechange', function(e) {
				//e.preventDefault(e);

				//scope.$broadcast('gridster.gesture_move', e);
				//}, false);

				//element.addEventListener('gestureend', function(e) {
				//e.preventDefault(e);
				//scope.$broadcast('gridster.gesture_end', e);
				//}, false);

				//element.addEventListener('dragstart', function (e) {
				//e.preventDefault();
				//});

				//interact(element).gesturable({
				//onstart: function(e) {
				//scope.$broadcast('gridster.gesture_start', e);
				//},
				//onmove: function(e) {
				//scope.$broadcast('gridster.gesture_move', e);
				//},
				//onend: function(e) {
				//scope.$broadcast('gridster.gesture_end', e);
				//}
				//});
			}

		}
	};
});
