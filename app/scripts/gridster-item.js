'use strict';

angular.module('gridster')

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

			var item = $controller('GridsterItemCtrl', {
				$scope: scope
			});

			if (optsKey) {
				opts = $parse(optsKey)(scope);
			}

			item.init($el, gridster, opts);

			$el.addClass('gridster-item');

			$el.draggable({
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
				},
				stop: function (e, widget) {
					item.width = gridster.pixelsToColumns(widget.size.width, true);
					item.height = gridster.pixelsToRows(widget.size.height, true);
					item.resizing = false;
					gridster.$preview.fadeOut(300);
					item.setHeight(item.height);
					item.setWidth(item.width);
					scope.$apply();
				}
			});

			scope.$watch(function() {
				return item.row;
			}, function() {
				item.setPosition(item.row, item.column);
			});
			scope.$watch(function() {
				return item.column;
			}, function() {
				item.setPosition(item.row, item.column);
			});
			scope.$watch(function() {
				return item.height;
			}, function(height) {
				item.setHeight(height);
			});
			scope.$watch(function() {
				return item.width;
			}, function(width) {
				item.setWidth(width);
			});

			if (opts.width) {
				scope.$watch(opts.width, function(width){
					item.width = width;
				});
				item.width = $parse(opts.width)(scope);
			}
			if (opts.height) {
				scope.$watch(opts.height, function(height){
					item.height = height;
				});
				item.height = $parse(opts.height)(scope);
			}
			if (opts.row) {
				scope.$watch(opts.row, function(row){
					item.row = row;
				});
				item.row = $parse(opts.row)(scope);
			}
			if (opts.column) {
				scope.$watch(opts.column, function(column){
					item.column = column;
				});
				item.column = $parse(opts.column)(scope);
			}

			return $el.bind('$destroy', function() {
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