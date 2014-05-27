/**
 * @name gridsterItemDirective
 *
 * @param {object} $timeout
 */
app.directive('gridsterItem', function($timeout) {
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
				draggableOption,
				resizableOption,
				rowStart,
				colStart,
				sizeXStart,
				sizeYStart,
				row,
				col,
				sizeX,
				sizeY,
				top,
				left,
				width,
				height,
				minWidth,
				maxWidth,
				minHeight,
				maxHeight,
				columns;

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
				var matrix = $element.css('-webkit-transform') ||
					$element.css('-moz-transform') ||
					$element.css('-ms-transform') ||
					$element.css('-o-transform') ||
					$element.css('transform');

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

						if ((col + sizeXStart) >= columns) {
							col = columns - sizeXStart;
						}

						if (gridster.hasItemPositionChanged(scope.item, row, col)) {
							if (!gridster.getOption('moveOverlappingItems') && !gridster.canItemOccupy(row, col, sizeXStart, sizeYStart, scope.item)) {
								return;
							}

							scope.item = gridster.setRow(scope.item, row);
							scope.item = gridster.setCol(scope.item, col);

							if (gridster.getOption('draggablePreviewEnabled') === true) {
								gridster.translateElementPosition(
									null,
									gridster.colToPixels(col),
									gridster.rowToPixels(row)
								);
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

					minWidth = (gridster.getOption('minSizeX') * gridster.getOption('curColWidth')) - gridster.getOption('margins')[0];
					maxWidth = (gridster.getOption('columns') - colStart) * gridster.getOption('curColWidth') - gridster.getOption('margins')[0];
					minHeight = (gridster.getOption('minSizeY') * gridster.getOption('curRowHeight')) - gridster.getOption('margins')[1];
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
						if (gridster.getOption('moveOverlappingItems') === false &&
							gridster.canItemOccupy(row, col, sizeX, sizeY, scope.item) === false
						) {
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
						resizableOption.onmove(e, $element, {width: width, height: height});
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

							_width = width * ge.scale; //(1 + (gestureEvent.scale / 2));
							_height = height * ge.scale; //(1 + (gestureEvent.ds / 2));

							element.style.width = _width + 'px';
							element.style.height = _height + 'px';
							resizeMove(e, _width, _height);

							//width = width * (1 + (ge.ds / 2));
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
});
