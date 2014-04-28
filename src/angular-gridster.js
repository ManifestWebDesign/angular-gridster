'use strict';

angular.module('gridster', [])

.controller('GridsterCtrl', function () {
	return {

		/**
		 * Associative array of the items in the grid
		 */
		grid: [],

		/**
		 * Preview holder element
		 */
		$preview: null,

		/**
		 * Gridster element
		 */
		$element: null,

		/**
		 * Configurable options
		 */
		options: {
			width: 'auto',
			columns: 6,
			colWidth: 'auto',
			rowHeight: 'match',
			gridHeight: 2,
			margins: [10, 10],
			isMobile: false,
			minColumns: 1,
			maxColumns: 10,
			minRows: 1,
			maxRows: 100,
			defaultSizeX: 2,
			defaultSizeY: 1,
			mobileBreakPoint: 600,
			resizable: {
				enabled: true
			},
			draggable: {
				enabled: true
			}
		},

		/**
		 * Sets gridster & preview elements
		 *
		 * @param {object} $element Gridster element
		 * @param {object} $preview Gridster preview element
		 */
		init: function ($element, $preview) {
			this.$element = $element;
			this.$preview = $preview;
		},

		/**
		 * Clean up after yourself
		 */
		destroy: function () {
			//this.grid && (this.grid.length = 0);  TODO: what is this for do?
			this.options = this.options.margins = this.grid = this.$element = this.$preview = null;
		},

		/**
		 * Overrides default options
		 *
		 * @param {object} options The options to override
		 */
		setOptions: function (options) {
			if (options) {
				$.extend(true, this.options, options);
			}

			// resolve "auto" & "match" values
			if (this.options.width === 'auto') {
				this.options.width = this.$element ? this.$element.width() : 1000;
			}
			if (this.options.colWidth === 'auto') {
				this.options.colWidth = (this.options.width - this.options.margins[1]) / this.options.columns;
			}
			if (this.options.rowHeight === 'match') {
				this.options.rowHeight = this.options.colWidth;
			}
		},

		/**
		 * Redraws the grid
		 */
		redraw: function () {
			this.setOptions({});

			this.options.isMobile = this.options.width <= this.options.mobileBreakPoint;

			// loop through all items and reset their CSS
			for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
				var columns = this.grid[rowIndex];
				if (!columns) {
					continue;
				}
				for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
					if (columns[colIndex]) {
						var item = columns[colIndex];
						var $el = item.$element;
						this.setElementPosition($el, item.row, item.col);
						this.setElementSizeY($el, item.sizeY);
						this.setElementSizeX($el, item.sizeX);
					}
				}
			}
		},

		/**
		 * Check if item can occupy a specified position in the grid
		 *
		 * @param {object} item The item in question
		 * @param {number} row The row index
		 * @param {number} column The column index
		 * @returns {boolean} True if if item fits
		 */
		canItemOccupy: function (item, row, column) {
			return row > -1 && column > -1 && item.sizeX + column <= this.options.columns;
		},

		/**
		 * Set the item in the first suitable position
		 *
		 * @param {object} item The item to insert
		 */
		autoSetItemPosition: function (item) {
			// walk through each row and column looking for a place it will fit
			for (var rowIndex = 0; rowIndex < this.options.maxRows; ++rowIndex) {
				for (var colIndex = 0; colIndex < this.options.columns; ++colIndex) {
					// only insert if position is not already taken and it can fit
					if (!this.getItem(rowIndex, colIndex) && this.canItemOccupy(item, rowIndex, colIndex)) {
						this.putItem(item, rowIndex, colIndex);
						return;
					}
				}
			}
			throw new Error('Unable to place item!');
		},

		/**
		 * Gets items at a specific coordinate
		 *
		 * @param {number} row
		 * @param {number} column
		 * @param {number} sizeX
		 * @param {number} sizeY
		 * @param {array} excludeItems An array of items to exclude from selection
		 * @returns {array} Items that match the criteria
		 */
		getItems: function (row, column, sizeX, sizeY, excludeItems) {
			var items = [];
			if (!sizeX || !sizeY) {
				sizeX = sizeY = 1;
			}
			if (excludeItems && !(excludeItems instanceof Array)) {
				excludeItems = [excludeItems];
			}
			for (var h = 0; h < sizeY; ++h) {
				for (var w = 0; w < sizeX; ++w) {
					var item = this.getItem(row + h, column + w, excludeItems);
					if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && items.indexOf(item) === -1) {
						items.push(item);
					}
				}
			}
			return items;
		},

		/**
		 * Removes an item from the grid
		 *
		 * @param {object} item
		 */
		removeItem: function (item) {
			for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
				var columns = this.grid[rowIndex];
				if (!columns) {
					continue;
				}
				var index = columns.indexOf(item);
				if (index !== -1) {
					columns[index] = null;
					break;
				}
			}
			this.floatItemsUp();
			this.updateHeight();
		},

		/**
		 * Returns the item at a specified coordinate
		 *
		 * @param {number} row
		 * @param {number} column
		 * @param {array} excludeitems Items to exclude from selection
		 * @returns {object} The matched item or null
		 */
		getItem: function (row, column, excludeItems) {
			if (excludeItems && !(excludeItems instanceof Array)) {
				excludeItems = [excludeItems];
			}
			var sizeY = 1;
			while (row > -1) {
				var sizeX = 1,
					col = column;
				while (col > -1) {
					var items = this.grid[row];
					if (items) {
						var item = items[col];
						if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && item.sizeX >= sizeX && item.sizeY >= sizeY) {
							return item;
						}
					}
					++sizeX;
					--col;
				}
				--row;
				++sizeY;
			}
			return null;
		},

		/**
		 * Insert an array of items into the grid
		 *
		 * @param {array} items An array of items to insert
		 */
		putItems: function (items) {
			for (var i = 0, l = items.length; i < l; ++i) {
				this.putItem(items[i]);
			}
		},

		/**
		 * Insert a single item into the grid
		 *
		 * @param {object} item The item to insert
		 * @param {number} row (Optional) Specifies the items row index
		 * @param {number} column (Optional) Specifies the items column index
		 */
		putItem: function (item, row, column) {
			if (typeof row === 'undefined' || row === null) {
				row = item.row;
				column = item.col;
				if (typeof row === 'undefined' || row === null) {
					this.autoSetItemPosition(item);
					return;
				}
			}
			if (!this.canItemOccupy(item, row, column)) {
				column = Math.min(this.options.columns - item.sizeX, Math.max(0, column));
				row = Math.max(0, row);
			}

			if (item && item.oldRow !== null && typeof item.oldRow !== 'undefined') {
				if (item.oldRow === row && item.oldColumn === column) {
					item.row = row;
					item.col = column;
					return;
				} else {
					// remove from old position
					var oldRow = this.grid[item.oldRow];
					if (oldRow && oldRow[item.oldColumn] === item) {
						delete oldRow[item.oldColumn];
					}
				}
			}

			item.oldRow = item.row = row;
			item.oldColumn = item.col = column;

			this.moveOverlappingItems(item);

			if (!this.grid[row]) {
				this.grid[row] = [];
			}
			this.grid[row][column] = item;
		},

		/**
		 * Prevents items from being overlapped
		 *
		 * @param {object} item The item that should remain
		 */
		moveOverlappingItems: function (item) {
			var items = this.getItems(
				item.row,
				item.col,
				item.sizeX,
				item.sizeY,
				item
			);
			this.moveItemsDown(items, item.row + item.sizeY);
		},

		/**
		 * Moves an array of items to a specified row
		 *
		 * @param {array} items The items to move
		 * @param {number} row The target row
		 */
		moveItemsDown: function (items, row) {
			if (!items || items.length === 0) {
				return;
			}
			var topRows = {},
				item, i, l;
			// calculate the top rows in each column
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var topRow = topRows[item.col];
				if (typeof topRow === 'undefined' || item.row < topRow) {
					topRows[item.col] = item.row;
				}
			}
			// move each item down from the top row in its column to the row
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var columnOffset = row - topRows[item.col];
				this.putItem(
					item,
					item.row + columnOffset,
					item.col
				);
			}
		},

		/**
		 * Moves all items up as much as possible
		 */
		floatItemsUp: function () {
			for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
				var columns = this.grid[rowIndex];
				if (!columns) {
					continue;
				}
				for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
					if (columns[colIndex]) {
						this.floatItemUp(columns[colIndex]);
					}
				}
			}
		},

		/**
		 * Float an item up to the most suitable row
		 *
		 * @param {object} item The item to move
		 */
		floatItemUp: function (item) {
			var colIndex = item.col,
				sizeY = item.sizeY,
				sizeX = item.sizeX,
				bestRow = null,
				bestColumn = null,
				rowIndex = item.row - 1;

			while (rowIndex > -1) {
				var items = this.getItems(rowIndex, colIndex, sizeX, sizeY, item);
				if (items.length !== 0) {
					break;
				}
				bestRow = rowIndex;
				bestColumn = colIndex;
				--rowIndex;
			}
			if (bestRow !== null) {
				this.putItem(item, bestRow, bestColumn);
			}
		},

		/**
		 * Update gridsters height
		 *
		 * @param {number} plus (Optional) Additional height to add
		 */
		updateHeight: function (plus) {
			var maxHeight = this.options.minRows;
			if (!plus) {
				plus = 0;
			}
			for (var rowIndex = this.grid.length; rowIndex >= 0; --rowIndex) {
				var columns = this.grid[rowIndex];
				if (!columns) {
					continue;
				}
				for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
					if (columns[colIndex]) {
						maxHeight = Math.max(maxHeight, rowIndex + plus + columns[colIndex].sizeY);
					}
				}
			}
			this.options.gridHeight = Math.min(this.options.maxRows, maxHeight);
		},

		/**
		 * Returns the number of rows that will fit in given amount of pixels
		 *
		 * @param {number} pixels
		 * @param {boolean} ceilOrFloor (Optional) Determines rounding method
		 */
		pixelsToRows: function (pixels, ceilOrFloor) {
			if (ceilOrFloor === true) {
				return Math.ceil(pixels / this.options.rowHeight);
			} else if (ceilOrFloor === false) {
				return Math.floor(pixels / this.options.rowHeight);
			}

			return Math.round(pixels / this.options.rowHeight);
		},

		/**
		 * Returns the number of columns that will fit in a given amount of pixels
		 *
		 * @param {number} pixels
		 * @param {boolean} ceilOrFloor (Optional) Determines rounding method
		 */
		pixelsToColumns: function (pixels, ceilOrFloor) {
			if (ceilOrFloor === true) {
				return Math.ceil(pixels / this.options.colWidth);
			} else if (ceilOrFloor === false) {
				return Math.floor(pixels / this.options.colWidth);
			}
			return Math.round(pixels / this.options.colWidth);
		},

		/**
		 * Sets an elements position on the page
		 *
		 * @param {object} $el The element to position
		 * @param {number} row
		 * @param {number} column
		 */
		setElementPosition: function ($el, row, column) {
			if (this.options.isMobile) {
				$el.css({
					margin: this.options.margins[0] + 'px',
					top: 'auto',
					left: 'auto'
				});
			} else {
				$el.css({
					margin: 0,
					top: row * this.options.rowHeight + this.options.margins[0],
					left: column * this.options.colWidth + this.options.margins[1]
				});
			}
		},

		/**
		 * Sets an elements height
		 *
		 * @param {object} $el The element to resize
		 * @param {number} rows The number of rows the element occupies
		 */
		setElementSizeY: function ($el, rows) {
			if (this.options.isMobile) {
				$el.css('height', 'auto');
			} else {
				$el.css('height', (rows * this.options.rowHeight) - this.options.margins[0] + 'px');
			}
		},

		/**
		 * Sets an elements width
		 *
		 * @param {object} $el The element to resize
		 * @param {number} columns The number of columns the element occupies
		 */
		setElementSizeX: function ($el, columns) {
			if (this.options.isMobile) {
				$el.css('width', 'auto');
			} else {
				$el.css('width', (columns * this.options.colWidth) - this.options.margins[1] + 'px');
			}
		}
	};
})

/**
 * The gridster directive
 *
 * @param {object} $parse
 * @param {object} $timeout
 */
.directive('gridster', ['$parse', '$timeout',
	function ($parse, $timeout) {
		return {
			restrict: 'EAC',
			controller: 'GridsterCtrl',
			compile: function compile() {
				return {
					pre: function (scope, $elem, attrs, controller) {
						var updateHeight = function () {
							controller.$element.css('height', (controller.options.gridHeight * controller.options.rowHeight) + controller.options.margins[0] + 'px');
						};

						var optionsKey = attrs.gridster;
						var options = {};

						// overrides default options if specified through gridster attribute
						if (optionsKey) {
							options = $parse(optionsKey)(scope);

							// watch the specified options in case the user changes them
							scope.$watch(optionsKey, function (newOptions, oldOptions) {
								if (newOptions === oldOptions) {
									return;
								}
								controller.setOptions(newOptions);

								if (typeof newOptions.draggable !== 'undefined' && typeof oldOptions.draggable !== 'undefined' && newOptions.draggable !== oldOptions.draggable) {
									scope.$broadcast('draggable-changed', newOptions.draggable);
								}

								if (typeof newOptions.resizable !== 'undefined' && typeof oldOptions.resizable !== 'undefined' && newOptions.resizable !== oldOptions.resizable) {
									scope.$broadcast('resizable-changed', newOptions.resizable);
								}

								controller.redraw();
								updateHeight();
							}, true);
						}

						controller.setOptions(options);
					},
					post: function (scope, $elem, attrs, controller) {
						$elem.addClass('gridster');
						$elem.removeClass('gridster-loaded');

						var $preview = angular.element('<div class="gridster-item gridster-preview-holder"></div>').appendTo($elem);

						var updateHeight = function () {
							controller.$element.css('height', (controller.options.gridHeight * controller.options.rowHeight) + controller.options.margins[0] + 'px');
						};

						scope.$watch(function () {
							return controller.options.gridHeight;
						}, updateHeight);

						scope.$watch(function () {
							return controller.options.isMobile;
						}, function (isMobile) {
							if (isMobile) {
								controller.$element.addClass('gridster-mobile');
							} else {
								controller.$element.removeClass('gridster-mobile');
							}
						});

						var prevWidth = $elem.width();

						function resize() {
							var width = $elem.width();
							if (width === prevWidth || $elem.find('.gridster-item-moving').length > 0) {
								return;
							}
							prevWidth = width;
							$elem.removeClass('gridster-loaded');
							controller.redraw();
							updateHeight();
							scope.$broadcast('gridster-resized', [width, $elem.height()]);
							$elem.addClass('gridster-loaded');
						}

						angular.element(window).on('resize', function () {
							resize();
							scope.$apply();
						});
						scope.$watch(function () {
							return $elem.width();
						}, resize);

						$elem.bind('$destroy', function () {
							try {
								this.$preview.remove();
								controller.destroy();
							} catch (e) {}
						});

						controller.init($elem, $preview);
						controller.redraw();

						$timeout(function () {
							controller.floatItemsUp();
							$elem.addClass('gridster-loaded');
						}, 100);
					}
				};
			}
		};
	}
])

.controller('GridsterItemCtrl', function () {
	return {
		$element: null,
		gridster: null,
		dragging: false,
		resizing: false,
		row: null,
		col: null,
		sizeX: null,
		sizeY: null,
		init: function ($element, gridster) {
			this.$element = $element;
			this.gridster = gridster;
			this.sizeX = gridster.options.defaultSizeX;
			this.sizeY = gridster.options.defaultSizeY;
		},
		destroy: function () {
			this.gridster = null;
			this.$element = null;
		},

		/**
		 * Returns the items most important attributes
		 */
		toJSON: function () {
			return {
				row: this.row,
				col: this.col,
				sizeY: this.sizeY,
				sizeX: this.sizeX
			};
		},

		/**
		 * Set the items position
		 *
		 * @param {number} row
		 * @param {number} column
		 */
		setPosition: function (row, column) {
			this.gridster.putItem(this, row, column);
			this.gridster.floatItemsUp();
			this.gridster.updateHeight(this.dragging ? this.sizeY : 0);

			if (this.dragging) {
				this.gridster.setElementPosition(this.gridster.$preview, this.row, this.col);
			} else {
				this.gridster.setElementPosition(this.$element, this.row, this.col);
			}
		},

		/**
		 * Sets a specified size property
		 *
		 * @param {string} key Can be either "x" or "y"
		 * @param {number} value The size amount
		 */
		setSize: function (key, value) {
			key = key.toUpperCase();
			var camelCase = 'size' + key,
				titleCase = 'Size' + key;
			if (value === '') {
				return;
			}
			value = parseInt(value, 10);
			if (isNaN(value) || value === 0) {
				value = this.gridster.options['default' + titleCase];
			}
			var changed = !(this[camelCase] === value && this['old' + titleCase] && this['old' + titleCase] === value);
			this['old' + titleCase] = this[camelCase] = value;

			if (this.resizing) {
				this.gridster.setElementPosition(this.gridster.$preview, this.row, this.col);
				this.gridster['setElement' + titleCase](this.gridster.$preview, value);
			} else {
				this.gridster['setElement' + titleCase](this.$element, value);
			}
			if (changed) {
				this.gridster.moveOverlappingItems(this);
				this.gridster.floatItemsUp();
				this.gridster.updateHeight(this.dragging ? this.sizeY : 0);
			}
		},

		/**
		 * Sets the items sizeY property
		 *
		 * @param {number} rows
		 */
		setSizeY: function (rows) {
			this.setSize('y', rows);
		},

		/**
		 * Sets the items sizeX property
		 *
		 * @param {number} rows
		 */
		setSizeX: function (columns) {
			this.setSize('x', columns);
		}
	};
})

/**
 * GridsterItem directive
 *
 * @param {object} $parse
 * @param {object} $controller
 * @param {object} $timeout
 */
.directive('gridsterItem', ['$parse', '$controller', '$timeout',
	function ($parse, $controller, $timeout) {
		return {
			restrict: 'EAC',
			require: '^gridster',
			link: function (scope, $el, attrs, gridster) {
				var optionsKey = attrs.gridsterItem,
					options;

				var item = $controller('GridsterItemCtrl'),
					draggablePossible = typeof $el.draggable === 'function',
					resizablePossible = typeof $el.resizable === 'function';

				//bind the items position properties
				if (optionsKey) {
					var $optionsGetter = $parse(optionsKey);
					options = $optionsGetter(scope) || {};
					if (!options && $optionsGetter.assign) {
						options = {
							row: item.row,
							col: item.col,
							sizeX: item.sizeX,
							sizeY: item.sizeY
						};
						$optionsGetter.assign(scope, options);
					}
				} else {
					options = attrs;
				}

				item.init($el, gridster);

				$el.addClass('gridster-item');
				$el.addClass('gridster-item-moving');

				function setDraggable(enable) {
					if (draggablePossible) {
						if (enable) {
							$el.draggable({
								handle: gridster.options.draggable && gridster.options.draggable.handle ? gridster.options.draggable.handle : null,
								refreshPositions: true,
								start: function (e, widget) {
									$el.addClass('gridster-item-moving');
									item.dragging = true;
									gridster.$preview.show();
									gridster.setElementSizeX(gridster.$preview, item.sizeX);
									gridster.setElementSizeY(gridster.$preview, item.sizeY);
									gridster.setElementPosition(gridster.$preview, item.row, item.col);
									gridster.updateHeight(item.sizeY);
									scope.$apply();
									if (gridster.options.draggable && gridster.options.draggable.start) {
										gridster.options.draggable.start(e, widget, $el);
										scope.$apply();
									}
								},
								drag: function (e, widget) {
									item.row = gridster.pixelsToRows(widget.position.top);
									item.col = gridster.pixelsToColumns(widget.position.left);
									scope.$apply();
									if (gridster.options.draggable && gridster.options.draggable.drag) {
										gridster.options.draggable.drag(e, widget, $el);
										scope.$apply();
									}
								},
								stop: function (e, widget) {
									$el.removeClass('gridster-item-moving');
									item.row = gridster.pixelsToRows(widget.position.top);
									item.col = gridster.pixelsToColumns(widget.position.left);
									item.dragging = false;
									gridster.$preview.hide();
									item.setPosition(item.row, item.col);
									gridster.updateHeight();
									scope.$apply();
									if (gridster.options.draggable && gridster.options.draggable.stop) {
										gridster.options.draggable.stop(e, widget, $el);
										scope.$apply();
									}
								}
							});
						} else {
							try {
								$el.draggable('destroy');
							} catch (e) {}
						}
					}
				}

				function updateResizableDimensions(enabled) {
					if (resizablePossible && enabled) {
						$el.resizable('option', 'minHeight', gridster.options.minRows * gridster.options.rowHeight - gridster.options.margins[0]);
						$el.resizable('option', 'maxHeight', gridster.options.maxRows * gridster.options.rowHeight - gridster.options.margins[0]);
						$el.resizable('option', 'minWidth', gridster.options.minColumns * gridster.options.colWidth - gridster.options.margins[1]);
						$el.resizable('option', 'maxWidth', gridster.options.maxColumns * gridster.options.colWidth - gridster.options.margins[1]);
					}
				}

				function setResizable(enable) {
					if (resizablePossible) {
						if (enable) {
							$el.resizable({
								autoHide: true,
								handles: 'n, e, s, w, ne, se, sw, nw',
								minHeight: gridster.options.minRows * gridster.options.rowHeight - gridster.options.margins[0],
								maxHeight: gridster.options.maxRows * gridster.options.rowHeight - gridster.options.margins[0],
								minWidth: gridster.options.minColumns * gridster.options.colWidth - gridster.options.margins[1],
								maxWidth: gridster.options.maxColumns * gridster.options.colWidth - gridster.options.margins[1],
								start: function (e, widget) {
									$el.addClass('gridster-item-moving');
									item.resizing = true;
									item.dragging = true;
									gridster.$preview.fadeIn(300);
									gridster.setElementSizeX(gridster.$preview, item.sizeX);
									gridster.setElementSizeY(gridster.$preview, item.sizeY);
									scope.$apply();
									if (gridster.options.resizable && gridster.options.resizable.start) {
										gridster.options.resizable.start(e, widget, $el);
										scope.$apply();
									}
								},
								resize: function (e, widget) {
									item.row = gridster.pixelsToRows(widget.position.top, false);
									item.col = gridster.pixelsToColumns(widget.position.left, false);
									item.sizeX = gridster.pixelsToColumns(widget.size.width, true);
									item.sizeY = gridster.pixelsToRows(widget.size.height, true);
									scope.$apply();
									if (gridster.options.resizable && gridster.options.resizable.resize) {
										gridster.options.resizable.resize(e, widget, $el);
										scope.$apply();
									}
								},
								stop: function (e, widget) {
									$el.removeClass('gridster-item-moving');
									item.row = gridster.pixelsToRows(widget.position.top, false);
									item.col = gridster.pixelsToColumns(widget.position.left, false);
									item.sizeX = gridster.pixelsToColumns(widget.size.width, true);
									item.sizeY = gridster.pixelsToRows(widget.size.height, true);
									item.resizing = false;
									item.dragging = false;
									gridster.$preview.fadeOut(300);
									item.setPosition(item.row, item.col);
									item.setSizeY(item.sizeY);
									item.setSizeX(item.sizeX);
									scope.$apply();
									if (gridster.options.resizable && gridster.options.resizable.stop) {
										gridster.options.resizable.stop(e, widget, $el);
										scope.$apply();
									}
								}
							});
						} else {
							try {
								$el.resizable('destroy');
							} catch (e) {}
						}
					}
				}

				var aspects = ['sizeX', 'sizeY', 'row', 'col'],
					$getters = {};

				var aspectFn = function (aspect) {
					var key;
					if (typeof options[aspect] === 'string') {
						key = options[aspect];
					} else if (typeof options[aspect.toLowerCase()] === 'string') {
						key = options[aspect.toLowerCase()];
					} else if (optionsKey) {
						key = $parse(optionsKey + '.' + aspect);
					} else {
						return;
					}
					$getters[aspect] = $parse(key);
					scope.$watch(key, function (newVal) {
						newVal = parseInt(newVal, 10);
						if (!isNaN(newVal)) {
							item[aspect] = newVal;
						}
					});
					var val = $getters[aspect](scope);
					if (typeof val === 'number') {
						item[aspect] = val;
					}
				};

				for (var i = 0, l = aspects.length; i < l; ++i) {
					aspectFn(aspects[i]);
				}

				function positionChanged() {
					item.setPosition(item.row, item.col);
					if ($getters.row && $getters.row.assign) {
						$getters.row.assign(scope, item.row);
					}
					if ($getters.col && $getters.col.assign) {
						$getters.col.assign(scope, item.col);
					}
				}
				scope.$watch(function () {
					return item.row;
				}, positionChanged);
				scope.$watch(function () {
					return item.col;
				}, positionChanged);

				scope.$on('draggable-changed', function (event, draggable) {
					setDraggable(draggable.enabled);
				});

				scope.$on('resizable-changed', function (event, resizable) {
					setResizable(resizable.enabled);
				});

				scope.$on('gridster-resized', function () {
					updateResizableDimensions(typeof gridster.options.resizable !== 'undefined' && typeof gridster.options.resizable.enabled !== 'undefined' && gridster.options.resizable.enabled);
				});

				setDraggable(typeof gridster.options.draggable !== 'undefined' && typeof gridster.options.draggable.enabled !== 'undefined' && gridster.options.draggable.enabled);
				setResizable(typeof gridster.options.resizable !== 'undefined' && typeof gridster.options.resizable.enabled !== 'undefined' && gridster.options.resizable.enabled);

				scope.$watch(function () {
					return item.sizeY;
				}, function (sizeY) {
					item.setSizeY(sizeY);
					if ($getters.sizeY && $getters.sizeY.assign) {
						$getters.sizeY.assign(scope, item.sizeY);
					}
				});
				scope.$watch(function () {
					return item.sizeX;
				}, function (sizeX) {
					item.setSizeX(sizeX);
					if ($getters.sizeX && $getters.sizeX.assign) {
						$getters.sizeX.assign(scope, item.sizeX);
					}
				});

				$timeout(function () {
					$el.removeClass('gridster-item-moving');
				}, 100);

				return $el.bind('$destroy', function () {
					try {
						gridster.removeItem(item);
					} catch (e) {}
					try {
						item.destroy();
					} catch (e) {}
					try {
						$el.draggable('destroy');
					} catch (e) {}
					try {
						$el.resizable('destroy');
					} catch (e) {}
				});
			}
		};
	}
])

;
