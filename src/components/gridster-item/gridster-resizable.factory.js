(function(angular) {
	'use strict';

	angular.module('gridster').factory('GridsterResizable', ['GridsterTouch', function(GridsterTouch) {
		function GridsterResizable($el, scope, gridster, item, itemOptions) {

			function ResizeHandle(handleClass) {

				var hClass = handleClass;

				var elmX, elmY, elmW, elmH,

					mouseX = 0,
					mouseY = 0,
					lastMouseX = 0,
					lastMouseY = 0,
					mOffX = 0,
					mOffY = 0,

					minTop = 0,
					maxTop = 999999,
					minLeft = 0;

				var getMinHeight = function() {
					return (item.minSizeY ? item.minSizeY : 1) * gridster.curRowHeight - gridster.margins[0];
				};
				var getMinWidth = function() {
					return (item.minSizeX ? item.minSizeX : 1) * gridster.curColWidth - gridster.margins[1];
				};

				var originalWidth, originalHeight;
				var savedDraggable;

				function resizeStart(e) {
					$el.addClass('gridster-item-moving');
					$el.addClass('gridster-item-resizing');

					gridster.movingItem = item;

					item.setElementSizeX();
					item.setElementSizeY();
					item.setElementPosition();
					gridster.updateHeight(1);

					if (_.chain(gridster).get('resizable.start').isFunction().valueOf()) {
						scope.$apply(function() {
							gridster.resizable.start(e, $el, itemOptions, item); // options is the item model
						});
					}
				}

				function resize(e) {
					var oldRow = item.row,
						oldCol = item.col,
						oldSizeX = item.sizeX,
						oldSizeY = item.sizeY,
						hasCallback = gridster.resizable && gridster.resizable.resize;

					var col = item.col;
					// only change column if grabbing left edge
					if (['w', 'nw', 'sw'].indexOf(handleClass) !== -1) {
						col = gridster.pixelsToColumns(elmX, false);
					}

					var row = item.row;
					// only change row if grabbing top edge
					if (['n', 'ne', 'nw'].indexOf(handleClass) !== -1) {
						row = gridster.pixelsToRows(elmY, false);
					}

					var sizeX = item.sizeX;
					// only change row if grabbing left or right edge
					if (['n', 's'].indexOf(handleClass) === -1) {
						sizeX = gridster.pixelsToColumns(elmW, true);
					}

					var sizeY = item.sizeY;
					// only change row if grabbing top or bottom edge
					if (['e', 'w'].indexOf(handleClass) === -1) {
						sizeY = gridster.pixelsToRows(elmH, true);
					}


					var canOccupy = row > -1 && col > -1 && sizeX + col <= gridster.columns && sizeY + row <= gridster.maxRows;
					if (canOccupy && (gridster.pushing !== false || gridster.getItems(row, col, sizeX, sizeY, item).length === 0)) {
						item.row = row;
						item.col = col;
						item.sizeX = sizeX;
						item.sizeY = sizeY;
					}
					var isChanged = item.row !== oldRow || item.col !== oldCol || item.sizeX !== oldSizeX || item.sizeY !== oldSizeY;

					if (hasCallback && isChanged) {
						scope.$apply(function() {
							gridster.resizable.resize(e, $el, itemOptions, item); // options is the item model
						});
					}
				}

				function resizeStop(e) {
					$el.removeClass('gridster-item-moving');
					$el.removeClass('gridster-item-resizing');

					gridster.movingItem = null;

					item.setPosition(item.row, item.col);
					item.setSizeY(item.sizeY);
					item.setSizeX(item.sizeX);

					if (_.chain(gridster).get('resizable.stop').isFunction().valueOf()) {
						scope.$apply(function() {
							gridster.resizable.stop(e, $el, itemOptions, item); // options is the item model
						});
					}
				}

				function mouseDown(e) {
					switch (e.which) {
						case 1:
							// left mouse button
							break;
						case 2:
						case 3:
							// right or middle mouse button
							return;
					}

					// save the draggable setting to restore after resize
					savedDraggable = gridster.draggable.enabled;
					if (savedDraggable) {
						gridster.draggable.enabled = false;
						scope.$broadcast('gridster-draggable-changed', gridster);
					}

					// Get the current mouse position.
					lastMouseX = e.pageX;
					lastMouseY = e.pageY;

					// Record current widget dimensions
					elmX = parseInt($el.css('left'), 10);
					elmY = parseInt($el.css('top'), 10);
					elmW = $el[0].offsetWidth;
					elmH = $el[0].offsetHeight;

					originalWidth = item.sizeX;
					originalHeight = item.sizeY;

					resizeStart(e);

					return true;
				}

				function mouseMove(e) {
					var maxLeft = gridster.curWidth - 1;

					// Get the current mouse position.
					mouseX = e.pageX;
					mouseY = e.pageY;

					// Get the deltas
					var diffX = mouseX - lastMouseX + mOffX;
					var diffY = mouseY - lastMouseY + mOffY;
					mOffX = mOffY = 0;

					// Update last processed mouse positions.
					lastMouseX = mouseX;
					lastMouseY = mouseY;

					var dY = diffY,
						dX = diffX;

					if (hClass.indexOf('n') >= 0) {
						if (elmH - dY < getMinHeight()) {
							diffY = elmH - getMinHeight();
							mOffY = dY - diffY;
						} else if (elmY + dY < minTop) {
							diffY = minTop - elmY;
							mOffY = dY - diffY;
						}
						elmY += diffY;
						elmH -= diffY;
					}
					if (hClass.indexOf('s') >= 0) {
						if (elmH + dY < getMinHeight()) {
							diffY = getMinHeight() - elmH;
							mOffY = dY - diffY;
						} else if (elmY + elmH + dY > maxTop) {
							diffY = maxTop - elmY - elmH;
							mOffY = dY - diffY;
						}
						elmH += diffY;
					}
					if (hClass.indexOf('w') >= 0) {
						if (elmW - dX < getMinWidth()) {
							diffX = elmW - getMinWidth();
							mOffX = dX - diffX;
						} else if (elmX + dX < minLeft) {
							diffX = minLeft - elmX;
							mOffX = dX - diffX;
						}
						elmX += diffX;
						elmW -= diffX;
					}
					if (hClass.indexOf('e') >= 0) {
						if (elmW + dX < getMinWidth()) {
							diffX = getMinWidth() - elmW;
							mOffX = dX - diffX;
						} else if (elmX + elmW + dX > maxLeft) {
							diffX = maxLeft - elmX - elmW;
							mOffX = dX - diffX;
						}
						elmW += diffX;
					}

					// set new position
					$el.css({
						'top': elmY + 'px',
						'left': elmX + 'px',
						'width': elmW + 'px',
						'height': elmH + 'px'
					});

					resize(e);

					return true;
				}

				function mouseUp(e) {
					// restore draggable setting to its original state
					if (gridster.draggable.enabled !== savedDraggable) {
						gridster.draggable.enabled = savedDraggable;
						scope.$broadcast('gridster-draggable-changed', gridster);
					}

					mOffX = mOffY = 0;

					resizeStop(e);

					return true;
				}

				var $dragHandle = null;
				var unifiedInput;

				this.enable = function() {
					if (!$dragHandle) {
						$dragHandle = angular.element('<div class="gridster-item-resizable-handler handle-' + hClass + '"></div>');
						$el.append($dragHandle);
					}

					unifiedInput = new GridsterTouch($dragHandle[0], mouseDown, mouseMove, mouseUp);
					unifiedInput.enable();
				};

				this.disable = function() {
					if ($dragHandle) {
						$dragHandle.remove();
						$dragHandle = null;
					}

					unifiedInput.disable();
					unifiedInput = undefined;
				};

				this.destroy = function() {
					this.disable();
				};
			}

			var handles = [];
			var handlesOpts = gridster.resizable.handles;
			if (typeof handlesOpts === 'string') {
				handlesOpts = gridster.resizable.handles.split(',');
			}
			var enabled = false;

			for (var c = 0, l = handlesOpts.length; c < l; c++) {
				handles.push(new ResizeHandle(handlesOpts[c]));
			}

			this.enable = function() {
				if (enabled) {
					return;
				}
				for (var c = 0, l = handles.length; c < l; c++) {
					handles[c].enable();
				}
				enabled = true;
			};

			this.disable = function() {
				if (!enabled) {
					return;
				}
				for (var c = 0, l = handles.length; c < l; c++) {
					handles[c].disable();
				}
				enabled = false;
			};

			this.toggle = function(enabled) {
				if (enabled) {
					this.enable();
				} else {
					this.disable();
				}
			};

			this.destroy = function() {
				for (var c = 0, l = handles.length; c < l; c++) {
					handles[c].destroy();
				}
			};
		}
		return GridsterResizable;
	}]);
})(window.angular);
