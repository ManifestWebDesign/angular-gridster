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

;