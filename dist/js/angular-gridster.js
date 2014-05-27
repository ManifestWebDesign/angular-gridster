/**
 * @file angular-gridster - http://manifestwebdesign.github.io/angular-gridster
 * @module angular-gridster
 *
 * @see http://manifestwebdesign.github.io/angular-gridster
 * @version 0.9.8
 * @license MIT
 */
(function(angular) {
	'use strict';
	/*jshint -W079 */
	var app = angular.module('gridster', []);
	/**
	 * @name gridsterConfig
	 * @description  Provides angular-gridster with sensible defaults
	 */
	app.constant('gridsterConfig', {
		modes: {
			desktop: {
				columns: 12,
				minThreshold: 1025,
				maxThreshold: 9999,
				defaultSizeX: 3,
				defaultSizeY: 3,
				minSizeX: 3,
				minSizeY: 2
			},
			tablet: {
				columns: 12,
				minThreshold: 768,
				maxThreshold: 1024,
				defaultSizeX: 4,
				defaultSizeY: 4,
				minSizeX: 4,
				minSizeY: 2
			},
			mobile: {
				columns: 6,
				minThreshold: 0,
				maxThreshold: 767,
				defaultSizeX: 6,
				defaultSizeY: 6,
				minSizeX: 6,
				minSizeY: 3
			}
		},
		width: 'auto',
		colWidth: 'auto',
		rowHeight: 'match',
		margins: [
			10,
			10
		],
		minItemWidth: 100,
		minItemHeight: 100,
		minRows: 12,
		maxRows: 1000,
		trackByProperty: 'id',
		rowProperty: 'row',
		colProperty: 'col',
		sizeXProperty: 'sizeX',
		sizeYProperty: 'sizeY',
		floatItemsUp: true,
		moveOverlappingItems: true,
		resizableEnabled: true,
		iframeFix: true,
		resizablePreviewEnabled: true,
		draggablePreviewEnabled: true
	});
	/**
	 * GridsterCtrl
	 */
	app.controller('GridsterCtrl', [
		'$scope',
		'$rootScope',
		'gridsterConfig',
		function($scope, $rootScope, gridsterConfig) {
			/**
			 * The grid element
			 */
			var $gridElement = null;
			/**
			 * The previewElement DOM element
			 */
			var previewElement = null;
			/**
			 * Stores an indexed array of grid item DOM elements
			 */
			$scope.itemElements = [];
			/**
			 * Sets gridster & previewElement elements
			 */
			this.init = function($element) {
				$gridElement = $element;
				previewElement = $element[0].querySelector('.gridster-preview-holder');
				// initialize options with gridster config
				$scope.options = angular.extend({}, gridsterConfig);
				// merge user provided options
				angular.extend($scope.options, $scope.config);
			};
			/**
			 * Returns an option
			 */
			this.getOption = function(key) {
				// use mode options if possible
				if ($scope.options.modes[$scope.options.mode].hasOwnProperty(key)) {
					return $scope.options.modes[$scope.options.mode][key];
				} else {
					return $scope.options[key];
				}
			};
			/**
			 * Add item element to itemElements
			 */
			this.addItemElement = function(id, element) {
				$scope.itemElements[id] = element;
			};
			/**
			 * Get an items DOM element
			 */
			this.getItemElement = function(id) {
				return $scope.itemElements[id];
			};
			/**
			 * Remove an items DOM element from itemElements array
			 */
			this.removeItemElement = function(id) {
				delete $scope.itemElements[id];
			};
			/**
			 * Fire loaded events & add loaded class
			 */
			this.setLoaded = function(val) {
				if (val === true) {
					$scope.options.isLoaded = true;
					$rootScope.$broadcast('angular-gridster.loaded');
					$gridElement.addClass('gridster-loaded');
				} else {
					$gridElement.removeClass('gridster-loaded');
					$scope.options.isLoaded = false;
				}
			};
			/**
			 * Resolve options relating to screen size
			 */
			this.resolveOptions = function() {
				var mode, modeOptions, modeChanged;
				$scope.options.curWidth = $gridElement[0].offsetWidth;
				$gridElement.removeClass('gridster-' + $scope.options.mode);
				for (mode in $scope.options.modes) {
					if (!$scope.options.modes.hasOwnProperty(mode) || mode === $scope.options.mode) {
						continue;
					}
					modeOptions = $scope.options.modes[mode];
					if ($scope.options.curWidth >= modeOptions.minThreshold && $scope.options.curWidth <= modeOptions.maxThreshold) {
						modeChanged = true;
						$scope.options.mode = mode;
						break;
					}
				}
				$gridElement.addClass('gridster-' + $scope.options.mode);
				if (this.getOption('width') !== 'auto') {
					$scope.options.curWidth = this.getOption('width');
				}
				if (this.getOption('colWidth') === 'auto') {
					$scope.options.curColWidth = ($scope.options.curWidth - this.getOption('margins')[0]) / this.getOption('columns');
				} else {
					$scope.options.curColWidth = this.getOption('colWidth');
				}
				if (this.getOption('rowHeight') === 'match') {
					$scope.options.curRowHeight = $scope.options.curColWidth;
				} else {
					$scope.options.curRowHeight = this.getOption('rowHeight');
				}
				if ($scope.options.isLoaded === true) {
					$rootScope.$broadcast('angular-gridster.grid_changed', $scope.options);
					if (modeChanged === true) {
						this.moveAllOverlappingItems();
					}
				}
			};
			/**
			 * Show preview element
			 */
			this.showPreviewElement = function() {
				previewElement.style.opacity = '1';
			};
			/**
			 * Hide preview element
			 */
			this.hidePreviewElement = function() {
				previewElement.style.opacity = '0';
			};
			this.startMove = function() {
				$gridElement.addClass('gridster-moving');
			};
			/**
			 * Hide grid item overlay elements
			 */
			this.endMove = function() {
				$gridElement.removeClass('gridster-moving');
			};
			/**
			 * Check if item can occupy a specified position in the grid
			 */
			this.canItemOccupy = function(row, col, sizeX, sizeY, excludeItems) {
				var canOccupy = true;
				if (row < 0 || col < 0 || row + sizeY > this.getOption('maxRows') || col + sizeX > this.getOption('columns') || this.getItemsInArea(row, col, sizeX, sizeY, excludeItems).length > 0) {
					canOccupy = false;
				}
				return canOccupy;
			};
			/**
			 * Gets items within an area
			 */
			this.getItemsInArea = function(row, col, sizeX, sizeY, excludeItems) {
				var items = [],
					item, trackByProperty;
				trackByProperty = this.getOption('trackByProperty');
				if (excludeItems && !(excludeItems instanceof Array)) {
					excludeItems = [excludeItems];
				}
				loop1: for (var i = 0, itemCount = $scope.items.length; i < itemCount; i++) {
					item = $scope.items[i];
					if (excludeItems) {
						// continue if item an item to be excluded
						for (var j = 0, excludeItemCount = excludeItems.length; j < excludeItemCount; j++) {
							if (excludeItems[j][trackByProperty] === item[trackByProperty]) {
								continue loop1;
							}
						}
					}
					if (this.isItemHidden(item) !== true && this.isItemInArea(item, row, col, sizeX, sizeY)) {
						items.unshift(item);
					}
				}
				return items;
			};
			/**
			 * Checks if item is inside a specified area
			 */
			this.isItemInArea = function(item, row, col, sizeX, sizeY) {
				var itemRow, itemCol, itemSizeX, itemSizeY;
				itemRow = this.getRow(item);
				itemCol = this.getCol(item);
				itemSizeX = this.getSizeX(item);
				itemSizeY = this.getSizeY(item);
				if (itemRow + itemSizeY <= row || itemRow >= row + sizeY || itemCol + itemSizeX <= col || itemCol >= col + sizeX) {
					return false;
				}
				return true;
			};
			/**
			 * Resolves an items parameter
			 */
			this.resolveParam = function(val, defaultVal1, defaultVal2) {
				val = parseInt(val, 10);
				if (val === null || isNaN(val) || typeof val !== 'number' || val < 0) {
					if (typeof defaultVal1 !== 'undefined') {
						return this.resolveParam(defaultVal1, defaultVal2);
					} else if (typeof defaultVal2 !== 'undefined') {
						return this.resolveParam(defaultVal2);
					} else {
						val = null;
					}
				}
				return val;
			};
			/**
			 * Fix an items position/size values for each view mode
			 */
			this.fixItem = function(item) {
				var _item = item,
					_mode = $scope.options.mode,
					defaultSizeX = this.getOption('defaultSizeX'),
					defaultSizeY = this.getOption('defaultSizeY'),
					mode, sizeX, sizeY, row, col, position;
				for (mode in $scope.options.modes) {
					// temp change of mode
					$scope.options.mode = mode;
					// resolve sizeX
					sizeX = this.resolveParam(this.getSizeX(_item), defaultSizeX);
					if (sizeX < this.getOption('minSizeX')) {
						sizeX = defaultSizeX;
					}
					_item = this.setSizeX(_item, sizeX);
					// resolve sizeY
					sizeY = this.resolveParam(this.getSizeY(_item), defaultSizeY);
					if (sizeY < this.getOption('minSizeY')) {
						sizeY = defaultSizeY;
					}
					_item = this.setSizeY(_item, sizeY);
					// resolve row/col
					row = this.resolveParam(this.getRow(_item));
					col = this.resolveParam(this.getCol(_item));
					if (typeof row !== 'number' || typeof col !== 'number' || row > this.getOption('maxRows') || col >= this.getOption('columns')) {
						if ($scope.options.isLoaded === true) {
							position = this.getNextPosition(sizeX, sizeY, item);
							// item must be too big for the grid, set to default size
							if (position === false) {
								_item = this.setSizeX(_item, defaultSizeX);
								_item = this.setSizeY(_item, defaultSizeY);
								position = this.getNextPosition(null, null, item);
								if (position === false) {
									throw new Error('No positions available');
								}
							}
							row = position.row;
							col = position.col;
						} else {
							row = 0;
							col = 0;
						}
					}
					_item = this.setRow(_item, row);
					_item = this.setCol(_item, col);
				}
				// revert back to the current mode
				$scope.options.mode = _mode;
				// update item in items array
				$scope.items[$scope.items.indexOf(item)] = _item;
				return _item;
			};
			/**
			 * Get the next available position in the grid
			 */
			this.getNextPosition = function(sizeX, sizeY, excludeItem) {
				sizeX = sizeX || this.getOption('defaultSizeX');
				sizeY = sizeY || this.getOption('defaultSizeY');
				for (var row = 0, rowCount = this.getOption('maxRows'); row <= rowCount; row++) {
					for (var col = 0, columnCount = this.getOption('columns'); col < columnCount; col++) {
						if (this.canItemOccupy(row, col, sizeX, sizeY, excludeItem)) {
							return {
								row: row,
								col: col
							};
						}
					}
				}
				return false;
			};
			/**
			 * Move other items in the way up or down
			 */
			this.moveOverlappingItems = function(item, allowMoveUp) {
				var items, row, col, sizeX, sizeY, _row, _col, _sizeX, _sizeY;
				if (this.getOption('moveOverlappingItems') === false || this.isItemHidden(item)) {
					return;
				}
				row = this.getRow(item);
				col = this.getCol(item);
				sizeX = this.getSizeX(item);
				sizeY = this.getSizeY(item);
				items = this.getItemsInArea(row, col, sizeX, sizeY, item);
				for (var i = 0, l = items.length; i < l; i++) {
					_row = this.getRow(items[i]);
					_col = this.getCol(items[i]);
					_sizeX = this.getSizeX(items[i]);
					_sizeY = this.getSizeY(items[i]);
					// try to move item up first
					if (allowMoveUp === true && row > 0 && this.canItemOccupy(_row - (sizeY + _sizeY - 1), _col, _sizeX, _sizeY, items[i])) {
						items[i] = this.setRow(items[i], _row - (sizeY + _sizeY - 1));
					} else {
						// ok, down you go
						items[i] = this.setRow(items[i], row + sizeY);
						this.moveOverlappingItems(items[i]);
					}
					if ($scope.options.isLoaded) {
						this.translateElementPosition(this.getItemElement(items[i][this.getOption('trackByProperty')]), this.colToPixels(this.getCol(items[i])), this.rowToPixels(this.getRow(items[i])));
					}
				}
			};
			/**
			 * Iterate entire grid and move any overlapping items
			 */
			this.moveAllOverlappingItems = function() {
				if ($scope.items.length === 0) {
					return;
				}
				for (var i = 0, l = $scope.items.length; i < l; i++) {
					this.moveOverlappingItems($scope.items[i]);
				}
			};
			/**
			 * Move items up into empty space
			 */
			this.floatItemsUp = function() {
				if (this.getOption('floatItemsUp') === false || !$scope.items) {
					return;
				}
				for (var i = 0; i < $scope.items.length; i++) {
					if ($scope.items[i]._moving === true) {
						continue;
					}
					this.floatItemUp($scope.items[i]);
				}
			};
			/**
			 * Float an item up to the most suitable row
			 */
			this.floatItemUp = function(item) {
				var items, row, col, sizeX, sizeY, bestRow = null;
				row = this.getRow(item) - 1;
				col = this.getCol(item);
				sizeX = this.getSizeX(item);
				sizeY = this.getSizeY(item);
				while (row > -1) {
					items = this.getItemsInArea(row, col, sizeX, sizeY, item);
					if (items.length === 0) {
						bestRow = row;
					} else {
						break;
					}
					--row;
				}
				if (bestRow !== null) {
					item = this.setRow(item, bestRow);
					this.translateElementPosition(this.getItemElement(item[this.getOption('trackByProperty')]), this.colToPixels(col), this.rowToPixels(bestRow));
				}
			};
			/**
			 * Update gridsters height if item is the lowest
			 */
			this.updateGridHeight = function() {
				var maxRows = 0,
					itemMaxRow, height;
				maxRows = this.getOption('minRows');
				if ($scope.items) {
					for (var j = 0; j < $scope.items.length; j++) {
						itemMaxRow = this.getRow($scope.items[j]) + this.getSizeY($scope.items[j]);
						if (itemMaxRow > maxRows) {
							maxRows = itemMaxRow;
						}
					}
				}
				// add empty space for items to move to
				maxRows += this.getOption('defaultSizeY');
				if (maxRows > this.getOption('maxRows')) {
					maxRows = this.getOption('maxRows');
				}
				height = maxRows * this.getOption('curRowHeight') + this.getOption('margins')[1];
				$gridElement[0].style.height = height + 'px';
			};
			/**
			 * Returns the number of rows that will fit in given amount of pixels
			 */
			this.pixelsToRows = function(pixels, ceilOrFloor) {
				var rows;
				if (!pixels || pixels < 0) {
					pixels = 0;
				}
				if (ceilOrFloor === true) {
					rows = Math.ceil(pixels / this.getOption('curRowHeight'));
				} else if (ceilOrFloor === false) {
					rows = Math.floor(pixels / this.getOption('curRowHeight'));
				} else {
					rows = Math.round(pixels / this.getOption('curRowHeight'));
				}
				return rows;
			};
			/**
			 * Returns the number of columns that will fit in a given amount of pixels
			 */
			this.pixelsToColumns = function(pixels, ceilOrFloor) {
				var columns;
				if (!pixels || pixels < 0) {
					pixels = 0;
				}
				if (ceilOrFloor === true) {
					columns = Math.ceil(pixels / $scope.options.curColWidth);
				} else if (ceilOrFloor === false) {
					columns = Math.floor(pixels / $scope.options.curColWidth);
				} else {
					columns = Math.round(pixels / $scope.options.curColWidth);
				}
				return columns;
			};
			/**
			 * Returns the row in pixels
			 */
			this.rowToPixels = function(row) {
				return row * $scope.options.curRowHeight + this.getOption('margins')[0];
			};
			/**
			 * Returns the column in pixels
			 */
			this.colToPixels = function(col) {
				return col * $scope.options.curColWidth + this.getOption('margins')[1];
			};
			/**
			 * Translate an elements position using translate3d if possible
			 */
			this.translateElementPosition = function(el, x, y) {
				var transform;
				if (el === null) {
					el = previewElement;
				}
				if (Modernizr.csstransforms3d) {
					transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
				} else {
					transform = 'translate(' + x + 'px,' + y + 'px)';
				}
				el.style.webkitTransform = transform;
				el.style.MozTransform = transform;
				el.style.OTransform = transform;
				el.style.msTransform = transform;
				el.style.transform = transform;
			};
			/**
			 * Sets an elements height
			 */
			this.setElementHeight = function(el, sizeY) {
				var height;
				if (!$scope.options.isLoaded) {
					// need to make sure grid isLoaded so css height transition isn't clobbered
					return 0;
				}
				height = parseFloat((sizeY * $scope.options.curRowHeight).toFixed(2), 10) - this.getOption('margins')[0] + 'px';
				if (el === null) {
					el = previewElement;
				}
				el.style.height = height;
				$scope.$broadcast('angular_gridster.element_height_changed', el, height);
				return height;
			};
			/**
			 * Sets an elements width
			 */
			this.setElementWidth = function(el, sizeX) {
				var width;
				if (el === null) {
					el = previewElement;
				}
				width = parseFloat((sizeX * $scope.options.curColWidth).toFixed(2)) - this.getOption('margins')[1] + 'px';
				el.style.width = width;
				return width;
			};
			/**
			 * Set an items DOM element in the grid
			 */
			this.setElement = function(el, item, ignoreHeight) {
				if (el !== null && this.isItemHidden(item)) {
					el.style.display = 'none';
					return;
				} else if (el !== null) {
					el.style.display = 'block';
				}
				if (el === null) {
					el = previewElement;
				}
				this.setElementWidth(el, this.getSizeX(item));
				this.translateElementPosition(el, this.colToPixels(this.getCol(item)), this.rowToPixels(this.getRow(item)));
				if (!ignoreHeight) {
					this.setElementHeight(el, this.getSizeY(item));
				}
			};
			/**
			 * Set all item elements in the grid
			 */
			this.setElements = function() {
				for (var i = 0; i < $scope.items.length; i++) {
					this.setElement(this.getItemElement($scope.items[i][this.getOption('trackByProperty')]), $scope.items[i]);
				}
			};
			/**
			 * Check if an items position has changed
			 */
			this.hasItemPositionChanged = function(item, row, col) {
				if (this.getRow(item) !== row || this.getCol(item) !== col) {
					return true;
				}
				return false;
			};
			/**
			 * Check if an items width has changed
			 */
			this.hasItemWidthChanged = function(item, sizeX) {
				if (this.getSizeX(item) !== sizeX) {
					return true;
				}
				return false;
			};
			/**
			 * Check if an items height has changed
			 */
			this.hasItemHeightChanged = function(item, sizeY) {
				if (this.getSizeY(item) !== sizeY) {
					return true;
				}
				return false;
			};
			/**
			 * Get an items property
			 */
			this.getItemProperty = function(item, property) {
				if (!item.hasOwnProperty($scope.options.mode)) {
					return null;
				}
				if (!item[$scope.options.mode].hasOwnProperty(property)) {
					item[$scope.options.mode][property] = 0;
				}
				return item[$scope.options.mode][property];
			};
			/**
			 * Set an items property
			 */
			this.setItemProperty = function(item, property, val) {
				if (!item.hasOwnProperty($scope.options.mode)) {
					item[$scope.options.mode] = {};
				}
				item[$scope.options.mode][property] = val;
				return item;
			};
			/**
			 * Get an items row property
			 */
			this.getRow = function(item) {
				return this.getItemProperty(item, $scope.options.rowProperty);
			};
			/**
			 * Set an items row property
			 */
			this.setRow = function(item, val) {
				return this.setItemProperty(item, $scope.options.rowProperty, val);
			};
			/**
			 * Get an items row property
			 */
			this.getCol = function(item) {
				return this.getItemProperty(item, $scope.options.colProperty);
			};
			/**
			 * Set an items col property
			 */
			this.setCol = function(item, val) {
				var sizeX = this.getSizeX(item);
				// stay in the grid fool
				if (val + sizeX > this.getOption('columns')) {
					val = this.getOption('columns') - sizeX;
				}
				return this.setItemProperty(item, $scope.options.colProperty, val);
			};
			/**
			 * Get an items sizeX property
			 */
			this.getSizeX = function(item) {
				return this.getItemProperty(item, $scope.options.sizeXProperty);
			};
			/**
			 * Set an items sizeX property
			 */
			this.setSizeX = function(item, val) {
				var min = this.getOption('minSizeX');
				if (val < min) {
					val = min;
				}
				var max = this.getOption('columns');
				if (val > max) {
					val = max;
				}
				return this.setItemProperty(item, $scope.options.sizeXProperty, val);
			};
			/**
			 * Get an items sizeY property
			 */
			this.getSizeY = function(item) {
				return this.getItemProperty(item, $scope.options.sizeYProperty);
			};
			/**
			 * Set an items sizeY property
			 */
			this.setSizeY = function(item, val) {
				var min = this.getOption('minSizeY');
				if (val < min) {
					val = min;
				}
				var max = this.getOption('maxRows');
				if (val > max) {
					val = max;
				}
				return this.setItemProperty(item, $scope.options.sizeYProperty, val);
			};
			this.isItemHidden = function(item) {
				return item.hasOwnProperty($scope.options.mode) ? item[$scope.options.mode].hidden : false;
			};
			this.setGestureItem = function(item) {
				$scope.gestureItem = item;
			};
			this.setGestureElement = function(element) {
				$scope.gestureElement = element;
			};
		}
	]);
	/**
	 * @name gridsterDirective
	 */
	app.directive('gridster', [
		'$window',
		'$timeout',
		function($window, $timeout) {
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
					if (interact.supportsTouch() === true) {}
				}
			};
		}
	]);
	/**
	 * @name gridsterItemDirective
	 *
	 * @param {object} $timeout
	 */
	app.directive('gridsterItem', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				require: '^gridster',
				replace: true,
				scope: {
					item: '=gridsterItem'
				},
				link: function(scope, $element, attrs, gridster) {
					var element = $element[0],
						dragInteract = null,
						eastResizeInteract = null,
						southResizeInteract = null,
						isResizing = false,
						isDragging = false,
						heightChanged = false,
						widthChanged = false,
						draggableOption, resizableOption, rowStart, colStart, sizeXStart, sizeYStart, row, col, sizeX, sizeY, top, left, width, height, minWidth, maxWidth, minHeight, maxHeight, columns;
					if (scope.$parent.$first) {
						gridster.setLoaded(false);
						gridster.resolveOptions();
					}
					if (gridster.isItemHidden(scope.item) === true) {
						element.style.display = 'none';
					} else {
						element.style.display = 'block';
					}
					gridster.fixItem(scope.item);
					gridster.addItemElement(scope.item[gridster.getOption('trackByProperty')], element);
					gridster.setElement(element, scope.item, true);
					var initializePosition = function() {
						var values;
						var matrix = $element.css('-webkit-transform') || $element.css('-moz-transform') || $element.css('-ms-transform') || $element.css('-o-transform') || $element.css('transform');
						if (typeof matrix !== 'string' || matrix === 'none') {
							throw new Error('Your browser does not support css transforms');
						}
						values = matrix.split('(')[1].split(')')[0].split(',');
						if (values.length < 4) {
							left = parseInt(values[0].replace('px', ''), 10);
							top = parseInt(values[1].replace('px', ''), 10);
						} else {
							left = parseInt(values[4].replace('px', ''), 10);
							top = parseInt(values[5].replace('px', ''), 10);
						}
					};
					// watch item mode for changes and update in grid
					var watchMode = function(mode) {
						scope.$watch('item.' + mode, function(newVal, oldVal) {
							if (newVal !== oldVal && newVal._moving !== true) {
								scope.item = gridster.fixItem(scope.item);
								gridster.moveOverlappingItems(scope.item);
								gridster.floatItemUp(scope.item);
								gridster.updateGridHeight();
								gridster.setElement(element, scope.item);
								scope.$emit('angular-gridster.item_changed', scope.item, $element);
							}
						}, true);
					};
					for (var mode in gridster.getOption('modes')) {
						watchMode(mode);
					}
					/**
					 * Set interact on the item
					 */
					var setInteractions = function() {
						dragInteract = interact(element).draggable({
							onstart: function(e) {
								gridster.startMove();
								isDragging = true;
								scope.item._moving = true;
								columns = gridster.getOption('columns');
								rowStart = gridster.getRow(scope.item);
								colStart = gridster.getCol(scope.item);
								sizeXStart = gridster.getSizeX(scope.item);
								sizeYStart = gridster.getSizeY(scope.item);
								if (gridster.getOption('draggablePreviewEnabled') === true) {
									gridster.showPreviewElement();
								}
								gridster.updateGridHeight();
								gridster.setElement(null, scope.item);
								initializePosition();
								draggableOption = gridster.getOption('draggable');
								if (draggableOption && draggableOption.onstart) {
									draggableOption.onstart(e, $element);
								}
								$element.addClass('gridster-item-moving');
							},
							onmove: function(e) {
								left += e.dx;
								top += e.dy;
								gridster.translateElementPosition(element, left, top);
								row = gridster.pixelsToRows(top);
								col = gridster.pixelsToColumns(left);
								if (col + sizeXStart >= columns) {
									col = columns - sizeXStart;
								}
								if (gridster.hasItemPositionChanged(scope.item, row, col)) {
									if (!gridster.getOption('moveOverlappingItems') && !gridster.canItemOccupy(row, col, sizeXStart, sizeYStart, scope.item)) {
										return;
									}
									scope.item = gridster.setRow(scope.item, row);
									scope.item = gridster.setCol(scope.item, col);
									if (gridster.getOption('draggablePreviewEnabled') === true) {
										gridster.translateElementPosition(null, gridster.colToPixels(col), gridster.rowToPixels(row));
									}
									gridster.moveOverlappingItems(scope.item, true);
									gridster.updateGridHeight();
								}
								if (draggableOption && draggableOption.onmove) {
									draggableOption.onmove(e, $element);
								}
							},
							onend: function(e) {
								isDragging = false;
								delete scope.item._moving;
								$element.removeClass('gridster-item-moving');
								scope.$apply(function() {
									if (gridster.getOption('draggablePreviewEnabled') === true) {
										gridster.hidePreviewElement();
									}
									if (gridster.hasItemPositionChanged(scope.item, rowStart, colStart) === false) {
										gridster.translateElementPosition(element, gridster.colToPixels(colStart), gridster.rowToPixels(rowStart));
									}
									gridster.floatItemsUp();
									gridster.endMove();
									if (draggableOption && draggableOption.onend) {
										draggableOption.onend(e, $element);
									}
								});
							}
						}).actionChecker(function(e, action) {
							if (typeof e.button !== 'undefined') {
								return e.button === 0 ? action : null; // disable right click
							}
							return action;
						});
						var resizeStart = function(e) {
							gridster.startMove();
							isResizing = true;
							scope.item._moving = true;
							gridster.updateGridHeight();
							if (gridster.getOption('resizablePreviewEnabled') === true) {
								gridster.showPreviewElement();
							}
							$element.addClass('gridster-item-moving');
							rowStart = gridster.getRow(scope.item);
							colStart = gridster.getCol(scope.item);
							sizeXStart = gridster.getSizeX(scope.item);
							sizeYStart = gridster.getSizeY(scope.item);
							width = element.offsetWidth;
							height = element.offsetHeight;
							minWidth = gridster.getOption('minSizeX') * gridster.getOption('curColWidth') - gridster.getOption('margins')[0];
							maxWidth = (gridster.getOption('columns') - colStart) * gridster.getOption('curColWidth') - gridster.getOption('margins')[0];
							minHeight = gridster.getOption('minSizeY') * gridster.getOption('curRowHeight') - gridster.getOption('margins')[1];
							maxHeight = (gridster.getOption('maxRows') - rowStart) * gridster.getOption('curColHeight');
							gridster.setElement(null, scope.item);
							resizableOption = gridster.getOption('resizable');
							if (resizableOption && resizableOption.start) {
								resizableOption.start(e, $element);
							}
						};
						var resizeMove = function(e, width, height) {
							if (width > maxWidth) {
								width = maxWidth;
							} else if (width < minWidth) {
								width = minWidth;
							}
							if (height > maxHeight) {
								height = maxHeight;
							} else if (height < minHeight) {
								height = minHeight;
							}
							element.style.width = width + 'px';
							element.style.height = height + 'px';
							sizeX = gridster.pixelsToColumns(width, true);
							sizeY = gridster.pixelsToRows(height, true);
							widthChanged = gridster.hasItemWidthChanged(scope.item, sizeX);
							heightChanged = gridster.hasItemHeightChanged(scope.item, sizeY);
							if (widthChanged || heightChanged) {
								if (gridster.getOption('moveOverlappingItems') === false && gridster.canItemOccupy(row, col, sizeX, sizeY, scope.item) === false) {
									return;
								}
								scope.item = gridster.setSizeX(scope.item, sizeX);
								scope.item = gridster.setSizeY(scope.item, sizeY);
								gridster.moveOverlappingItems(scope.item);
								if (heightChanged) {
									gridster.updateGridHeight();
								}
								if (gridster.getOption('resizablePreviewEnabled') === true) {
									gridster.setElementWidth(null, sizeX);
									gridster.setElementHeight(null, sizeY);
								}
							}
							if (resizableOption && resizableOption.onmove) {
								resizableOption.onmove(e, $element, {
									width: width,
									height: height
								});
							}
						};
						var resizeEnd = function(e) {
							isResizing = false;
							delete scope.item._moving;
							$element.removeClass('gridster-item-moving');
							scope.$apply(function() {
								if (gridster.getOption('resizablePreviewEnabled') === true) {
									gridster.hidePreviewElement();
								}
								if (gridster.hasItemWidthChanged(scope.item, sizeXStart) === false && gridster.hasItemHeightChanged(scope.item, sizeYStart) === false) {
									gridster.setElementWidth(element, sizeX);
									gridster.setElementHeight(element, sizeY);
								}
								gridster.floatItemsUp();
								gridster.endMove();
								if (resizableOption && resizableOption.onend) {
									resizableOption.onend(e, $element, {
										width: width,
										height: height
									});
								}
							});
						};
						if (gridster.getOption('resizableEnabled')) {
							if (interact.supportsTouch() === true) {
								var gestureInit = false;
								var _width, _height;
								// bind this item to the gesture on touchstart
								// use pinch/zoom for touch devices
								//$element.bind('touchstart', function() {
								//$rootScope.$broadcast('gridster.gesture_reset');
								//gestureInit = true;
								//});
								scope.$on('gridster.gesture_reset', function() {
									gestureInit = false;
								});
								scope.$on('gridster.gesture_start', function(e) {
									if (!gestureInit) {
										return;
									}
									$('body').append('<div>start</div>');
									resizeStart(e);
								});
								scope.$on('gridster.gesture_move', function(e, ge) {
									if (!gestureInit) {
										return;
									}
									_width = width * ge.scale;
									//(1 + (gestureEvent.scale / 2));
									_height = height * ge.scale;
									//(1 + (gestureEvent.ds / 2));
									element.style.width = _width + 'px';
									element.style.height = _height + 'px';
									resizeMove(e, _width, _height); //width = width * (1 + (ge.ds / 2));
									//height = height * (1 + (ge.ds / 2));
									//element.style.width = width + 'px';
									//element.style.height = height + 'px';
									//resizeMove(e, width, height);
								});
								scope.$on('gridster.gesture_end', function(e) {
									if (!gestureInit) {
										return;
									}
									$('body').append('<div>stop</div>');
									gestureInit = false;
									resizeEnd(e);
								});
							} else {
								// use box resize for other devices
								eastResizeInteract = interact(element.querySelector('.resize-e-handle')).resizable({
									onstart: resizeStart,
									onmove: function(e) {
										width += e.dx;
										height += e.dy;
										resizeMove(e, width, height);
									},
									onend: resizeEnd
								}).actionChecker(function(e, action) {
									if (typeof e.button !== 'undefined') {
										return e.button === 0 ? action : null; // disable right click
									}
									return action;
								});
								southResizeInteract = interact(element.querySelector('.resize-s-handle')).resizable({
									axis: 'y',
									onstart: resizeStart,
									onmove: function(e) {
										width += e.dx;
										height += e.dy;
										resizeMove(e, width, height);
									},
									onend: resizeEnd
								}).actionChecker(function(e, action) {
									if (typeof e.button !== 'undefined') {
										return e.button === 0 ? action : null; // disable right click
									}
									return action;
								});
							}
						}
					};
					var unsetInteractions = function() {
						if (dragInteract !== null) {
							dragInteract.unset();
							dragInteract = null;
						}
						if (eastResizeInteract !== null) {
							eastResizeInteract.unset();
							eastResizeInteract = null;
						}
						if (southResizeInteract !== null) {
							southResizeInteract.unset();
							southResizeInteract = null;
						}
					};
					scope.$on('angular-gridster.grid_changed', function() {
						gridster.setElement(element, scope.item);
					});
					scope.$on('angular-gridster.loaded', function() {
						gridster.setElementHeight(element, gridster.getSizeY(scope.item));
						setInteractions();
					});
					scope.$on('$destroy', function() {
						gridster.removeItemElement(scope.item[gridster.getOption('trackByProperty')]);
						unsetInteractions();
					});
					if (scope.$parent.$last) {
						$timeout(function() {
							gridster.setLoaded(true);
							gridster.moveAllOverlappingItems();
							//gridster.floatItemsUp();
							gridster.updateGridHeight();
						}, 50);
						$timeout(function() {
							gridster.resolveOptions(); // resolve widths incase of scrollbars
						}, 1000);
					}
				}
			};
		}
	]);
	/**
	 * Bind scope to transcluded content
	 *
	 * Fix for breaking change in 1.20
	 * see https://github.com/angular/angular.js/issues/7874
	 */
	app.directive('inject', function() {
		return {
			link: function($scope, $element, $attrs, controller, $transclude) {
				var innerScope = $scope.$new();
				$transclude(innerScope, function(clone) {
					$element.empty();
					$element.append(clone);
					$element.on('$destroy', function() {
						innerScope.$destroy();
					});
				});
			}
		};
	});
}(angular));
