(function(angular, _) {
	'use strict';

	angular.module('gridster').controller('GridsterItemCtrl', ['GridsterViewport', function(GridsterViewport) {
		this.$element = null;
		this.gridster = null;
		this.row = null;
		this.col = null;
		this.sizeX = null;
		this.sizeY = null;
		this.minSizeX = 0;
		this.minSizeY = 0;
		this.maxSizeX = null;
		this.maxSizeY = null;

		this.init = function($element, gridster) {
			this.$element = $element;
			this.gridster = gridster;
			this.sizeX = gridster.defaultSizeX;
			this.sizeY = gridster.defaultSizeY;
			this.gridsterViewport = new GridsterViewport($element);
		};

		this.destroy = function() {
			// set these to null to avoid the possibility of circular references
			this.gridster = null;
			this.$element = null;
			this.gridsterViewport.destroy();
			this.gridsterViewport = null;
		};

		/**
		 * Will update the viewport status of the instance and notify
		 * the $elements' scope.
		 */
		this.viewportNotify = function() {
			this.gridsterViewport.identify().notify(this);
		};

		/**
		 * Will determine if $element is visible in viewport
		 * @returns {boolean}
		 */
		this.isVisible = function() {
			return this.gridsterViewport.isVisible();
		};

		/**
		 * Will determine if $element is visible in the viewport
		 * for the first time.
		 * @returns {boolean}
		 */
		this.isFirstTimeVisible = function() {
			return this.gridsterViewport.isFirstTimeVisible();
		};

		/**
		 * Returns the items most important attributes
		 */
		this.toJSON = function() {
			return {
				row: this.row,
				col: this.col,
				sizeY: this.sizeY,
				sizeX: this.sizeX
			};
		};

		this.isMoving = function() {
			return this.gridster.movingItem === this;
		};

		/**
		 * Set the items position
		 *
		 * @param {Number} row
		 * @param {Number} column
		 */
		this.setPosition = function(row, column) {
			this.gridster.putItem(this, row, column);

			if (!this.isMoving()) {
				this.setElementPosition();
			}
		};

		/**
		 * Sets a specified size property
		 *
		 * @param {String} key Can be either "x" or "y"
		 * @param {Number} value The size amount
		 * @param {Boolean} preventMove
		 */
		this.setSize = function(key, value, preventMove) {
			key = key.toUpperCase();
			var camelCase = 'size' + key,
				titleCase = 'Size' + key;
			if (value === '') {
				return;
			}
			value = parseInt(value, 10);
			if (isNaN(value) || value === 0) {
				value = this.gridster['default' + titleCase];
			}
			var max = key === 'X' ? this.gridster.columns : this.gridster.maxRows;
			if (this['max' + titleCase]) {
				max = Math.min(this['max' + titleCase], max);
			}
			if (this.gridster['max' + titleCase]) {
				max = Math.min(this.gridster['max' + titleCase], max);
			}
			if (key === 'X' && this.cols) {
				max -= this.cols;
			} else if (key === 'Y' && this.rows) {
				max -= this.rows;
			}

			var min = 0;
			if (this['min' + titleCase]) {
				min = Math.max(this['min' + titleCase], min);
			}
			if (this.gridster['min' + titleCase]) {
				min = Math.max(this.gridster['min' + titleCase], min);
			}

			value = Math.max(Math.min(value, max), min);

			var changed = (this[camelCase] !== value || (this['old' + titleCase] && this['old' + titleCase] !== value));
			this['old' + titleCase] = this[camelCase] = value;

			if (!this.isMoving()) {
				this['setElement' + titleCase]();
			}
			if (!preventMove && changed) {
				this.gridster.moveOverlappingItems(this);
				this.gridster.layoutChanged();
			}

			return changed;
		};

		/**
		 * Sets the items sizeY property
		 *
		 * @param {Number} rows
		 * @param {Boolean} preventMove
		 */
		this.setSizeY = function(rows, preventMove) {
			return this.setSize('Y', rows, preventMove);
		};

		/**
		 * Sets the items sizeX property
		 *
		 * @param {Number} columns
		 * @param {Boolean} preventMove
		 */
		this.setSizeX = function(columns, preventMove) {
			return this.setSize('X', columns, preventMove);
		};

		/**
		 * Sets an elements position on the page
		 */
		this.setElementPosition = function() {
			if (this.gridster.isMobile) {
				this.$element.css({
					marginLeft: this.gridster.margins[0] + 'px',
					marginRight: this.gridster.margins[0] + 'px',
					marginTop: this.gridster.margins[1] + 'px',
					marginBottom: this.gridster.margins[1] + 'px',
					top: '',
					left: ''
				});
			} else {
				this.$element.css({
					margin: 0,
					top: (this.row * this.gridster.curRowHeight + (this.gridster.outerMargin ? this.gridster.margins[0] : 0)) + 'px',
					left: (this.col * this.gridster.curColWidth + (this.gridster.outerMargin ? this.gridster.margins[1] : 0)) + 'px'
				});
			}
		};

		/**
		 * Sets an elements height
		 */
		this.setElementSizeY = function() {
			if (this.gridster.isMobile && !this.gridster.saveGridItemCalculatedHeightInMobile) {
				this.$element.css('height', '');
			} else {
				this.$element.css('height', (this.sizeY * this.gridster.curRowHeight - this.gridster.margins[0]) + 'px');
			}
		};

		/**
		 * Sets an elements width
		 */
		this.setElementSizeX = function() {
			if (this.gridster.isMobile) {
				this.$element.css('width', '');
			} else {
				this.$element.css('width', (this.sizeX * this.gridster.curColWidth - this.gridster.margins[1]) + 'px');
			}
		};

		/**
		 * Gets an element's width
		 */
		this.getElementSizeX = function() {
			return (this.sizeX * this.gridster.curColWidth - this.gridster.margins[1]);
		};

		/**
		 * Gets an element's height
		 */
		this.getElementSizeY = function() {
			return (this.sizeY * this.gridster.curRowHeight - this.gridster.margins[0]);
		};

	}]);
})(window.angular, window._);
