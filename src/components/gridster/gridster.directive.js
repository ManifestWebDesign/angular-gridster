(function(angular, _) {
	'use strict';
	/**
	 * The gridster directive
	 *
	 * @param {Function} $timeout
	 * @param {Object} $window
	 * @param {Object} $rootScope
	 */
	angular.module('gridster')
		.directive('gridster', ['$timeout', '$window', '$rootScope',
			function($timeout, $window, $rootScope) {
				return {
					scope: true,
					restrict: 'EAC',
					controller: 'GridsterCtrl',
					controllerAs: 'gridster',
					compile: function($tplElem) {

						$tplElem.prepend('<div ng-if="gridster.movingItem" gridster-preview></div>');

						return function(scope, $elem, attrs, gridster) {
							gridster.loaded = false;

							gridster.$element = $elem;

							scope.gridster = gridster;

							$elem.addClass('gridster');

							var isVisible = function(ele) {
								return ele.style.visibility !== 'hidden' && ele.style.display !== 'none';
							};

							function updateHeight() {
								$elem.css('height', (gridster.gridHeight * gridster.curRowHeight) + (gridster.outerMargin ? gridster.margins[0] : -gridster.margins[0]) + 'px');
							}

							scope.$watch(function() {
								return gridster.gridHeight;
							}, updateHeight);

							scope.$watch(function() {
								return gridster.movingItem;
							}, function() {
								gridster.updateHeight(gridster.movingItem ? gridster.movingItem.sizeY : 0);
							});

							function refresh(config) {
								gridster.setOptions(config);

								if (!isVisible($elem[0])) {
									return;
								}

								// resolve "auto" & "match" values
								if (gridster.width === 'auto') {
									gridster.curWidth = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);
								} else {
									gridster.curWidth = gridster.width;
								}

								if (gridster.colWidth === 'auto') {
									gridster.curColWidth = (gridster.curWidth + (gridster.outerMargin ? -gridster.margins[1] : gridster.margins[1])) / gridster.columns;
								} else {
									gridster.curColWidth = gridster.colWidth;
								}

								gridster.curRowHeight = gridster.rowHeight;
								if (typeof gridster.rowHeight === 'string') {
									if (gridster.rowHeight === 'match') {
										gridster.curRowHeight = Math.round(gridster.curColWidth);
									} else if (gridster.rowHeight.indexOf('*') !== -1) {
										gridster.curRowHeight = Math.round(gridster.curColWidth * gridster.rowHeight.replace('*', '').replace(' ', ''));
									} else if (gridster.rowHeight.indexOf('/') !== -1) {
										gridster.curRowHeight = Math.round(gridster.curColWidth / gridster.rowHeight.replace('/', '').replace(' ', ''));
									}
								}

								gridster.isMobile = gridster.mobileModeEnabled && gridster.curWidth <= gridster.mobileBreakPoint;

								// loop through all items and reset their CSS
								for (var rowIndex = 0, l = gridster.grid.length; rowIndex < l; ++rowIndex) {
									var columns = gridster.grid[rowIndex];
									if (!columns) {
										continue;
									}

									for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
										if (columns[colIndex]) {
											var item = columns[colIndex];
											item.setElementPosition();
											item.setElementSizeY();
											item.setElementSizeX();
										}
									}
								}

								updateHeight();
							}

							var optionsKey = attrs.gridster;
							if (optionsKey) {
								scope.$parent.$watch(optionsKey, function(newConfig) {
									refresh(newConfig);
								}, true);
							} else {
								refresh({});
							}

							scope.$watch(function() {
								return gridster.loaded;
							}, function() {
								if (gridster.loaded) {
									$elem.addClass('gridster-loaded');
									$rootScope.$broadcast('gridster-loaded', gridster);
								} else {
									$elem.removeClass('gridster-loaded');
								}
							});

							scope.$watch(function() {
								return gridster.isMobile;
							}, function() {
								if (gridster.isMobile) {
									$elem.addClass('gridster-mobile').removeClass('gridster-desktop');
								} else {
									$elem.removeClass('gridster-mobile').addClass('gridster-desktop');
								}
								$rootScope.$broadcast('gridster-mobile-changed', gridster);
							});

							scope.$watch(function() {
								return gridster.draggable;
							}, function() {
								$rootScope.$broadcast('gridster-draggable-changed', gridster);
							}, true);

							scope.$watch(function() {
								return gridster.resizable;
							}, function() {
								$rootScope.$broadcast('gridster-resizable-changed', gridster);
							}, true);

							var prevWidth = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);

							var resize = function() {
								var width = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);

								if (!width || width === prevWidth || gridster.movingItem) {
									return;
								}
								prevWidth = width;

								if (gridster.loaded) {
									$elem.removeClass('gridster-loaded');
								}

								refresh();

								if (gridster.loaded) {
									$elem.addClass('gridster-loaded');
								}

								$rootScope.$broadcast('gridster-resized', [width, $elem[0].offsetHeight], gridster);
							};

							// track element width changes any way we can
							var onResize = _.debounce(function onResize() {
								resize();
							}, 100, {
								leading: false,
								trailing: true
							});

							scope.$watch(function() {
								return isVisible($elem[0]);
							}, onResize);

							// see https://github.com/sdecima/javascript-detect-element-resize
							if (typeof window.addResizeListener === 'function') {
								window.addResizeListener($elem[0], onResize);
							} else {
								scope.$watch(function() {
									return $elem[0].offsetWidth || parseInt($elem.css('width'), 10);
								}, resize);
							}
							var $win = angular.element($window);
							$win.on('resize', onResize);

							$win.on('scroll', gridster.onScroll);

							// be sure to cleanup
							scope.$on('$destroy', function() {
								gridster.destroy();
								$win.off('resize', onResize);
								$win.off('scroll', gridster.onScroll);
								if (typeof window.removeResizeListener === 'function') {
									window.removeResizeListener($elem[0], onResize);
								}
							});

							// allow a little time to place items before floating up
							$timeout(function() {
								scope.$watch('gridster.floating', function() {
									gridster.floatItemsUp();
								});
								gridster.loaded = true;
							}, 100);
						};
					}
				};
			}
		]);
})(window.angular, window._);
