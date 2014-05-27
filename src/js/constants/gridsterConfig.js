/*jshint -W079 */
var app = angular.module('gridster', []);

/**
 * @name gridsterConfig
 * @description  Provides angular-gridster with sensible defaults
 */
app.constant('gridsterConfig', {

	/**
	 * The available view modes
	 * These options will be set when the view mode is active
	 *
	 * @type {object}
	 */
	modes: {
		desktop: {
			columns: 12,
			minThreshold: 1025,
			maxThreshold: 9999,
			defaultSizeX: 3,
			defaultSizeY: 3,
			minSizeX: 3,
			minSizeY: 2

		},
		tablet: {
			columns: 12,
			minThreshold: 768,
			maxThreshold: 1024,
			defaultSizeX: 4,
			defaultSizeY: 4,
			minSizeX: 4,
			minSizeY: 2
		},
		mobile: {
			columns: 6,
			minThreshold: 0,
			maxThreshold: 767,
			defaultSizeX: 6,
			defaultSizeY: 6,
			minSizeX: 6,
			minSizeY: 3
		}
	},

	/**
	 * The number of columns in the grid
	 */

	/**
	 * The width of the grid.
	 * @type {string|number}
	 */
	width: 'auto',

	/**
	 * The width of the columns.
	 * "auto" will divide the width of the grid evenly among the columns
	 * @type {string|number}
	 */
	colWidth: 'auto',

	/**
	 * The height of the rows.
	 * "match" will set the row height to be the same as the column width
	 * @type {string|number}
	 */
	rowHeight: 'match',

	/**
	 * Row/column
	 * @type {array}
	 */
	margins: [10, 10],

	/**
	 * The minimum width of an item
	 * @type {number} Width in pixels
	 */
	minItemWidth: 100,

	/**
	 * The minimum height of an item
	 * @type {number} Height in pixels
	 */
	minItemHeight: 100,

	/**
	 * The minimum amount of rows to show if the grid is empty
	 * @type {number}
	 */
	minRows: 12,

	/**
	 * The maximum amount of rows allowed in the grid
	 * @type {number}
	 */
	maxRows: 1000,

	/**
	 * The items id property name
	 * @type {string}
	 */
	trackByProperty: 'id',

	/**
	 * The items row property name
	 */
	rowProperty: 'row',

	/**
	 * The items column property name
	 */
	colProperty: 'col',

	/**
	 * The items sizeX property name
	 */
	sizeXProperty: 'sizeX',

	/**
	 * The items sizeY property name
	 */
	sizeYProperty: 'sizeY',

	/**
	 * Float items up on changes if true
	 * @type {boolean}
	 */
	floatItemsUp: true,

	/**
	 * Move overlapping items if true
	 * @type {string}
	 */
	moveOverlappingItems: true,

	/**
	 * Allow items to be resized if true
	 * @type {boolean}
	 */
	resizableEnabled: true,

	/**
	 * Apply overlays to grid items on drag/resize.
	 * Useful for preventing mouse hijacking with iframes.
	 */
	iframeFix: true,

	/**
	 * Show preview holder during resizing
	 * @type {boolean}
	 */
	resizablePreviewEnabled: true,

	/**
	 * Show preview holder during dragging
	 * @type {boolean}
	 */
	draggablePreviewEnabled: true

});
