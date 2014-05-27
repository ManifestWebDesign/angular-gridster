/**
 * GridsterCtrl
 */
app.controller('GridsterCtrl', function($scope, $rootScope, gridsterConfig) {

	/**
	 * The grid element
	 */
	var $gridElement = null;

	/**
	 * The previewElement DOM element
	 */
	var previewElement = null;

	/**
	 * Stores an indexed array of grid item DOM elements
	 */
	$scope.itemElements = [];

	/**
	 * Sets gridster & previewElement elements
	 */
	this.init = function($element) {
		$gridElement = $element;
		previewElement = $element[0].querySelector('.gridster-preview-holder');

		// initialize options with gridster config
		$scope.options = angular.extend({}, gridsterConfig);

		// merge user provided options
		angular.extend($scope.options, $scope.config);
	};

	/**
	 * Returns an option
	 */
	this.getOption = function(key) {
		// use mode options if possible
		if ($scope.options.modes[$scope.options.mode].hasOwnProperty(key)) {
			return $scope.options.modes[$scope.options.mode][key];
		} else {
			return $scope.options[key];
		}
	};

	/**
	 * Add item element to itemElements
	 */
	this.addItemElement = function(id, element) {
		$scope.itemElements[id] = element;
	};

	/**
	 * Get an items DOM element
	 */
	this.getItemElement = function(id) {
		return $scope.itemElements[id];
	};

	/**
	 * Remove an items DOM element from itemElements array
	 */
	this.removeItemElement = function(id) {
		delete $scope.itemElements[id];
	};

	/**
	 * Fire loaded events & add loaded class
	 */
	this.setLoaded = function(val) {
		if (val === true) {
			$scope.options.isLoaded = true;
			$rootScope.$broadcast('angular-gridster.loaded');
			$gridElement.addClass('gridster-loaded');
		} else {
			$gridElement.removeClass('gridster-loaded');
			$scope.options.isLoaded = false;
		}
	};

	/**
	 * Resolve options relating to screen size
	 */
	this.resolveOptions = function() {
		var mode, modeOptions, modeChanged;

		$scope.options.curWidth = $gridElement[0].offsetWidth;

		$gridElement.removeClass('gridster-' + $scope.options.mode);

		for (mode in $scope.options.modes) {
			if (!$scope.options.modes.hasOwnProperty(mode) || mode === $scope.options.mode) {
				continue;
			}

			modeOptions = $scope.options.modes[mode];

			if ($scope.options.curWidth >= modeOptions.minThreshold && $scope.options.curWidth <= modeOptions.maxThreshold) {
				modeChanged = true;
				$scope.options.mode = mode;

				break;
			}
		}

		$gridElement.addClass('gridster-' + $scope.options.mode);

		if (this.getOption('width') !== 'auto') {
			$scope.options.curWidth = this.getOption('width');
		}

		if (this.getOption('colWidth') === 'auto') {
			$scope.options.curColWidth = ($scope.options.curWidth - this.getOption('margins')[0]) / this.getOption('columns');
		} else {
			$scope.options.curColWidth = this.getOption('colWidth');
		}

		if (this.getOption('rowHeight') === 'match') {
			$scope.options.curRowHeight = $scope.options.curColWidth;
		} else {
			$scope.options.curRowHeight = this.getOption('rowHeight');
		}

		if ($scope.options.isLoaded === true) {
			$rootScope.$broadcast('angular-gridster.grid_changed', $scope.options);

			if (modeChanged === true) {
				this.moveAllOverlappingItems();
			}
		}
	};

	/**
	 * Show preview element
	 */
	this.showPreviewElement = function() {
		previewElement.style.opacity = '1';
	};

	/**
	 * Hide preview element
	 */
	this.hidePreviewElement = function() {
		previewElement.style.opacity = '0';
	};

	this.startMove = function() {
		$gridElement.addClass('gridster-moving');
	};

	/**
	 * Hide grid item overlay elements
	 */
	this.endMove = function() {
		$gridElement.removeClass('gridster-moving');
	};

	/**
	 * Check if item can occupy a specified position in the grid
	 */
	this.canItemOccupy = function(row, col, sizeX, sizeY, excludeItems) {
		var canOccupy = true;

		if (row < 0 || col < 0 || (row + sizeY) > this.getOption('maxRows') || (col + sizeX) > this.getOption('columns') || this.getItemsInArea(row, col, sizeX, sizeY, excludeItems).length > 0) {
			canOccupy = false;
		}

		return canOccupy;
	};

	/**
	 * Gets items within an area
	 */
	this.getItemsInArea = function(row, col, sizeX, sizeY, excludeItems) {
		var items = [],
			item, trackByProperty;

		trackByProperty = this.getOption('trackByProperty');

		if (excludeItems && !(excludeItems instanceof Array)) {
			excludeItems = [excludeItems];
		}

		loop1: for (var i = 0, itemCount = $scope.items.length; i < itemCount; i++) {
			item = $scope.items[i];

			if (excludeItems) {
				// continue if item an item to be excluded
				for (var j = 0, excludeItemCount = excludeItems.length; j < excludeItemCount; j++) {
					if (excludeItems[j][trackByProperty] === item[trackByProperty]) {
						continue loop1;
					}
				}
			}

			if (this.isItemHidden(item) !== true && this.isItemInArea(item, row, col, sizeX, sizeY)) {
				items.unshift(item);
			}
		}

		return items;
	};

	/**
	 * Checks if item is inside a specified area
	 */
	this.isItemInArea = function(item, row, col, sizeX, sizeY) {
		var itemRow, itemCol, itemSizeX, itemSizeY;

		itemRow = this.getRow(item);
		itemCol = this.getCol(item);
		itemSizeX = this.getSizeX(item);
		itemSizeY = this.getSizeY(item);

		if (
			(itemRow + itemSizeY) <= row || // outside top
			itemRow >= (row + sizeY) || // outside bottom
			(itemCol + itemSizeX) <= col || // outside left
			itemCol >= (col + sizeX) // outside right
		) {
			return false;
		}

		return true;
	};

	/**
	 * Resolves an items parameter
	 */
	this.resolveParam = function(val, defaultVal1, defaultVal2) {
		val = parseInt(val, 10);

		if (val === null || isNaN(val) || typeof val !== 'number' || val < 0) {
			if (typeof defaultVal1 !== 'undefined') {
				return this.resolveParam(defaultVal1, defaultVal2);
			} else if (typeof defaultVal2 !== 'undefined') {
				return this.resolveParam(defaultVal2);
			} else {
				val = null;
			}
		}

		return val;
	};

	/**
	 * Fix an items position/size values for each view mode
	 */
	this.fixItem = function(item) {
		var _item = item,
			_mode = $scope.options.mode,
			defaultSizeX = this.getOption('defaultSizeX'),
			defaultSizeY = this.getOption('defaultSizeY'),
			mode,
			sizeX,
			sizeY,
			row,
			col,
			position;

		for (mode in $scope.options.modes) {
			// temp change of mode
			$scope.options.mode = mode;

			// resolve sizeX
			sizeX = this.resolveParam(this.getSizeX(_item), defaultSizeX);
			if (sizeX < this.getOption('minSizeX')) {
				sizeX = defaultSizeX;
			}
			_item = this.setSizeX(_item, sizeX);

			// resolve sizeY
			sizeY = this.resolveParam(this.getSizeY(_item), defaultSizeY);
			if (sizeY < this.getOption('minSizeY')) {
				sizeY = defaultSizeY;
			}
			_item = this.setSizeY(_item, sizeY);

			// resolve row/col
			row = this.resolveParam(this.getRow(_item));
			col = this.resolveParam(this.getCol(_item));
			if (typeof row !== 'number' || typeof col !== 'number' || row > this.getOption('maxRows') || col >= this.getOption('columns')) {
				if ($scope.options.isLoaded === true) {
					position = this.getNextPosition(sizeX, sizeY, item);

					// item must be too big for the grid, set to default size
					if (position === false) {
						_item = this.setSizeX(_item, defaultSizeX);
						_item = this.setSizeY(_item, defaultSizeY);

						position = this.getNextPosition(null, null, item);

						if (position === false) {
							throw new Error('No positions available');
						}
					}

					row = position.row;
					col = position.col;
				} else {
					row = 0;
					col = 0;
				}
			}

			_item = this.setRow(_item, row);
			_item = this.setCol(_item, col);
		}

		// revert back to the current mode
		$scope.options.mode = _mode;

		// update item in items array
		$scope.items[$scope.items.indexOf(item)] = _item;

		return _item;
	};

	/**
	 * Get the next available position in the grid
	 */
	this.getNextPosition = function(sizeX, sizeY, excludeItem) {
		sizeX = sizeX || this.getOption('defaultSizeX');
		sizeY = sizeY || this.getOption('defaultSizeY');

		for (var row = 0, rowCount = this.getOption('maxRows'); row <= rowCount; row++) {
			for (var col = 0, columnCount = this.getOption('columns'); col < columnCount; col++) {
				if (this.canItemOccupy(row, col, sizeX, sizeY, excludeItem)) {
					return {
						row: row,
						col: col
					};
				}
			}
		}

		return false;
	};

	/**
	 * Move other items in the way up or down
	 */
	this.moveOverlappingItems = function(item, allowMoveUp) {
		var items, row, col, sizeX, sizeY, _row, _col, _sizeX, _sizeY;

		if (this.getOption('moveOverlappingItems') === false || this.isItemHidden(item)) {
			return;
		}

		row = this.getRow(item);
		col = this.getCol(item);
		sizeX = this.getSizeX(item);
		sizeY = this.getSizeY(item);

		items = this.getItemsInArea(row, col, sizeX, sizeY, item);

		for (var i = 0, l = items.length; i < l; i++) {
			_row = this.getRow(items[i]);
			_col = this.getCol(items[i]);
			_sizeX = this.getSizeX(items[i]);
			_sizeY = this.getSizeY(items[i]);

			// try to move item up first
			if (allowMoveUp === true &&
				row > 0 &&
				this.canItemOccupy(
					_row - (sizeY + _sizeY - 1),
					_col,
					_sizeX,
					_sizeY,
					items[i]
				)
			) {
				items[i] = this.setRow(items[i], _row - (sizeY + _sizeY - 1));
			} else {
				// ok, down you go
				items[i] = this.setRow(items[i], row + sizeY);

				this.moveOverlappingItems(items[i]);
			}

			if ($scope.options.isLoaded) {
				this.translateElementPosition(
					this.getItemElement(items[i][this.getOption('trackByProperty')]),
					this.colToPixels(this.getCol(items[i])),
					this.rowToPixels(this.getRow(items[i]))
				);
			}
		}
	};

	/**
	 * Iterate entire grid and move any overlapping items
	 */
	this.moveAllOverlappingItems = function() {
		if ($scope.items.length === 0) {
			return;
		}

		for (var i = 0, l = $scope.items.length; i < l; i++) {
			this.moveOverlappingItems($scope.items[i]);
		}
	};

	/**
	 * Move items up into empty space
	 */
	this.floatItemsUp = function() {
		if (this.getOption('floatItemsUp') === false || !$scope.items) {
			return;
		}

		for (var i = 0; i < $scope.items.length; i++) {
			if ($scope.items[i]._moving === true) {
				continue;
			}

			this.floatItemUp($scope.items[i]);
		}
	};

	/**
	 * Float an item up to the most suitable row
	 */
	this.floatItemUp = function(item) {
		var items, row, col, sizeX, sizeY, bestRow = null;

		row = this.getRow(item) - 1;
		col = this.getCol(item);
		sizeX = this.getSizeX(item);
		sizeY = this.getSizeY(item);

		while (row > -1) {
			items = this.getItemsInArea(row, col, sizeX, sizeY, item);

			if (items.length === 0) {
				bestRow = row;
			} else {
				break;
			}

			--row;
		}

		if (bestRow !== null) {
			item = this.setRow(item, bestRow);

			this.translateElementPosition(
				this.getItemElement(item[this.getOption('trackByProperty')]),
				this.colToPixels(col),
				this.rowToPixels(bestRow)
			);
		}
	};

	/**
	 * Update gridsters height if item is the lowest
	 */
	this.updateGridHeight = function() {
		var maxRows = 0,
			itemMaxRow, height;

		maxRows = this.getOption('minRows');

		if ($scope.items) {
			for (var j = 0; j < $scope.items.length; j++) {
				itemMaxRow = this.getRow($scope.items[j]) + this.getSizeY($scope.items[j]);

				if (itemMaxRow > maxRows) {
					maxRows = itemMaxRow;
				}
			}
		}

		// add empty space for items to move to
		maxRows += this.getOption('defaultSizeY');

		if (maxRows > this.getOption('maxRows')) {
			maxRows = this.getOption('maxRows');
		}

		height = maxRows * this.getOption('curRowHeight') + this.getOption('margins')[1];

		$gridElement[0].style.height = height + 'px';
	};

	/**
	 * Returns the number of rows that will fit in given amount of pixels
	 */
	this.pixelsToRows = function(pixels, ceilOrFloor) {
		var rows;

		if (!pixels || pixels < 0) {
			pixels = 0;
		}

		if (ceilOrFloor === true) {
			rows = Math.ceil(pixels / this.getOption('curRowHeight'));
		} else if (ceilOrFloor === false) {
			rows = Math.floor(pixels / this.getOption('curRowHeight'));
		} else {
			rows = Math.round(pixels / this.getOption('curRowHeight'));
		}

		return rows;
	};

	/**
	 * Returns the number of columns that will fit in a given amount of pixels
	 */
	this.pixelsToColumns = function(pixels, ceilOrFloor) {
		var columns;

		if (!pixels || pixels < 0) {
			pixels = 0;
		}

		if (ceilOrFloor === true) {
			columns = Math.ceil(pixels / $scope.options.curColWidth);
		} else if (ceilOrFloor === false) {
			columns = Math.floor(pixels / $scope.options.curColWidth);
		} else {
			columns = Math.round(pixels / $scope.options.curColWidth);
		}

		return columns;
	};

	/**
	 * Returns the row in pixels
	 */
	this.rowToPixels = function(row) {
		return row * $scope.options.curRowHeight + this.getOption('margins')[0];
	};

	/**
	 * Returns the column in pixels
	 */
	this.colToPixels = function(col) {
		return col * $scope.options.curColWidth + this.getOption('margins')[1];
	};

	/**
	 * Translate an elements position using translate3d if possible
	 */
	this.translateElementPosition = function(el, x, y) {
		var transform;

		if (el === null) {
			el = previewElement;
		}

		if (Modernizr.csstransforms3d) {
			transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
		} else {
			transform = 'translate(' + x + 'px,' + y + 'px)';
		}

		el.style.webkitTransform = transform;
		el.style.MozTransform = transform;
		el.style.OTransform = transform;
		el.style.msTransform = transform;
		el.style.transform = transform;
	};

	/**
	 * Sets an elements height
	 */
	this.setElementHeight = function(el, sizeY) {
		var height;
		if (!$scope.options.isLoaded) { // need to make sure grid isLoaded so css height transition isn't clobbered
			return 0;
		}

		height = parseFloat((sizeY * $scope.options.curRowHeight).toFixed(2), 10) - this.getOption('margins')[0] + 'px';

		if (el === null) {
			el = previewElement;
		}

		el.style.height = height;

		$scope.$broadcast('angular_gridster.element_height_changed', el, height);

		return height;
	};

	/**
	 * Sets an elements width
	 */
	this.setElementWidth = function(el, sizeX) {
		var width;

		if (el === null) {
			el = previewElement;
		}

		width = parseFloat((sizeX * $scope.options.curColWidth).toFixed(2)) - this.getOption('margins')[1] + 'px';

		el.style.width = width;

		return width;
	};

	/**
	 * Set an items DOM element in the grid
	 */
	this.setElement = function(el, item, ignoreHeight) {
		if (el !== null && this.isItemHidden(item)) {
			el.style.display = 'none';
			return;
		} else if (el !== null) {
			el.style.display = 'block';
		}

		if (el === null) {
			el = previewElement;
		}

		this.setElementWidth(el, this.getSizeX(item));

		this.translateElementPosition(
			el,
			this.colToPixels(this.getCol(item)),
			this.rowToPixels(this.getRow(item))
		);

		if (!ignoreHeight) {
			this.setElementHeight(el, this.getSizeY(item));
		}
	};

	/**
	 * Set all item elements in the grid
	 */
	this.setElements = function() {
		for (var i = 0; i < $scope.items.length; i++) {
			this.setElement(this.getItemElement($scope.items[i][this.getOption('trackByProperty')]), $scope.items[i]);
		}
	};

	/**
	 * Check if an items position has changed
	 */
	this.hasItemPositionChanged = function(item, row, col) {
		if (this.getRow(item) !== row ||
			this.getCol(item) !== col) {
			return true;
		}

		return false;
	};

	/**
	 * Check if an items width has changed
	 */
	this.hasItemWidthChanged = function(item, sizeX) {
		if (this.getSizeX(item) !== sizeX) {
			return true;
		}

		return false;
	};

	/**
	 * Check if an items height has changed
	 */
	this.hasItemHeightChanged = function(item, sizeY) {
		if (this.getSizeY(item) !== sizeY) {
			return true;
		}

		return false;
	};

	/**
	 * Get an items property
	 */
	this.getItemProperty = function(item, property) {
		if (!item.hasOwnProperty($scope.options.mode)) {
			return null;
		}

		if (!item[$scope.options.mode].hasOwnProperty(property)) {
			item[$scope.options.mode][property] = 0;
		}

		return item[$scope.options.mode][property];
	};

	/**
	 * Set an items property
	 */
	this.setItemProperty = function(item, property, val) {
		if (!item.hasOwnProperty($scope.options.mode)) {
			item[$scope.options.mode] = {};
		}

		item[$scope.options.mode][property] = val;

		return item;
	};

	/**
	 * Get an items row property
	 */
	this.getRow = function(item) {
		return this.getItemProperty(item, $scope.options.rowProperty);
	};

	/**
	 * Set an items row property
	 */
	this.setRow = function(item, val) {
		return this.setItemProperty(item, $scope.options.rowProperty, val);
	};

	/**
	 * Get an items row property
	 */
	this.getCol = function(item) {
		return this.getItemProperty(item, $scope.options.colProperty);
	};

	/**
	 * Set an items col property
	 */
	this.setCol = function(item, val) {
		var sizeX = this.getSizeX(item);

		// stay in the grid fool
		if ((val + sizeX) > this.getOption('columns')) {
			val = this.getOption('columns') - sizeX;
		}

		return this.setItemProperty(item, $scope.options.colProperty, val);
	};

	/**
	 * Get an items sizeX property
	 */
	this.getSizeX = function(item) {
		return this.getItemProperty(item, $scope.options.sizeXProperty);
	};

	/**
	 * Set an items sizeX property
	 */
	this.setSizeX = function(item, val) {
		var min = this.getOption('minSizeX');
		if (val < min) {
			val = min;
		}

		var max = this.getOption('columns');
		if (val > max) {
			val = max;
		}

		return this.setItemProperty(item, $scope.options.sizeXProperty, val);
	};

	/**
	 * Get an items sizeY property
	 */
	this.getSizeY = function(item) {
		return this.getItemProperty(item, $scope.options.sizeYProperty);
	};

	/**
	 * Set an items sizeY property
	 */
	this.setSizeY = function(item, val) {
		var min = this.getOption('minSizeY');
		if (val < min) {
			val = min;
		}

		var max = this.getOption('maxRows');
		if (val > max) {
			val = max;
		}

		return this.setItemProperty(item, $scope.options.sizeYProperty, val);
	};

	this.isItemHidden = function(item) {
		return item.hasOwnProperty($scope.options.mode) ? item[$scope.options.mode].hidden : false;
	};

	this.setGestureItem = function(item) {
		$scope.gestureItem = item;
	};

	this.setGestureElement = function(element) {
		$scope.gestureElement = element;
	};
});
