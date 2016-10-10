(function(angular) {
	'use strict';
	/**
	 * GridsterItem directive
	 * @param $parse
	 * @param GridsterDraggable
	 * @param GridsterResizable
	 * @param gridsterDebounce
	 */
	angular.module('gridster').directive('gridsterItem', ['$parse', 'GridsterDraggable', 'GridsterResizable', 'gridsterDebounce',
		function($parse, GridsterDraggable, GridsterResizable, gridsterDebounce) {
			return {
				scope: true,
				restrict: 'EA',
				controller: 'GridsterItemCtrl',
				controllerAs: 'gridsterItem',
				require: ['^gridster', 'gridsterItem'],
				link: function(scope, $el, attrs, controllers) {
					var optionsKey = attrs.gridsterItem,
						options;

					var gridster = controllers[0],
						item = controllers[1];

					scope.gridster = gridster;

					// bind the item's position properties
					// options can be an object specified by gridster-item="object"
					// or the options can be the element html attributes object
					if (optionsKey) {
						var $optionsGetter = $parse(optionsKey);
						options = $optionsGetter(scope) || {};
						if (!options && $optionsGetter.assign) {
							options = {
								row: item.row,
								col: item.col,
								sizeX: item.sizeX,
								sizeY: item.sizeY,
								minSizeX: 0,
								minSizeY: 0,
								maxSizeX: null,
								maxSizeY: null
							};
							$optionsGetter.assign(scope, options);
						}
					} else {
						options = attrs;
					}

					item.init($el, gridster);

					$el.addClass('gridster-item');

					var aspects = ['minSizeX', 'maxSizeX', 'minSizeY', 'maxSizeY', 'sizeX', 'sizeY', 'row', 'col'],
						$getters = {};

					var expressions = [];
					var aspectFn = function(aspect) {
						var expression;
						if (typeof options[aspect] === 'string') {
							// watch the expression in the scope
							expression = options[aspect];
						} else if (typeof options[aspect.toLowerCase()] === 'string') {
							// watch the expression in the scope
							expression = options[aspect.toLowerCase()];
						} else if (optionsKey) {
							// watch the expression on the options object in the scope
							expression = optionsKey + '.' + aspect;
						} else {
							return;
						}
						expressions.push('"' + aspect + '":' + expression);
						$getters[aspect] = $parse(expression);

						// initial set
						var val = $getters[aspect](scope);
						if (typeof val === 'number') {
							item[aspect] = val;
						}
					};

					for (var i = 0, l = aspects.length; i < l; ++i) {
						aspectFn(aspects[i]);
					}

					var watchExpressions = '{' + expressions.join(',') + '}';
					// when the value changes externally, update the internal item object
					scope.$watchCollection(watchExpressions, function(newVals, oldVals) {
						for (var aspect in newVals) {
							var newVal = newVals[aspect];
							var oldVal = oldVals[aspect];
							if (oldVal === newVal) {
								continue;
							}
							newVal = parseInt(newVal, 10);
							if (!isNaN(newVal)) {
								item[aspect] = newVal;
							}
						}
					});

					function positionChanged() {
						// call setPosition so the element and gridster controller are updated
						item.setPosition(item.row, item.col);

						// when internal item position changes, update externally bound values
						if ($getters.row && $getters.row.assign) {
							$getters.row.assign(scope, item.row);
						}
						if ($getters.col && $getters.col.assign) {
							$getters.col.assign(scope, item.col);
						}
					}
					scope.$watch(function() {
						return item.row + ',' + item.col;
					}, positionChanged);

					function sizeChanged() {
						var changedX = item.setSizeX(item.sizeX, true);
						if (changedX && $getters.sizeX && $getters.sizeX.assign) {
							$getters.sizeX.assign(scope, item.sizeX);
						}
						var changedY = item.setSizeY(item.sizeY, true);
						if (changedY && $getters.sizeY && $getters.sizeY.assign) {
							$getters.sizeY.assign(scope, item.sizeY);
						}

						if (changedX || changedY) {
							item.gridster.moveOverlappingItems(item);
							gridster.layoutChanged();
							scope.$broadcast('gridster-item-resized', item);
						}
					}

					scope.$watch(function() {
						return item.sizeY + ',' + item.sizeX + ',' + item.minSizeX + ',' + item.maxSizeX + ',' + item.minSizeY + ',' + item.maxSizeY;
					}, sizeChanged);

					var draggable = new GridsterDraggable($el, scope, gridster, item, options);
					var resizable = new GridsterResizable($el, scope, gridster, item, options);

					var updateResizable = function() {
						resizable.toggle(!gridster.isMobile && gridster.resizable && gridster.resizable.enabled);
					};
					updateResizable();

					var updateDraggable = function() {
						draggable.toggle(!gridster.isMobile && gridster.draggable && gridster.draggable.enabled);
					};
					updateDraggable();

					scope.$on('gridster-draggable-changed', updateDraggable);
					scope.$on('gridster-resizable-changed', updateResizable);
					scope.$on('gridster-resized', updateResizable);
					scope.$on('gridster-mobile-changed', function() {
						updateResizable();
						updateDraggable();
					});

					function whichTransitionEvent() {
						var el = document.createElement('div');
						var transitions = {
							'transition': 'transitionend',
							'OTransition': 'oTransitionEnd',
							'MozTransition': 'transitionend',
							'WebkitTransition': 'webkitTransitionEnd'
						};
						for (var t in transitions) {
							if (el.style[t] !== undefined) {
								return transitions[t];
							}
						}
					}

					var debouncedTransitionEndPublisher = gridsterDebounce(function() {
						scope.$apply(function() {
							scope.$broadcast('gridster-item-transition-end', item);
						});
					}, 50);

					$el.on(whichTransitionEvent(), debouncedTransitionEndPublisher);

					scope.$broadcast('gridster-item-initialized', item);

					return scope.$on('$destroy', function() {
						try {
							resizable.destroy();
							draggable.destroy();
						} catch (e) {}

						try {
							gridster.removeItem(item);
						} catch (e) {}

						try {
							item.destroy();
						} catch (e) {}
					});
				}
			};
		}
	]);
})(window.angular);
