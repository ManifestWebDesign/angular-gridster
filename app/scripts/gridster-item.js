'use strict';

angular.module('gridster')

.controller('GridsterItemCtrl', function(){
	return {
		$element: null,
		gridster: null,
		dragging: false,
		resizing: false,
		position: null,
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
			this.position = null;
			this.$element = null;
		},
		toJSON: function() {
			return {
				position: this.position,
				height: this.height,
				width: this.width
			};
		},
		setPosition: function (position) {
			this.gridster.putItem(this, position);

			if (this.dragging) {
				this.gridster.setElementPosition(this.gridster.$preview, this.position);
			} else {
				this.gridster.setElementPosition(this.$element, this.position);
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
				this.gridster.setElementPosition(this.gridster.$preview, this.position);
				this.gridster['setElement' + ucfirst](this.gridster.$preview, value);
			} else {
				this.gridster['setElement' + ucfirst](this.$element, value);
			}
			if (changed) {
				this.gridster.moveOverlappingItems(this);
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

			function getPosition(widget) {
				var pos =  [
					gridster.pixelsToRows(widget.position.top),
					gridster.pixelsToColumns(widget.position.left)
				];
				return pos;
			}

			$el.addClass('gridster-item');

			$el.draggable({
//				containment: '.gridster',
				refreshPositions: true,
				start: function(e, widget) {
					item.dragging = true;
					gridster.$preview.show();
					gridster.setElementWidth(gridster.$preview, item.width);
					gridster.setElementHeight(gridster.$preview, item.height);
					gridster.updateHeight(item.height);
					scope.$apply();
				},
				drag: function(e, widget) {
					item.position = getPosition(widget);
					item.dragging = true;
					scope.$apply();
				},
				stop: function (e, widget) {
					item.position = getPosition(widget);
					item.dragging = false;
					gridster.$preview.hide();
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
				return item.position;
			}, function(position) {
				item.setPosition(position);
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
					item.setWidth(width);
				});
				item.setWidth($parse(opts.width)(scope));
			}
			if (opts.height) {
				scope.$watch(opts.height, function(height){
					item.setHeight(height);
				});
				item.setHeight($parse(opts.height)(scope));
			}
			if (opts.position) {
				var posGetter = $parse(opts.position);
				scope.$watch(function(){
					var pos = posGetter(scope);
					if (pos) {
						return pos.join(',');
					}
				}, function(position){
					if (position) {
						var pos = position.split(',');
						pos[0] = parseInt(pos[0], 10);
						pos[1] = parseInt(pos[1], 10);
						item.setPosition(pos);
					}
				});
				item.setPosition($parse(opts.position)(scope));
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