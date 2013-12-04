'use strict';

angular.module('gridster', [])

.controller('GridsterCtrl', function(){
	return {
		grid: [],
		$preview: null,
		$element: null,
		opts: null,
		columns: 5,
		colWidth: null,
		rowHeight: null,
		gridHeight: 2,
		margins: [10, 10],
		isMobile: false,

		// construct, configure, destruct
		init: function($element, $preview, opts) {
			this.opts = opts;
			this.$element = $element;
			this.$preview = $preview;
			this.redraw();
		},
		setMargins: function(margins) {
			this.margins = margins;
		},
		setColumns: function(columns) {
			this.columns = columns;
		},
		getColumns: function() {
			return this.columns;
		},
		setColWidth: function(pixels) {
			if (pixels === 'auto') {
				this.colWidth = (this.$element.width() - this.margins[1]) / this.columns;
			} else {
				this.colWidth = pixels;
			}
		},
		setRowHeight: function(pixels) {
			if (pixels === 'match') {
				this.rowHeight = this.colWidth;
			} else {
				this.rowHeight = pixels;
			}
		},
		getRowHeight: function() {
			return this.rowHeight;
		},
		destroy: function() {
			this.grid && (this.grid.length = 0);
			this.opts = this.margins = this.grid = this.$element = this.$preview = null;
		},
		redraw: function(){
			if (this.opts.margins) {
				this.margins = this.opts.margins;
			}
			if (this.opts.columns) {
				this.setColumns(this.opts.columns);
			}
			if (this.opts.colWidth) {
				this.setColWidth(this.opts.colWidth);
			}
			if (this.opts.rowHeight) {
				this.setRowHeight(this.opts.rowHeight);
			}
			this.isMobile = $(window).width() <= this.opts.mobileBreakPoint;
			for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
				var columns = this.grid[rowIndex];
				if (!columns) {
					continue;
				}
				for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
					if (columns[colIndex]) {
						var item = columns[colIndex];
						var $el = item.$element;
						this.setElementPosition($el, item.row, item.column);
						this.setElementHeight($el, item.height);
						this.setElementWidth($el, item.width);
					}
				}
			}
		},

		// grid management
		canItemOccupy: function(item, row, column) {
			return row > -1 && column > -1 && item.width + column <= this.columns;
		},
		autoSetItemPosition: function(item) {
			// walk through each row and column looking for a place it will fit
			for (var rowIndex = 0; rowIndex < 100; ++rowIndex) {
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
		getItems: function(row, column, width, height, excludeItems) {
			var items = [];
			if (!width || !height) {
				width = height = 1;
			}
			if (excludeItems && !(excludeItems instanceof Array)) {
				excludeItems = [excludeItems];
			}
			for (var h = 0; h < height; ++h) {
				for (var w = 0; w < width; ++w) {
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
			var height = 1;
			while (row > -1) {
				var width = 1,
					col = column;
				while (col > -1) {
					if (this.grid[row]) {
						var item = this.grid[row][col];
						if (
							item
							&& (!excludeItems || excludeItems.indexOf(item) === -1)
							&& item.width >= width
							&& item.height >= height
						) {
							return this.grid[row][col];
						}
					}
					++width;
					--col;
				}
				--row;
				++height;
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
				column = item.column;
				if (typeof row === 'undefined' || row === null) {
					this.autoSetItemPosition(item);
					return;
				}
			}
			if (!this.canItemOccupy(item, row, column)) {
				column = Math.min(this.columns - item.width, Math.max(0, column));
				row = Math.max(0, row);
			}

			if (item && item.oldRow !== null && typeof item.oldRow !== 'undefined') {
				if (item.oldRow === row && item.oldColumn === column) {
					item.row = row;
					item.column = column;
					return;
				} else {
					// remove from old position
					var oldRow = this.grid[item.oldRow];
					if (oldRow && oldRow[item.oldColumn] === item) {
						oldRow[item.oldColumn] = null;
					}
				}
			}

			item.oldRow = item.row = row;
			item.oldColumn = item.column = column;

			this.moveOverlappingItems(item);

			if (!this.grid[row]) {
				this.grid[row] = [];
			}
			this.grid[row][column] = item;
		},
		moveOverlappingItems: function(item) {
			var items = this.getItems(
				item.row,
				item.column,
				item.width,
				item.height,
				item
			);
			this.moveItemsDown(items, item.row + item.height);
		},
		moveItemsDown: function(items, toRow) {
			if (!items || items.length === 0) {
				return;
			}
			var topRows = {}, item, i, l;
			// calculate the top rows in each column
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var topRow = topRows[item.column];
				if (typeof topRow === 'undefined' || item.row < topRow) {
					topRows[item.column] = item.row;
				}
			}
			// move each item down from the top row in its column to the toRow
			for (i = 0, l = items.length; i < l; ++i) {
				item = items[i];
				var columnOffset = toRow - topRows[item.column];
				this.putItem(
					item,
					item.row + columnOffset,
					item.column
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
			var colIndex = item.column,
				height = item.height,
				width = item.width,
				bestRow = null,
				bestColumn = null,
				rowIndex = item.row - 1;
			while (rowIndex > -1) {
				var items = this.getItems(rowIndex, colIndex, width, height, item);
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
			var maxHeight = this.opts.minRows;
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
						maxHeight = Math.max(maxHeight, rowIndex + plus + columns[colIndex].height);
					}
				}
			}
			this.gridHeight = Math.min(this.opts.maxRows, maxHeight);
		},

		// css helpers
		pixelsToRows: function(pixels, ceil) {
			if (ceil) {
				return Math.ceil(pixels / this.rowHeight);
			}
			return Math.round(pixels / this.rowHeight);
		},
		pixelsToColumns: function(pixels, ceil) {
			if (ceil) {
				return Math.ceil(pixels / this.colWidth);
			}
			return Math.round(pixels / this.colWidth);
		},
		setElementPosition: function($el, row, column) {
			$el.removeClass('ui-draggable-dragging');
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
		setElementHeight: function($el, rows) {
			$el.removeClass('ui-resizable-resizing');
			if (this.isMobile) {
				$el.css('height', 'auto');
			} else {
				$el.css('height', (rows * this.rowHeight) - this.margins[0] + 'px');
			}
		},
		setElementWidth: function($el, columns) {
			$el.removeClass('ui-resizable-resizing');
			if (this.isMobile) {
				$el.css('width', 'auto');
			} else {
				$el.css('width', (columns * this.colWidth) - this.margins[1] + 'px');
			}
//					$el.css('width', (width * 20) + '%');
		}
	};
})

.directive('gridster', function($parse, $timeout) {
	return {
		restrict: 'EAC',
		controller: 'GridsterCtrl',
		link: function(scope, $elem, attrs, controller) {
			var optsKey = attrs.gridster,
				opts = {
					colWidth: 'auto',
					rowHeight: 'match',
					columns: 6,
					margins: [10, 10],
					defaultHeight: 1,
					defaultWidth: 2,
					minRows: 2,
					maxRows: 100,
					mobileBreakPoint: 600
				},
				optsGetter = $parse(optsKey);
			if (optsKey) {
				opts = $.extend(true, opts, optsGetter(scope));
			}

			$elem.addClass('gridster');
			$elem.removeClass('gridster-loaded');
			var $preview =  $('<div class="gridster-item gridster-preview-holder"></div>')
				.appendTo($elem);

			scope.$watch(function(){
				return controller.gridHeight;
			}, function(height){
				controller.$element.css('height', (height * controller.rowHeight) + controller.margins[0] + 'px');
			});

			scope.$watch(function(){
				return controller.isMobile;
			}, function(isMobile){
				if (isMobile) {
					controller.$element.addClass('gridster-mobile');
				} else {
					controller.$element.removeClass('gridster-mobile');
				}
			});

			var windowWidth = $(window).width();
			$(window).on('resize', function(){
				var width = $(window).width();
				if (width === windowWidth || $elem.find('.ui-draggable-dragging, .ui-resizable-resizing').length > 0) {
					return;
				}
				$elem.removeClass('gridster-loaded');
				controller.redraw();
				$elem.addClass('gridster-loaded');
				scope.$apply();
			});
//			scope.$watch(function(){
//				return $elem.width();
//			}, function(){
//				$elem.removeClass('gridster-loaded');
//				controller.redraw();
//				$elem.addClass('gridster-loaded');
//			});

			$elem.bind('$destroy', function() {
				try {
					this.$preview.remove();
					controller.destroy();
				} catch (e) {}
			});

			controller.init($elem, $preview, opts);

			$timeout(function(){
				controller.floatItemsUp();
				$elem.addClass('gridster-loaded');
			}, 0);
		}
	};
})

.controller('GridsterItemCtrl', function(){
	return {
		$element: null,
		gridster: null,
		dragging: false,
		resizing: false,
		row: null,
		column: null,
		width: null,
		height: null,
		init: function($element, gridster, itemOpts) {
			this.$element = $element;
			this.gridster = gridster;
			this.width = gridster.opts.defaultWidth;
			this.height = gridster.opts.defaultHeight;
		},
		destroy: function() {
			this.gridster = null;
			this.$element = null;
		},
		toJSON: function() {
			return {
				row: this.row,
				column: this.column,
				height: this.height,
				width: this.width
			};
		},
		setPosition: function (row, column) {
			this.gridster.putItem(this, row, column);
			this.gridster.floatItemsUp();
			this.gridster.updateHeight(this.dragging ? this.height : 0);

			if (this.dragging) {
				this.gridster.setElementPosition(this.gridster.$preview, this.row, this.column);
			} else {
				this.gridster.setElementPosition(this.$element, this.row, this.column);
			}
		},
		setDimension: function (key, value) {
			var lower = key.toLowerCase(),
				f = lower.charAt(0).toUpperCase(),
				ucfirst = f + lower.substr(1);
			if (value === '') {
				return;
			}
			if (!value) {
				value = this.gridster.opts['default' + ucfirst];
			}
			value = parseInt(value, 10);
			var changed = !(
				this[lower] === value
				&& this['old' + ucfirst]
				&& this['old' + ucfirst] === value
			);
			this['old' + ucfirst] = this[lower] = value;

			if (this.resizing) {
				this.gridster.setElementPosition(this.gridster.$preview, this.row, this.column);
				this.gridster['setElement' + ucfirst](this.gridster.$preview, value);
			} else {
				this.gridster['setElement' + ucfirst](this.$element, value);
			}
			if (changed) {
				this.gridster.moveOverlappingItems(this);
				this.gridster.floatItemsUp();
				this.gridster.updateHeight(this.dragging ? this.height : 0);
			}
		},
		setHeight: function (rows) {
			this.setDimension('height', rows);
		},
		setWidth: function (columns) {
			this.setDimension('width', columns);
		}
	};
})

.directive('gridsterItem', function($parse, $controller) {
	return {
		restrict: 'EAC',
		require: '^gridster',
		link: function(scope, $el, attrs, gridster) {
			var optsKey = attrs.gridsterItem,
				opts = {};

			var item = $controller('GridsterItemCtrl');

			if (optsKey) {
				opts = $parse(optsKey)(scope);
			}

			item.init($el, gridster, opts);

			$el.addClass('gridster-item');

			$el.draggable({
				handle: gridster.opts.draggable && gridster.opts.draggable.handle ? gridster.opts.draggable.handle : null,
//				containment: '.gridster',
				refreshPositions: true,
				start: function(e, widget) {
					item.dragging = true;
					gridster.$preview.show();
					gridster.setElementWidth(gridster.$preview, item.width);
					gridster.setElementHeight(gridster.$preview, item.height);
					gridster.setElementPosition(gridster.$preview, item.row, item.column);
					gridster.updateHeight(item.height);
					scope.$apply();
				},
				drag: function(e, widget) {
					item.row = gridster.pixelsToRows(widget.position.top);
					item.column = gridster.pixelsToColumns(widget.position.left);
					item.dragging = true;
					scope.$apply();
				},
				stop: function (e, widget) {
					item.row = gridster.pixelsToRows(widget.position.top);
					item.column = gridster.pixelsToColumns(widget.position.left);
					item.dragging = false;
					gridster.$preview.hide();
					item.setPosition(item.row, item.column);
					gridster.updateHeight();
					scope.$apply();
				}
			});

			$el.resizable({
				minHeight: gridster.rowHeight,
				minWidth: gridster.colWidth,
				start: function(e, widget) {
					item.resizing = true;
					gridster.$preview.fadeIn(300);
					gridster.setElementWidth(gridster.$preview, item.width);
					gridster.setElementHeight(gridster.$preview, item.height);
					scope.$apply();
				},
				resize: function(e, widget) {
					item.width = gridster.pixelsToColumns(widget.size.width, true);
					item.height = gridster.pixelsToRows(widget.size.height, true);
					item.resizing = true;
					scope.$apply();
					if (gridster.opts.resize && gridster.opts.resize.resize) {
						gridster.opts.resize.resize(e, widget, $el);
						scope.$apply();
					}
				},
				stop: function (e, widget) {
					item.width = gridster.pixelsToColumns(widget.size.width, true);
					item.height = gridster.pixelsToRows(widget.size.height, true);
					item.resizing = false;
					gridster.$preview.fadeOut(300);
					item.setHeight(item.height);
					item.setWidth(item.width);
					scope.$apply();
					if (gridster.opts.resize && gridster.opts.resize.stop) {
						gridster.opts.resize.stop(e, widget, $el);
						scope.$apply();
					}
				}
			});

			var $width, $height, $row, $column;
			if (opts.width) {
				$width = $parse(opts.width);
				scope.$watch(opts.width, function(width){
					item.width = width;
				});
				item.width = $width(scope);
			}
			if (opts.height) {
				$height = $parse(opts.height);
				scope.$watch(opts.height, function(height){
					item.height = height;
				});
				item.height = $height(scope);
			}
			if (opts.row) {
				$row = $parse(opts.row);
				scope.$watch(opts.row, function(row){
					item.row = row;
				});
				item.row = $row(scope);
			}
			if (opts.column) {
				$column = $parse(opts.column);
				scope.$watch(opts.column, function(column){
					item.column = column;
				});
				item.column = $column(scope);
			}

			scope.$watch(function() {
				return item.row;
			}, function() {
				item.setPosition(item.row, item.column);
				if ($row) {
					$row.assign(scope, item.row);
				}
				if ($column) {
					$column.assign(scope, item.column);
				}
			});
			scope.$watch(function() {
				return item.column;
			}, function() {
				item.setPosition(item.row, item.column);
				if ($row) {
					$row.assign(scope, item.row);
				}
				if ($column) {
					$column.assign(scope, item.column);
				}
			});
			scope.$watch(function() {
				return item.height;
			}, function(height) {
				item.setHeight(height);
				if ($height) {
					$height.assign(scope, item.height);
				}
			});
			scope.$watch(function() {
				return item.width;
			}, function(width) {
				item.setWidth(width);
				if ($width) {
					$width.assign(scope, item.width);
				}
			});

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
})

;