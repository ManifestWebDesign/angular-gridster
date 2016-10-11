(function(angular) {
	'use strict';

	angular.module('gridster')
		.controller('GridsterCtrl', ['gridsterConfig', '$injector',
			function(gridsterConfig, $injector) {

				var gridster = this;

				/**
				 * Create options from gridsterConfig constant
				 */
				angular.extend(this, gridsterConfig);

				this.resizable = angular.extend({}, gridsterConfig.resizable || {});
				this.draggable = angular.extend({}, gridsterConfig.draggable || {});

				var flag = false;
				this.layoutChanged = function() {
					if (flag) {
						return;
					}
					flag = true;
					$injector.get('$timeout')(function() {
						flag = false;
						if (gridster.loaded) {
							gridster.floatItemsUp();
						}
						gridster.updateHeight(gridster.movingItem ? gridster.movingItem.sizeY : 0);
					}, 30);
				};

				/**
				 * A positional array of the items in the grid
				 */
				this.grid = [];
				this.allItems = [];

				/**
				 * Clean up after yourself
				 */
				this.destroy = function() {
					// empty the grid to cut back on the possibility
					// of circular references
					if (this.grid) {
						this.grid = [];
					}
					this.$element = null;

					if (this.allItems) {
						this.allItems.length = 0;
						this.allItems = null;
					}
				};

				/**
				 * Overrides default options
				 *
				 * @param {Object} options The options to override
				 */
				this.setOptions = function(options) {
					if (!options) {
						return;
					}

					options = angular.extend({}, options);

					// all this to avoid using jQuery...
					if (options.draggable) {
						angular.extend(this.draggable, options.draggable);
						delete(options.draggable);
					}
					if (options.resizable) {
						angular.extend(this.resizable, options.resizable);
						delete(options.resizable);
					}

					angular.extend(this, options);

					if (!this.margins || this.margins.length !== 2) {
						this.margins = [0, 0];
					} else {
						for (var x = 0, l = this.margins.length; x < l; ++x) {
							this.margins[x] = parseInt(this.margins[x], 10);
							if (isNaN(this.margins[x])) {
								this.margins[x] = 0;
							}
						}
					}
				};

				/**
				 * Check if item can occupy a specified position in the grid
				 *
				 * @param {Object} item The item in question
				 * @param {Number} row The row index
				 * @param {Number} column The column index
				 * @returns {Boolean} True if if item fits
				 */
				this.canItemOccupy = function(item, row, column) {
					return row > -1 && column > -1 && item.sizeX + column <= this.columns && item.sizeY + row <= this.maxRows;
				};

				/**
				 * Set the item in the first suitable position
				 *
				 * @param {Object} item The item to insert
				 */
				this.autoSetItemPosition = function(item) {
					// walk through each row and column looking for a place it will fit
					for (var rowIndex = 0; rowIndex < this.maxRows; ++rowIndex) {
						for (var colIndex = 0; colIndex < this.columns; ++colIndex) {
							// only insert if position is not already taken and it can fit
							var items = this.getItems(rowIndex, colIndex, item.sizeX, item.sizeY, item);
							if (items.length === 0 && this.canItemOccupy(item, rowIndex, colIndex)) {
								this.putItem(item, rowIndex, colIndex);
								return;
							}
						}
					}
					throw new Error('Unable to place item!');
				};

				/**
				 * Gets items at a specific coordinate
				 *
				 * @param {Number} row
				 * @param {Number} column
				 * @param {Number} sizeX
				 * @param {Number} sizeY
				 * @param {Array} excludeItems An array of items to exclude from selection
				 * @returns {Array} Items that match the criteria
				 */
				this.getItems = function(row, column, sizeX, sizeY, excludeItems) {
					var items = [];
					if (!sizeX || !sizeY) {
						sizeX = sizeY = 1;
					}
					if (excludeItems && !(excludeItems instanceof Array)) {
						excludeItems = [excludeItems];
					}
					var item;
					if (this.sparse === false) { // check all cells
						for (var h = 0; h < sizeY; ++h) {
							for (var w = 0; w < sizeX; ++w) {
								item = this.getItem(row + h, column + w, excludeItems);
								if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && items.indexOf(item) === -1) {
									items.push(item);
								}
							}
						}
					} else { // check intersection with all items
						var bottom = row + sizeY - 1;
						var right = column + sizeX - 1;
						for (var i = 0; i < this.allItems.length; ++i) {
							item = this.allItems[i];
							if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && items.indexOf(item) === -1 && this.intersect(item, column, right, row, bottom)) {
								items.push(item);
							}
						}
					}
					return items;
				};

				/**
				 * @param {Array} items
				 * @returns {Object} An item that represents the bounding box of the items
				 */
				this.getBoundingBox = function(items) {

					if (items.length === 0) {
						return null;
					}
					if (items.length === 1) {
						return {
							row: items[0].row,
							col: items[0].col,
							sizeY: items[0].sizeY,
							sizeX: items[0].sizeX
						};
					}

					var maxRow = 0;
					var maxCol = 0;
					var minRow = 9999;
					var minCol = 9999;

					for (var i = 0, l = items.length; i < l; ++i) {
						var item = items[i];
						minRow = Math.min(item.row, minRow);
						minCol = Math.min(item.col, minCol);
						maxRow = Math.max(item.row + item.sizeY, maxRow);
						maxCol = Math.max(item.col + item.sizeX, maxCol);
					}

					return {
						row: minRow,
						col: minCol,
						sizeY: maxRow - minRow,
						sizeX: maxCol - minCol
					};
				};

				/**
				 * Checks if item intersects specified box
				 *
				 * @param {object} item
				 * @param {number} left
				 * @param {number} right
				 * @param {number} top
				 * @param {number} bottom
				 */

				this.intersect = function(item, left, right, top, bottom) {
					return (left <= item.col + item.sizeX - 1 &&
						right >= item.col &&
						top <= item.row + item.sizeY - 1 &&
						bottom >= item.row);
				};


				/**
				 * Removes an item from the grid
				 *
				 * @param {Object} item
				 */
				this.removeItem = function(item) {
					var index;
					for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
						var columns = this.grid[rowIndex];
						if (!columns) {
							continue;
						}
						index = columns.indexOf(item);
						if (index !== -1) {
							columns[index] = null;
							break;
						}
					}
					if (this.sparse) {
						index = this.allItems.indexOf(item);
						if (index !== -1) {
							this.allItems.splice(index, 1);
						}
					}
					this.layoutChanged();
				};

				/**
				 * Returns the item at a specified coordinate
				 *
				 * @param {Number} row
				 * @param {Number} column
				 * @param {Array} excludeItems Items to exclude from selection
				 * @returns {Object} The matched item or null
				 */
				this.getItem = function(row, column, excludeItems) {
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
				};

				/**
				 * Insert an array of items into the grid
				 *
				 * @param {Array} items An array of items to insert
				 */
				this.putItems = function(items) {
					for (var i = 0, l = items.length; i < l; ++i) {
						this.putItem(items[i]);
					}
				};

				/**
				 * Insert a single item into the grid
				 *
				 * @param {Object} item The item to insert
				 * @param {Number} row (Optional) Specifies the items row index
				 * @param {Number} column (Optional) Specifies the items column index
				 * @param {Array} ignoreItems
				 */
				this.putItem = function(item, row, column, ignoreItems) {
					// auto place item if no row specified
					if (typeof row === 'undefined' || row === null) {
						row = item.row;
						column = item.col;
						if (typeof row === 'undefined' || row === null) {
							this.autoSetItemPosition(item);
							return;
						}
					}

					// keep item within allowed bounds
					if (!this.canItemOccupy(item, row, column)) {
						column = Math.min(this.columns - item.sizeX, Math.max(0, column));
						row = Math.min(this.maxRows - item.sizeY, Math.max(0, row));
					}

					// check if item is already in grid
					if (item.oldRow !== null && typeof item.oldRow !== 'undefined') {
						var samePosition = item.oldRow === row && item.oldColumn === column;
						var inGrid = this.grid[row] && this.grid[row][column] === item;
						if (samePosition && inGrid) {
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

					this.moveOverlappingItems(item, ignoreItems);

					if (!this.grid[row]) {
						this.grid[row] = [];
					}
					this.grid[row][column] = item;

					if (this.sparse && this.allItems.indexOf(item) === -1) {
						this.allItems.push(item);
					}

					if (this.movingItem === item) {
						this.floatItemUp(item);
					}
					this.layoutChanged();
				};

				/**
				 * Trade row and column if item1 with item2
				 *
				 * @param {Object} item1
				 * @param {Object} item2
				 */
				this.swapItems = function(item1, item2) {
					this.grid[item1.row][item1.col] = item2;
					this.grid[item2.row][item2.col] = item1;

					var item1Row = item1.row;
					var item1Col = item1.col;
					item1.row = item2.row;
					item1.col = item2.col;
					item2.row = item1Row;
					item2.col = item1Col;
				};

				/**
				 * Prevents items from being overlapped
				 *
				 * @param {Object} item The item that should remain
				 * @param {Array} ignoreItems
				 */
				this.moveOverlappingItems = function(item, ignoreItems) {
					// don't move item, so ignore it
					if (!ignoreItems) {
						ignoreItems = [item];
					} else if (ignoreItems.indexOf(item) === -1) {
						ignoreItems = ignoreItems.slice(0);
						ignoreItems.push(item);
					}

					// get the items in the space occupied by the item's coordinates
					var overlappingItems = this.getItems(
						item.row,
						item.col,
						item.sizeX,
						item.sizeY,
						ignoreItems
					);
					this.moveItemsDown(overlappingItems, item.row + item.sizeY, ignoreItems);
				};

				/**
				 * Moves an array of items to a specified row
				 *
				 * @param {Array} items The items to move
				 * @param {Number} newRow The target row
				 * @param {Array} ignoreItems
				 */
				this.moveItemsDown = function(items, newRow, ignoreItems) {
					if (!items || items.length === 0) {
						return;
					}
					items.sort(function(a, b) {
						return a.row - b.row;
					});

					ignoreItems = ignoreItems ? ignoreItems.slice(0) : [];
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
						var rowsToMove = newRow - topRows[item.col];
						this.moveItemDown(item, item.row + rowsToMove, ignoreItems);
						ignoreItems.push(item);
					}
				};

				/**
				 * Moves an item down to a specified row
				 *
				 * @param {Object} item The item to move
				 * @param {Number} newRow The target row
				 * @param {Array} ignoreItems
				 */
				this.moveItemDown = function(item, newRow, ignoreItems) {
					if (item.row >= newRow) {
						return;
					}
					while (item.row < newRow) {
						++item.row;
						this.moveOverlappingItems(item, ignoreItems);
					}
					this.putItem(item, item.row, item.col, ignoreItems);
				};

				/**
				 * Moves all items up as much as possible
				 */
				this.floatItemsUp = function() {
					if (this.floating === false) {
						return;
					}
					for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
						var columns = this.grid[rowIndex];
						if (!columns) {
							continue;
						}
						for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
							var item = columns[colIndex];
							if (item) {
								this.floatItemUp(item);
							}
						}
					}
				};

				/**
				 * Float an item up to the most suitable row
				 *
				 * @param {Object} item The item to move
				 */
				this.floatItemUp = function(item) {
					if (this.floating === false) {
						return;
					}
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
				};

				/**
				 * Update gridsters height
				 *
				 * @param {Number} plus (Optional) Additional height to add
				 */
				this.updateHeight = function(plus) {
					var maxHeight = this.minRows;
					plus = plus || 0;
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
					this.gridHeight = this.maxRows - maxHeight > 0 ? Math.min(this.maxRows, maxHeight) : Math.max(this.maxRows, maxHeight);
				};

				/**
				 * Returns the number of rows that will fit in given amount of pixels
				 *
				 * @param {Number} pixels
				 * @param {Boolean} ceilOrFloor (Optional) Determines rounding method
				 */
				this.pixelsToRows = function(pixels, ceilOrFloor) {
					if (!this.outerMargin) {
						pixels += this.margins[0] / 2;
					}

					if (ceilOrFloor === true) {
						return Math.ceil(pixels / this.curRowHeight);
					} else if (ceilOrFloor === false) {
						return Math.floor(pixels / this.curRowHeight);
					}

					return Math.round(pixels / this.curRowHeight);
				};

				/**
				 * Returns the number of columns that will fit in a given amount of pixels
				 *
				 * @param {Number} pixels
				 * @param {Boolean} ceilOrFloor (Optional) Determines rounding method
				 * @returns {Number} The number of columns
				 */
				this.pixelsToColumns = function(pixels, ceilOrFloor) {
					if (!this.outerMargin) {
						pixels += this.margins[1] / 2;
					}

					if (ceilOrFloor === true) {
						return Math.ceil(pixels / this.curColWidth);
					} else if (ceilOrFloor === false) {
						return Math.floor(pixels / this.curColWidth);
					}

					return Math.round(pixels / this.curColWidth);
				};

				/**
				 * Callback for scroll event. Will call viewportNotify on all elements
				 * placed inside the grid
				 */
				this.onScroll_ = function() {
					_.chain(gridster)
						.get('grid')
						.flattenDeep()
						.compact()
						.forEach(function(item) {
							item.viewportNotify();
						})
						.valueOf();
				};
			}
		]);
})(window.angular);
