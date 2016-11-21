(function(angular) {
	'use strict';

	angular.module('gridster').factory('GridsterDraggable', ['$document', '$window', 'GridsterTouch',
		function($document, $window, GridsterTouch) {
			function GridsterDraggable($el, scope, gridster, item, itemOptions) {

				var elmX, elmY, elmW, elmH,

					mouseX = 0,
					mouseY = 0,
					lastMouseX = 0,
					lastMouseY = 0,
					mOffX = 0,
					mOffY = 0,

					minTop = 0,
					minLeft = 0,
					realdocument = $document[0];

				var originalCol, originalRow;
				var inputTags = ['select', 'option', 'input', 'textarea', 'button'];

				function dragStart(event) {
					$el.addClass('gridster-item-moving');
					gridster.movingItem = item;

					gridster.updateHeight(item.sizeY);
					scope.$apply(function() {
						if (gridster.draggable && gridster.draggable.start) {
							gridster.draggable.start(event, $el, itemOptions, item);
						}
					});
				}

				function drag(event) {
					var oldRow = item.row,
						oldCol = item.col,
						hasCallback = gridster.draggable && gridster.draggable.drag,
						scrollSensitivity = gridster.draggable.scrollSensitivity,
						scrollSpeed = gridster.draggable.scrollSpeed;

					var row = Math.min(gridster.pixelsToRows(elmY), gridster.maxRows - 1);
					var col = Math.min(gridster.pixelsToColumns(elmX), gridster.columns - 1);

					var itemsInTheWay = gridster.getItems(row, col, item.sizeX, item.sizeY, item);
					var hasItemsInTheWay = itemsInTheWay.length !== 0;

					if (gridster.swapping === true && hasItemsInTheWay) {
						var boundingBoxItem = gridster.getBoundingBox(itemsInTheWay),
							sameSize = boundingBoxItem.sizeX === item.sizeX && boundingBoxItem.sizeY === item.sizeY,
							sameRow = boundingBoxItem.row === oldRow,
							sameCol = boundingBoxItem.col === oldCol,
							samePosition = boundingBoxItem.row === row && boundingBoxItem.col === col,
							inline = sameRow || sameCol;

						if (sameSize && itemsInTheWay.length === 1) {
							if (samePosition) {
								gridster.swapItems(item, itemsInTheWay[0]);
							} else if (inline) {
								return;
							}
						} else if (boundingBoxItem.sizeX <= item.sizeX && boundingBoxItem.sizeY <= item.sizeY && inline) {
							var emptyRow = item.row <= row ? item.row : row + item.sizeY,
								emptyCol = item.col <= col ? item.col : col + item.sizeX,
								rowOffset = emptyRow - boundingBoxItem.row,
								colOffset = emptyCol - boundingBoxItem.col;

							for (var i = 0, l = itemsInTheWay.length; i < l; ++i) {
								var itemInTheWay = itemsInTheWay[i];

								var itemsInFreeSpace = gridster.getItems(
									itemInTheWay.row + rowOffset,
									itemInTheWay.col + colOffset,
									itemInTheWay.sizeX,
									itemInTheWay.sizeY,
									item
								);

								if (itemsInFreeSpace.length === 0) {
									gridster.putItem(itemInTheWay, itemInTheWay.row + rowOffset, itemInTheWay.col + colOffset);
								}
							}
						}
					}

					if (gridster.pushing !== false || !hasItemsInTheWay) {
						item.row = row;
						item.col = col;
					}

					if (event.pageY - realdocument.body.scrollTop < scrollSensitivity) {
						realdocument.body.scrollTop = realdocument.body.scrollTop - scrollSpeed;
					} else if ($window.innerHeight - (event.pageY - realdocument.body.scrollTop) < scrollSensitivity) {
						realdocument.body.scrollTop = realdocument.body.scrollTop + scrollSpeed;
					}

					if (event.pageX - realdocument.body.scrollLeft < scrollSensitivity) {
						realdocument.body.scrollLeft = realdocument.body.scrollLeft - scrollSpeed;
					} else if ($window.innerWidth - (event.pageX - realdocument.body.scrollLeft) < scrollSensitivity) {
						realdocument.body.scrollLeft = realdocument.body.scrollLeft + scrollSpeed;
					}

					if (hasCallback && (oldRow !== item.row || oldCol !== item.col)) {
						scope.$apply(function() {
							gridster.draggable.drag(event, $el, itemOptions, item);
						});
					}
				}

				function dragStop(event) {
					$el.removeClass('gridster-item-moving');
					var row = Math.min(gridster.pixelsToRows(elmY), gridster.maxRows - 1);
					var col = Math.min(gridster.pixelsToColumns(elmX), gridster.columns - 1);
					if (gridster.pushing !== false || gridster.getItems(row, col, item.sizeX, item.sizeY, item).length === 0) {
						item.row = row;
						item.col = col;
					}
					gridster.movingItem = null;
					item.setPosition(item.row, item.col);

					if (_.chain(gridster).get('draggable.stop').isFunction().valueOf()) {
						scope.$apply(function() {
							gridster.draggable.stop(event, $el, itemOptions, item);
						});
					}
				}

				function mouseDown(e) {
					if (inputTags.indexOf(e.target.nodeName.toLowerCase()) !== -1) {
						return false;
					}

					var $target = angular.element(e.target);

					// exit, if a resize handle was hit
					if ($target.hasClass('gridster-item-resizable-handler')) {
						return false;
					}

					// exit, if the target has it's own click event
					if ($target.attr('onclick') || $target.attr('ng-click')) {
						return false;
					}

					// only works if you have jQuery
					if ($target.closest && $target.closest('.gridster-no-drag').length) {
						return false;
					}

					// apply drag handle filter
					if (gridster.draggable && gridster.draggable.handle) {
						var $dragHandles = angular.element($el[0].querySelectorAll(gridster.draggable.handle));
						var match = false;
						outerloop:
							for (var h = 0, hl = $dragHandles.length; h < hl; ++h) {
								var handle = $dragHandles[h];
								if (handle === e.target) {
									match = true;
									break;
								}
								var target = e.target;
								for (var p = 0; p < 20; ++p) {
									var parent = target.parentNode;
									if (parent === $el[0] || !parent) {
										break;
									}
									if (parent === handle) {
										match = true;
										break outerloop;
									}
									target = parent;
								}
							}
						if (!match) {
							return false;
						}
					}

					switch (e.which) {
						case 1:
							// left mouse button
							break;
						case 2:
						case 3:
							// right or middle mouse button
							return;
					}

					lastMouseX = e.pageX;
					lastMouseY = e.pageY;

					elmX = parseInt($el.css('left'), 10);
					elmY = parseInt($el.css('top'), 10);
					elmW = $el[0].offsetWidth;
					elmH = $el[0].offsetHeight;

					originalCol = item.col;
					originalRow = item.row;

					dragStart(e);

					return true;
				}

				function mouseMove(e) {
					if (!$el.hasClass('gridster-item-moving') || $el.hasClass('gridster-item-resizing')) {
						return false;
					}

					var maxLeft = gridster.curWidth - 1;
					var maxTop = gridster.curRowHeight * gridster.maxRows - 1;

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

					var dX = diffX,
						dY = diffY;
					if (elmX + dX < minLeft) {
						diffX = minLeft - elmX;
						mOffX = dX - diffX;
					} else if (elmX + elmW + dX > maxLeft) {
						diffX = maxLeft - elmX - elmW;
						mOffX = dX - diffX;
					}

					if (elmY + dY < minTop) {
						diffY = minTop - elmY;
						mOffY = dY - diffY;
					} else if (elmY + elmH + dY > maxTop) {
						diffY = maxTop - elmY - elmH;
						mOffY = dY - diffY;
					}
					elmX += diffX;
					elmY += diffY;

					// set new position
					$el.css({
						'top': elmY + 'px',
						'left': elmX + 'px'
					});

					drag(e);

					return true;
				}

				function mouseUp(e) {
					if (!$el.hasClass('gridster-item-moving') || $el.hasClass('gridster-item-resizing')) {
						return false;
					}

					mOffX = mOffY = 0;

					dragStop(e);

					return true;
				}

				var enabled = null;
				var gridsterTouch = null;

				this.enable = function() {
					if (enabled === true) {
						return;
					}
					enabled = true;

					if (gridsterTouch) {
						gridsterTouch.enable();
						return;
					}

					gridsterTouch = new GridsterTouch($el[0], mouseDown, mouseMove, mouseUp);
					gridsterTouch.enable();
				};

				this.disable = function() {
					if (enabled === false) {
						return;
					}

					enabled = false;
					if (gridsterTouch) {
						gridsterTouch.disable();
					}
				};

				this.toggle = function(enabled) {
					if (enabled) {
						this.enable();
					} else {
						this.disable();
					}
				};

				this.destroy = function() {
					this.disable();
				};
			}

			return GridsterDraggable;
		}
	]);
})(window.angular);
