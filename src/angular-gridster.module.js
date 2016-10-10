(function(angular) {
	'use strict';

	angular.module('gridster', [])
		.constant('gridsterConfig', {
			columns: 6, // number of columns in the grid
			pushing: true, // whether to push other items out of the way
			floating: true, // whether to automatically float items up so they stack
			swapping: false, // whether or not to have items switch places instead of push down if they are the same size
			width: 'auto', // width of the grid. "auto" will expand the grid to its parent container
			colWidth: 'auto', // width of grid columns. "auto" will divide the width of the grid evenly among the columns
			rowHeight: 'match', // height of grid rows. 'match' will make it the same as the column width, a numeric value will be interpreted as pixels, '/2' is half the column width, '*5' is five times the column width, etc.
			margins: [10, 10], // margins in between grid items
			outerMargin: true,
			sparse: false, // "true" can increase performance of dragging and resizing for big grid (e.g. 20x50)
			isMobile: false, // toggle mobile view
			mobileBreakPoint: 600, // width threshold to toggle mobile mode
			mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
			minColumns: 1, // minimum amount of columns the grid can scale down to
			minRows: 1, // minimum amount of rows to show if the grid is empty
			maxRows: 100, // maximum amount of rows in the grid
			defaultSizeX: 2, // default width of an item in columns
			defaultSizeY: 1, // default height of an item in rows
			minSizeX: 1, // minimum column width of an item
			maxSizeX: null, // maximum column width of an item
			minSizeY: 1, // minumum row height of an item
			maxSizeY: null, // maximum row height of an item
			saveGridItemCalculatedHeightInMobile: false, // grid item height in mobile display. true- to use the calculated height by sizeY given
			resizable: { // options to pass to resizable handler
				enabled: true,
				handles: ['s', 'e', 'n', 'w', 'se', 'ne', 'sw', 'nw']
			},
			draggable: { // options to pass to draggable handler
				enabled: true,
				scrollSensitivity: 20, // Distance in pixels from the edge of the viewport after which the viewport should scroll, relative to pointer
				scrollSpeed: 15 // Speed at which the window should scroll once the mouse pointer gets within scrollSensitivity distance
			}
		});
})(window.angular);
