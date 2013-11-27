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
		initializing: true,
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
						this.setElementPosition($el, item.position);
						this.setElementHeight($el, item.height);
						this.setElementWidth($el, item.width);
					}
				}
			}
		},

		// grid management
		canItemOccupy: function(item, position) {
			return position[1] > -1 && item.width + position[1] <= this.columns;
		},
		autoSetItemPosition: function(item) {
			var rowIndex = 0,
				colIndex = 0;
			var position = [];
			for (rowIndex = 0; rowIndex < 100; ++rowIndex) {
				for (colIndex = 0; colIndex < this.columns; ++colIndex) {
					position[0] = rowIndex;
					position[1] = colIndex;
					var occupied = this.getItem(position),
						canFit = this.canItemOccupy(item, position);
					if (!occupied && canFit) {
						this.putItem(item, position);
						return;
					}
				}
			}
			throw new Error('Unable to place item!');
		},
		getItems: function(position, width, height, excludeItem) {
			if (!position || !width || !height) {
				return [];
			}
			var items = [],
				row = position[0],
				column = position[1];
			for (var h = 0; h < height; ++h) {
				for (var w = 0; w < width; ++w) {
					var item = this.getItem([
						row + h,
						column + w
					], excludeItem);
					if (item && item !== excludeItem && items.indexOf(item) === -1) {
						items.push(item);
					}
				}
			}
			return items;
		},
		getItem: function(position, excludeItem) {
			var rowIndex = position[0],
				colIndex = position[1],
				height = 1;
			while (rowIndex > -1) {
				var width = 1,
					col = colIndex;
				while (col > -1) {
					if (this.grid[rowIndex]) {
						var item = this.grid[rowIndex][col];
						if (
							item
							&& item !== excludeItem
							&& item.width >= width
							&& item.height >= height
						) {
							return this.grid[rowIndex][col];
						}
					}
					++width;
					--col;
				}
				--rowIndex;
				++height;
			}
			return null;
		},
		putItems: function(items) {
			for (var i = 0, l = items.length; i < l; ++i) {
				this.putItem(items[i]);
			}
		},
		putItem: function(item, position) {
			if (!position) {
				position = item.position;
				if (typeof position === 'undefined') {
					this.autoSetItemPosition(item);
					return;
				}
			}
			if (!this.canItemOccupy(item, position)) {
				var column = position[1] < 0 ? 0 : this.columns - item.width;
				if (
					!item.position
					|| item.position[0] !== position[0]
				) {
					position = [
						position[0]
					];
				}
				position[1] = column;
			}

			if (item && item.oldPosition) {
				if (
					item.oldPosition[0] === position[0]
					&& item.oldPosition[1] === position[1]
				) {
					// nothing changed
					return;
				} else {
					var oldRow = this.grid[item.oldPosition[0]];
					if (oldRow && oldRow[item.oldPosition[1]] === item) {
						oldRow[item.oldPosition[1]] = null;
					}
				}
			}

			var rowIndex = position[0],
				colIndex = position[1],
				displacedItems = this.getItems(
					position,
					item.width,
					item.height,
					item
				);

			if (!this.grid[rowIndex]) {
				this.grid[rowIndex] = [];
			}
			this.grid[rowIndex][colIndex] = item;

			item.oldPosition = [position[0], position[1]];
			item.position = position;
			this.moveOverlappingItems(item, displacedItems);
		},
		moveOverlappingItems: function(item, displacedItems) {
			if (!item.position) {
				return;
			}
			if (!displacedItems) {
				displacedItems = this.getItems(
					item.position,
					item.width,
					item.height,
					item
				);
			}
			for (var i = 0, l = displacedItems.length; i < l; ++i) {
				var displacedItem = displacedItems[i];
				this.putItem(displacedItem, [
					item.position[0] + item.height,
					displacedItem.position[1]
				]);
			}
			this.floatItemsUp();
			this.updateHeight(item.dragging ? item.height : 0);
		},
		floatItemsUp: function() {
			if (this.initializing) {
				return;
			}
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
			var position = item.position,
				colIndex = position[1],
				height = item.height,
				width = item.width,
				bestPosition = null,
				rowIndex = position[0] - 1;
			while (rowIndex > -1) {
				var newPosition = [rowIndex, colIndex],
					items = this.getItems(newPosition, width, height, item);
				if (items.length !== 0) {
					break;
				}
				bestPosition = newPosition;
				 --rowIndex;
			}
			if (bestPosition) {
				this.putItem(item, bestPosition);
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
		setElementPosition: function($el, position) {
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
					top: position[0] * this.rowHeight + this.margins[0],
					left: position[1] * this.colWidth + this.margins[1]
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
				controller.initializing = false;
				controller.floatItemsUp();
				$elem.addClass('gridster-loaded');
			}, 0);
		}
	};
})

;