angular-gridster
================
[![Build Status](https://travis-ci.org/ManifestWebDesign/angular-gridster.svg)](https://travis-ci.org/ManifestWebDesign/angular-gridster)

An implementation of gridster-like widgets for Angular JS.  This is not a wrapper on the original gridster jQuery plugin (http://gridster.net/).  It is instead completely rewritten as Angular directives.  Rewriting allowed for some additional features and better use of Angular data binding.  Even more importantly, the original plugin had unpredictable behavior and crashed when wrapped with an Angular directive in my initial tests.

##Demo

See <a href="https://cdn.rawgit.com/ManifestWebDesign/angular-gridster/master/index.html">Live Demo</a>

##Usage

##Installation

```bash
  bower install angular-gridster
```

Then, import the following in your HTML alongside `jQuery` and `angular`:
```html
  <link rel="stylesheet" href="dist/angular-gridster.min.css" />
  <script src="src/angular-gridster.js"></script>
```

##Configuration
```js
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
	 * The minimum width a column can be, will cause switch to lower view mode
	 * @type {number}
	 */
	minColWidth: null,

	/**
	 * The minimum amount of rows to show if the grid is empty
	 * @type {number}
	 */
	minRows: 3,

	/**
	 * The maximum amount of rows allowed in the grid
	 * @type {number}
	 */
	maxRows: 100,

	/**
	 * The default width of a item
	 * @type {number}
	 */
	defaultSizeX: 1,

	/**
	 * The default height of a item
	 * @type {number}
	 */
	defaultSizeY: 1,

	/**
	 * The items id field name
	 * @type {string}
	 */
	trackByField: 'id',

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
	overlaysEnabled: false
```

##Contributing

####Install project dependencies
```bash
  npm install
  bower install
```

####Style Guide
Please respect the formatting specified in .editorconfig

####Grunt Tasks
```grunt default``` Runs jshint & compiles project

```grunt dev``` Opens demo page, starts karma test runner, runs unit tests on src & test folder changes

```grunt dev_e2e``` Watch src folder and run e2e tests on changes

```grunt test``` Runs the unit & e2e tests
