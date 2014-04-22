'use strict';

angular.module('gridster', [])

.controller('GridsterCtrl', function(){

	function deepExtend(destination, source) {
		for (var property in source) {
			if (
				source[property] && source[property].constructor
				&& source[property].constructor === Object
			) {
				destination[property] = destination[property] || {};
				deepExtend(destination[property], source[property]);
			} else if (
				source[property] && source[property].constructor
				&& source[property].constructor === Array
			) {
				destination[property] = destination[property] || [];
				deepExtend(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	}

	return {
		grid: [],
		$preview: null,
		$element: null,
		opts: {
			colWidth: 'auto',
			rowHeight: 'match',
			minColumns: 1,
			minRows: 1,
			columns: 6,
			margins: [10, 10],
			defaultSizeX: 2,
			defaultSizeY: 1,
			minGridRows: 2,
			maxGridRows: 100,
			mobileBreakPoint: 600,
			resizable: {
				enabled: true
			},
			draggable: {
				enabled: true
			}
		},
		width: 1000,
		columns: 5,
		colWidth: 'auto',
		rowHeight: 'match',
		gridHeight: 2,
		maxGridRows: 100,
		margins: [10, 10],
		isMobile: false,

		// construct, configure, destruct
		init: function($element, $preview) {
			this.$element = $element;
			this.$preview = $preview;
		},
		setMargins: function(margins) {
			this.margins = margins;
		},
		getColumns: function() {
			return this.columns;
		},
		getMinColumns: function() {
			return this.minColumns;
		},
		getMaxColumns: function() {
			return this.maxColumns;
		},
		getMinRows: function() {
			return this.minRows;
		},
		getMaxRows: function() {
			return this.maxRows;
		},
		setInteger: function(prop, value) {
			if (!value) {
				return;
			}
			value = parseInt(value, 10);
			if (!isNaN(value)) {
				this[prop] = value;
			}
		},
		setFloat: function(prop, value) {
			if (!value) {
				return;
			}
			value = parseFloat(value, 10);
			if (!isNaN(value)) {
				this[prop] = value;
			}
		},
		setColumns: function(columns) {
			this.setInteger('columns', columns);
		},
		setMinColumns: function(minColumns) {
			this.setInteger('minColumns', minColumns);
		},
		setMaxColumns: function(maxColumns) {
			this.setInteger('maxColumns', maxColumns);
		},
		setMinRows: function(minRows) {
			this.setInteger('minRows', minRows);
		},
		setMaxRows: function(maxRows) {
			this.setInteger('maxRows', maxRows);
		},
		setWidth: function(pixels) {
			this.setFloat('width', pixels);
		},
		setColWidth: function(pixels) {
			if (pixels === 'auto') {
				this.colWidth = (this.width - this.margins[1]) / this.columns;
			} else {
				this.setFloat('colWidth', pixels);
			}
		},
		setRowHeight: function(pixels) {
			if (pixels === 'match') {
				this.rowHeight = this.colWidth;
			} else {
				this.setFloat('rowHeight', pixels);
			}
		},
		setMaxGridRows: function(rows) {
			this.setInteger('maxGridRows', rows);
		},
		getRowHeight: function() {
			return this.rowHeight;
		},
		destroy: function() {
			this.grid && (this.grid.length = 0);
			this.opts = this.margins = this.grid = this.$element = this.$preview = null;
		},
		setOpts: function(opts) {
			if (opts) {
				deepExtend(this.opts, opts);
			}
			if (this.opts.margins) {
				this.margins = this.opts.margins;
			}
			if (this.opts.columns) {
				this.setColumns(this.opts.columns);
			}
			if (this.opts.minColumns) {
				this.setMinColumns(this.opts.minColumns);
			}
			if (this.opts.maxColumns) {
				this.setMaxColumns(this.opts.maxColumns);
			}
			if (this.opts.minRows) {
				this.setMinRows(this.opts.minRows);
			}
			if (this.opts.maxRows) {
				this.setMaxRows(this.opts.maxRows);
			}
			if (this.opts.width) {
				this.setWidth(this.opts.width);
			} else if (this.$element) {
				this.setWidth(this.$element.width());
			}
			if (this.opts.colWidth) {
				this.setColWidth(this.opts.colWidth);
			}
			if (this.opts.rowHeight) {
				this.setRowHeight(this.opts.rowHeight);
			}
			if (this.opts.maxGridRows) {
				this.setMaxGridRows(this.opts.maxGridRows);
			}
		},
		redraw: function(){
			this.setOpts();

			this.isMobile = this.width <= this.opts.mobileBreakPoint;

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

		// grid management
		canItemOccupy: function(item, row, column) {
			return row > -1 && column > -1 && item.sizeX + column <= this.columns;
		},
		autoSetItemPosition: function(item) {
			// walk through each row and column looking for a place it will fit
			for (var rowIndex = 0; rowIndex < this.maxGridRows; ++rowIndex) {
				for (var colIndex = 0; colIndex < this.columns; ++colIndex) {
					var occupied = this.getItem(rowIndex, colIndex),
						canFit = this.canItemOccupy(item, rowIndex, colIndex);
					if (!occupied && canFit) {
						this.putItem(item, rowIndex, colIndex);
						return;
					}
				}
			}
			throw new Error('Unable to place item!');
		},
		getItems: function(row, column, sizeX, sizeY, excludeItems) {
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
					if (
						item
						&& (!excludeItems || excludeItems.indexOf(item) === -1)
						&& items.indexOf(item) === -1
					) {
						items.push(item);
					}
				}
			}
			return items;
		},
		removeItem: function(item) {
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
			updateHeight();
		},
		getItem: function(row, column, excludeItems) {
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
						if (
							item
							&& (!excludeItems || excludeItems.indexOf(item) === -1)
							&& item.sizeX >= sizeX
							&& item.sizeY >= sizeY
						) {
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
		putItems: function(items) {
			for (var i = 0, l = items.length; i < l; ++i) {
				this.putItem(items[i]);
			}
		},
		putItem: function(item, row, column) {
			if (typeof row === 'undefined' || row === null) {
				row = item.row;
				column = item.col;
				if (typeof row === 'undefined' || row === null) {
					this.autoSetItemPosition(item);
					return;
				}
			}
			if (!this.canItemOccupy(item, row, column)) {
				column = Math.min(this.columns - item.sizeX, Math.max(0, column));
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
		moveOverlappingItems: function(item) {
			var items = this.getItems(
				item.row,
				item.col,
				item.sizeX,
				item.sizeY,
				item
			);
			this.moveItemsDown(items, item.row + item.sizeY);
		},
		moveItemsDown: function(items, toRow) {
			if (!items || items.length === 0) {
				return;
			}
			var topRows = {}, item, i, l;
			// calculate the top rows in each column
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var topRow = topRows[item.col];
				if (typeof topRow === 'undefined' || item.row < topRow) {
					topRows[item.col] = item.row;
				}
			}
			// move each item down from the top row in its column to the toRow
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var columnOffset = toRow - topRows[item.col];
				this.putItem(
					item,
					item.row + columnOffset,
					item.col
				);
			}
		},
		floatItemsUp: function() {
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
		floatItemUp: function(item) {
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
		updateHeight: function(plus) {
			var maxHeight = this.opts.minGridRows;
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
			this.gridHeight = Math.min(this.maxGridRows, maxHeight);
		},

		// css helpers
		pixelsToRows: function(pixels, ceilOrFloor) {
			if (ceilOrFloor === true) {
				return Math.ceil(pixels / this.rowHeight);
			} else if (ceilOrFloor === false) {
				return Math.floor(pixels / this.rowHeight);
			}
			return Math.round(pixels / this.rowHeight);
		},
		pixelsToColumns: function(pixels, ceilOrFloor) {
			if (ceilOrFloor === true) {
				return Math.ceil(pixels / this.colWidth);
			} else if (ceilOrFloor === false) {
				return Math.floor(pixels / this.colWidth);
			}
			return Math.round(pixels / this.colWidth);
		},
		setElementPosition: function($el, row, column) {
			if (this.isMobile) {
				$el.css({
					margin: this.margins[0] + 'px',
					top: 'auto',
					left: 'auto'
				});
			} else {
				$el.css({
					margin: 0,
					top: row * this.rowHeight + this.margins[0],
					left: column * this.colWidth + this.margins[1]
				});
			}
		},
		setElementSizeY: function($el, rows) {
			if (this.isMobile) {
				$el.css('height', 'auto');
			} else {
				$el.css('height', (rows * this.rowHeight) - this.margins[0] + 'px');
			}
		},
		setElementSizeX: function($el, columns) {
			if (this.isMobile) {
				$el.css('width', 'auto');
			} else {
				$el.css('width', (columns * this.colWidth) - this.margins[1] + 'px');
			}
		}
	};
})

.directive('gridster', ['$parse', '$timeout', function($parse, $timeout) {
	return {
		restrict: 'EAC',
		controller: 'GridsterCtrl',
		compile: function compile(tElement, tAttrs, transclude) {
			return {
				pre: function(scope, $elem, attrs, controller) {
					function updateHeight() {
						controller.$element.css('height', (controller.gridHeight * controller.rowHeight) + controller.margins[0] + 'px');
					}

					var optsKey = attrs.gridster,
						opts = {};
					if (optsKey) {
						var optsGetter = $parse(optsKey);
						opts = optsGetter(scope);

						scope.$watch(optsKey, function(newOpts, oldOpts){
							if (newOpts === oldOpts) {
								return;
							}
							controller.setOpts(newOpts);

							if (
								typeof newOpts.draggable !== 'undefined'
								&& typeof oldOpts.draggable !== 'undefined'
								&& newOpts.draggable !== oldOpts.draggable
							) {
								scope.$broadcast('draggable-changed', newOpts.draggable);
							}

							if (
								typeof newOpts.resizable !== 'undefined'
								&& typeof oldOpts.resizable !== 'undefined'
								&& newOpts.resizable !== oldOpts.resizable
							) {
								scope.$broadcast('resizable-changed', newOpts.resizable);
							}

							controller.redraw();
							updateHeight();
						}, true);
					}

					controller.setOpts(opts);
				},
				post: function(scope, $elem, attrs, controller) {
					$elem.addClass('gridster');
					$elem.removeClass('gridster-loaded');
					var $preview =  angular.element('<div class="gridster-item gridster-preview-holder"></div>')
						.appendTo($elem);

					function updateHeight() {
						controller.$element.css('height', (controller.gridHeight * controller.rowHeight) + controller.margins[0] + 'px');
					}

					scope.$watch(function(){
						return controller.gridHeight;
					}, updateHeight);

					scope.$watch(function(){
						return controller.isMobile;
					}, function(isMobile){
						if (isMobile) {
							controller.$element.addClass('gridster-mobile');
						} else {
							controller.$element.removeClass('gridster-mobile');
						}
					});

					var prevWidth = $elem.width();
					function resize() {
						var width = $elem.width();
						if (
							width === prevWidth
							|| $elem.find('.gridster-item-moving').length > 0
						) {
							return;
						}
						prevWidth = width;
						$elem.removeClass('gridster-loaded');
						controller.redraw();
						updateHeight();
						scope.$broadcast('gridster-resized', [width, $elem.height()]);
						$elem.addClass('gridster-loaded');
					}

					angular.element(window).on('resize', function(){
						resize();
						scope.$apply();
					});
					scope.$watch(function() {
						return $elem.width();
					}, resize);

					$elem.bind('$destroy', function() {
						try {
							this.$preview.remove();
							controller.destroy();
						} catch (e) {}
					});

					controller.init($elem, $preview);
					controller.redraw();

					$timeout(function(){
						controller.floatItemsUp();
						$elem.addClass('gridster-loaded');
					}, 100);
				}
			};
		}
	};
}])

.controller('GridsterItemCtrl', function(){
	return {
		$element: null,
		gridster: null,
		dragging: false,
		resizing: false,
		row: null,
		col: null,
		sizeX: null,
		sizeY: null,
		init: function($element, gridster) {
			this.$element = $element;
			this.gridster = gridster;
			this.sizeX = gridster.opts.defaultSizeX;
			this.sizeY = gridster.opts.defaultSizeY;
		},
		destroy: function() {
			this.gridster = null;
			this.$element = null;
		},
		toJSON: function() {
			return {
				row: this.row,
				col: this.col,
				sizeY: this.sizeY,
				sizeX: this.sizeX
			};
		},
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
		setSize: function (key, value) {
			key = key.toUpperCase();
			var camelCase = 'size' + key,
				titleCase = 'Size' + key;
			if (value === '') {
				return;
			}
			value = parseInt(value, 10);
			if (isNaN(value) || value === 0) {
				value = this.gridster.opts['default' + titleCase];
			}
			var changed = !(
				this[camelCase] === value
				&& this['old' + titleCase]
				&& this['old' + titleCase] === value
			);
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
		setSizeY: function (rows) {
			this.setSize('y', rows);
		},
		setSizeX: function (columns) {
			this.setSize('x', columns);
		}
	};
})

.directive('gridsterItem', ['$parse', '$controller', '$timeout', function($parse, $controller, $timeout) {
	return {
		restrict: 'EAC',
		require: '^gridster',
		link: function(scope, $el, attrs, gridster) {
			var optsKey = attrs.gridsterItem,
				opts;

			var item = $controller('GridsterItemCtrl'),
				draggablePossible = typeof $el.draggable === 'function',
				resizablePossible = typeof $el.resizable === 'function';

			if (optsKey) {
				var $optsGetter = $parse(optsKey);
				opts = $optsGetter(scope) || {};
				if (!opts && $optsGetter.assign) {
					opts = {
						row: item.row,
						col: item.col,
						sizeX: item.sizeX,
						sizeY: item.sizeY
					};
					$optsGetter.assign(scope, opts);
				}
			} else {
				opts = attrs;
			}

			item.init($el, gridster);

			$el.addClass('gridster-item');
			$el.addClass('gridster-item-moving');

			function setDraggable(enable) {
				if(draggablePossible) {
					if(enable) {
						$el.draggable({
							handle: gridster.opts.draggable && gridster.opts.draggable.handle ? gridster.opts.draggable.handle : null,
			//				containment: '.gridster',
							refreshPositions: true,
							start: function(e, widget) {
								$el.addClass('gridster-item-moving');
								item.dragging = true;
								gridster.$preview.show();
								gridster.setElementSizeX(gridster.$preview, item.sizeX);
								gridster.setElementSizeY(gridster.$preview, item.sizeY);
								gridster.setElementPosition(gridster.$preview, item.row, item.col);
								gridster.updateHeight(item.sizeY);
								scope.$apply();
								if (gridster.opts.draggable && gridster.opts.draggable.start) {
									gridster.opts.draggable.start(e, widget, $el);
									scope.$apply();
								}
							},
							drag: function(e, widget) {
								item.row = gridster.pixelsToRows(widget.position.top);
								item.col = gridster.pixelsToColumns(widget.position.left);
								scope.$apply();
								if (gridster.opts.draggable && gridster.opts.draggable.drag) {
									gridster.opts.draggable.drag(e, widget, $el);
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
								if (gridster.opts.draggable && gridster.opts.draggable.stop) {
									gridster.opts.draggable.stop(e, widget, $el);
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
				if(resizablePossible && enabled) {
					$el.resizable( "option", "minHeight", (gridster.minRows ? gridster.minRows : 1) * gridster.rowHeight - gridster.margins[0] );
					$el.resizable( "option", "maxHeight", (gridster.maxRows ? gridster.maxRows : gridster.maxGridRows) * gridster.rowHeight - gridster.margins[0] );
					$el.resizable( "option", "minWidth", (gridster.minColumns ? gridster.minColumns : 1) * gridster.colWidth - gridster.margins[1] );
					$el.resizable( "option", "maxWidth", (gridster.maxColumns ? gridster.maxColumns : gridster.columns) * gridster.colWidth - gridster.margins[1] );
				}
			}

			function setResizable(enable) {
				if(resizablePossible) {
					if(enable) {
						$el.resizable({
							autoHide: true,
							handles: 'n, e, s, w, ne, se, sw, nw',
							minHeight: (gridster.minRows ? gridster.minRows : 1) * gridster.rowHeight - gridster.margins[0],
							maxHeight: (gridster.maxRows ? gridster.maxRows : gridster.maxGridRows) * gridster.rowHeight - gridster.margins[0],
							minWidth: (gridster.minColumns ? gridster.minColumns : 1) * gridster.colWidth - gridster.margins[1],
							maxWidth: (gridster.maxColumns ? gridster.maxColumns : gridster.columns) * gridster.colWidth - gridster.margins[1],
							start: function(e, widget) {
								$el.addClass('gridster-item-moving');
								item.resizing = true;
								item.dragging = true;
								gridster.$preview.fadeIn(300);
								gridster.setElementSizeX(gridster.$preview, item.sizeX);
								gridster.setElementSizeY(gridster.$preview, item.sizeY);
								scope.$apply();
								if (gridster.opts.resizable && gridster.opts.resizable.start) {
									gridster.opts.resizable.start(e, widget, $el);
									scope.$apply();
								}
							},
							resize: function(e, widget) {
								item.row = gridster.pixelsToRows(widget.position.top, false);
								item.col = gridster.pixelsToColumns(widget.position.left, false);
								item.sizeX = gridster.pixelsToColumns(widget.size.width, true);
								item.sizeY = gridster.pixelsToRows(widget.size.height, true);
								scope.$apply();
								if (gridster.opts.resizable && gridster.opts.resizable.resize) {
									gridster.opts.resizable.resize(e, widget, $el);
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
								if (gridster.opts.resizable && gridster.opts.resizable.stop) {
									gridster.opts.resizable.stop(e, widget, $el);
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
			for (var i = 0, l = aspects.length; i < l; ++i) {
				(function(aspect){
					var key;
					if (typeof opts[aspect] === 'string') {
						key = opts[aspect];
					} else if (typeof opts[aspect.toLowerCase()] === 'string') {
						key = opts[aspect.toLowerCase()];
					} else if (optsKey) {
						key = $parse(optsKey + '.' + aspect);
					} else {
						return;
					}
					$getters[aspect] = $parse(key);
					scope.$watch(key, function(newVal){
						newVal = parseInt(newVal, 10);
						if (!isNaN(newVal)) {
							item[aspect] = newVal;
						}
					});
					var val = $getters[aspect](scope);
					if (typeof val === 'number') {
						item[aspect] = val;
					}
				})(aspects[i]);
			}

			function positionChanged() {
				item.setPosition(item.row, item.col);
				if ($getters['row'] && $getters['row'].assign) {
					$getters['row'].assign(scope, item.row);
				}
				if ($getters['col'] && $getters['col'].assign) {
					$getters['col'].assign(scope, item.col);
				}
			}
			scope.$watch(function() {
				return item.row;
			}, positionChanged);
			scope.$watch(function() {
				return item.col;
			}, positionChanged);

			scope.$on('draggable-changed', function(event, draggable) {
				setDraggable(draggable.enabled);
			});

			scope.$on('resizable-changed', function(event, resizable) {
				setResizable(resizable.enabled);
			});

			scope.$on('gridster-resized', function(event, dimensions) {
				updateResizableDimensions(typeof gridster.opts.resizable !== 'undefined'
                                && typeof gridster.opts.resizable.enabled !== 'undefined'
                                && gridster.opts.resizable.enabled);
			});

			setDraggable(
				typeof gridster.opts.draggable !== 'undefined'
				&& typeof gridster.opts.draggable.enabled !== 'undefined'
				&& gridster.opts.draggable.enabled
			);
			setResizable(
				typeof gridster.opts.resizable !== 'undefined'
				&& typeof gridster.opts.resizable.enabled !== 'undefined'
				&& gridster.opts.resizable.enabled
			);

			scope.$watch(function() {
				return item.sizeY;
			}, function(sizeY) {
				item.setSizeY(sizeY);
				if ($getters['sizeY'] && $getters['sizeY'].assign) {
					$getters['sizeY'].assign(scope, item.sizeY);
				}
			});
			scope.$watch(function() {
				return item.sizeX;
			}, function(sizeX) {
				item.setSizeX(sizeX);
				if ($getters['sizeX'] && $getters['sizeX'].assign) {
					$getters['sizeX'].assign(scope, item.sizeX);
				}
			});

			$timeout(function(){
				$el.removeClass('gridster-item-moving');
			}, 100);

			return $el.bind('$destroy', function() {
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
}])

;
