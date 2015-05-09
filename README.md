angular-gridster
================
[![Build Status](https://travis-ci.org/ManifestWebDesign/angular-gridster.svg)](https://travis-ci.org/ManifestWebDesign/angular-gridster)

An implementation of gridster-like widgets for Angular JS.  This is not a wrapper on the original gridster jQuery plugin (http://gridster.net/).  It is instead completely rewritten as Angular directives.  Rewriting allowed for some additional features and better use of Angular data binding.  Even more importantly, the original plugin had unpredictable behavior and crashed when wrapped with an Angular directive in my initial tests.

## Demo

See <a href="https://rawgit.com/ManifestWebDesign/angular-gridster/master/index.html">Live Demo</a>

## Installation

```bash
  bower install angular-gridster
```

Then, import the following in your HTML alongside `jQuery` and `angular`:
```html
	<link rel="stylesheet" href="bower_components/angular-gridster/dist/angular-gridster.min.css"/>
	<script src="bower_components/javascript-detect-element-resize/jquery.resize.js"></script>
	<script src="bower_components/angular-gridster/dist/angular-gridster.min.js"></script>
```

`jquery.resize` is a jQuery plugin needed to check for changes in the gridster size.

## Usage


```js

// load the gridster module
angular.module('myModule', ['gridster']);

```

Default usage:
```HTML
<div gridster>
	<ul>
		<li gridster-item="item" ng-repeat="item in standardItems"></li>
	</ul>
</div>
```
Which expects a scope setup like the following:
``` JavaScript
// IMPORTANT: Items should be placed in the grid in the order in which they should appear.
// In most cases the sorting should be by row ASC, col ASC

// these map directly to gridsterItem directive options
$scope.standardItems = [
  { sizeX: 2, sizeY: 1, row: 0, col: 0 },
  { sizeX: 2, sizeY: 2, row: 0, col: 2 },
  { sizeX: 1, sizeY: 1, row: 0, col: 4 },
  { sizeX: 1, sizeY: 1, row: 0, col: 5 },
  { sizeX: 2, sizeY: 1, row: 1, col: 0 },
  { sizeX: 1, sizeY: 1, row: 1, col: 4 },
  { sizeX: 1, sizeY: 2, row: 1, col: 5 },
  { sizeX: 1, sizeY: 1, row: 2, col: 0 },
  { sizeX: 2, sizeY: 1, row: 2, col: 1 },
  { sizeX: 1, sizeY: 1, row: 2, col: 3 },
  { sizeX: 1, sizeY: 1, row: 2, col: 4 }
];
```
Alternatively, you can use the html attributes, similar to the original gridster plugin, but with two-way data binding:
```HTML
<div gridster>
	<ul>
		<li gridster-item row="item.position[0]" col="item.position[1]" size-x="item.size.x" size-y="item.size.y" ng-repeat="item in customItems"></li>
	</ul>
</div>
```
or:
```HTML
<div data-gridster>
	<ul>
		<li data-gridster-item data-row="item.position[0]" data-col="item.position[1]" data-sizex="item.size.x" data-sizey="item.size.y" ng-repeat="item in customItems"></li>
	</ul>
</div>
```
This allows the items to provide their own structure for row, col, and size:
```JavaScript
$scope.customItems = [
  { size: { x: 2, y: 1 }, position: [0, 0] },
  { size: { x: 2, y: 2 }, position: [0, 2] },
  { size: { x: 1, y: 1 }, position: [0, 4] },
  { size: { x: 1, y: 1 }, position: [0, 5] },
  { size: { x: 2, y: 1 }, position: [1, 0] },
  { size: { x: 1, y: 1 }, position: [1, 4] },
  { size: { x: 1, y: 2 }, position: [1, 5] },
  { size: { x: 1, y: 1 }, position: [2, 0] },
  { size: { x: 2, y: 1 }, position: [2, 1] },
  { size: { x: 1, y: 1 }, position: [2, 3] },
  { size: { x: 1, y: 1 }, position: [2, 4] }
];
```
Instead of using attributes for row, col, and size, you can also just use a mapping object for the gridster-item directive:
```HTML
<div gridster="gridsterOpts">
	<ul>
		<li gridster-item="customItemMap" ng-repeat="item in customItems"></li>
	</ul>
</div>
```
This expects a scope similar to the previous example, but with customItemMap also defined in the scope:
```JavaScript
// maps the item from customItems in the scope to the gridsterItem options
$scope.customItemMap = {
	sizeX: 'item.size.x',
	sizeY: 'item.size.y',
	row: 'item.position[0]',
	col: 'item.position[1]',
	minSizeY: 'item.minSizeY',
	maxSizeY: 'item.maxSizeY'
};
```
The gridsterItem directive can be configured like this:
```HTML
<div gridster="gridsterOpts">
	<ul>
		<li gridster-item="item" ng-repeat="item in standardItems"></li>
	</ul>
</div>
```

## Configuration

#### Via Scope
Simply pass your desired options to the gridster directive

```JavaScript
$scope.gridsterOpts = {
	columns: 6, // the width of the grid, in columns
	pushing: true, // whether to push other items out of the way on move or resize
	floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
	swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
	width: 'auto', // can be an integer, 'match' or 'auto'. 'auto' scales gridster to be the full width of its containing element. 'match' requires the colWidth to be an integer and calculates the width accordingly
	colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
	rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
	margins: [10, 10], // the pixel distance between each widget
	outerMargin: true, // whether margins apply to outer edges of the grid
	isMobile: false, // stacks the grid items if true
	mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
	mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
	minColumns: 1, // the minimum columns the grid must have
	minRows: 2, // the minimum height of the grid, in rows
	maxRows: 100, // maximum amount of rows in the grid
	fixRows: false, //set true to keep the shown rows always at the maxRows limit
	gridsterLayout: false, //Show the layout to make styling for columns and rows available. It is highly recommended to set a maxRows limit to increase the performance.
	headers: [], //array of the header names in Strings. if array is empty the headers are not shown
	defaultSizeX: 2, // the default width of a gridster item, if not specifed
	defaultSizeY: 1, // the default height of a gridster item, if not specified
	minSizeX: 1, // minimum column width of an item
	maxSizeX: null, // maximum column width of an item
	minSizeY: 1, // minumum row height of an item
	maxSizeY: null, // maximum row height of an item
	resizable: {
	   enabled: true,
	   handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
	   start: function(event, $element, widget) {}, // optional callback fired when resize is started,
	   resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
	   stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
	},
	draggable: {
	   enabled: true, // whether dragging items is supported
	   handle: '.my-class', // optional selector for resize handle
	   start: function(event, $element, widget) {}, // optional callback fired when drag is started,
	   drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
	   stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
	}
};
```


#### Via Constant
You can also override the default configuration site wide by modifying the ```gridsterConfig``` constant

```js
angular.module('yourApp').run(['gridsterConfig', function(gridsterConfig) {
	gridsterConfig.width = 1000;
}]);
```

## Controller Access

The gridster and gridsterItem directive controller objects can be accessed within their scopes as 'gridster' and 'gridsterItem'.

These controllers are internal APIs that are subject to change.

```html
<div gridster="gridsterOpts">
	<ul>
		<li gridster-item="item" ng-repeat="item in standardItems">
			{{ gridsterItem.isMoving() }}
		</li>
	</ul>
</div>
```


## Gridster Events

#### gridster-mobile-changed
When the gridster goes in or out of mobile mode, a 'gridster-mobile-changed' event is broadcast on rootScope:

```js
scope.$on('gridster-mobile-changed', function(gridster) {
})
```

#### gridster-draggable-changed
When the gridster draggable properties change, a 'gridster-draggable-changed' event is broadcast on rootScope:

```js
scope.$on('gridster-draggable-changed', function(gridster) {
})
```

#### gridster-resizable-changed
When the gridster resizable properties change, a 'gridster-resizable-changed' event is broadcast on rootScope:

```js
scope.$on('gridster-resizable-changed', function(gridster) {
})
```

#### gridster-resized
When the gridster element's size changes, a 'gridster-resized' event is broadcast on rootScope:

```js
scope.$on('gridster-resized', function(sizes, gridster) {
	// sizes[0] = width
	// sizes[1] = height
	// gridster.
})
```

## Gridster Item Events

#### gridster-item-transition-end
Gridster items have CSS transitions by default.  Gridster items listen for css transition-end across different browsers and broadcast the event 'gridster-item-transition-end'.  You can listen for it like this from within the gridster-item directive:

```js
scope.$on('gridster-item-transition-end', function(item) {
	// item.$element
	// item.gridster
	// item.row
	// item.col
	// item.sizeX
	// item.sizeY
	// item.minSizeX
	// item.minSizeY
	// item.maxSizeX
	// item.maxSizeY
})
```

#### gridster-item-initialized
After a gridster item's controller has finished with setup, it broadcasts an event 'gridster-item-initialized' on its own scope.  You can listen for it like this from within the gridster-item directive:

```js
scope.$on('gridster-item-initialized', function(item) {
	// item.$element
	// item.gridster
	// item.row
	// item.col
	// item.sizeX
	// item.sizeY
	// item.minSizeX
	// item.minSizeY
	// item.maxSizeX
	// item.maxSizeY
})
```

#### gridster-item-resized
After a gridster item's size changes (rows or columns), it broadcasts an event 'gridster-item-resized' on its own scope.  You can listen for it like this from within the gridster-item directive:

```js
scope.$on('gridster-item-resized', function(item) {
	// item.$element
	// item.gridster
	// item.row
	// item.col
	// item.sizeX
	// item.sizeY
	// item.minSizeX
	// item.minSizeY
	// item.maxSizeX
	// item.maxSizeY
})
```

## Gridster Error Events

#### gridster-item-unplacable
After adding an item to the array of items, the ng-repeat will automatically add the item to the gridster, no matter what. However, you can listen to the event gridster-item-unplacable which is fired when an item doesn't fit in.
```js
$scope.$on('gridster-item-unplacable', function (event, item) {
	//item is unplacable
});
```
As an example, you could handle the error like the following (which deletes the item out of the array if the error event is fired):
```js
$scope.$on('gridster-item-unplacable', function (event, item) {
	//item is unplacable
	$scope.itemUnplacable(item);
});
```
whereas $scope.itemUnplacable(item) contains
```js
$scope.itemUnplacable = function (item) {
	for (var i = 0; i < $scope.standardItems.length; i++) {
		if ($scope.standardItems[i].id == item.id) {
			$scope.standardItems.splice(i, 1);
		}
	}
}
```
The above function iterates over all the items and checks for the item's id, which can be set like this:
```js
$scope.standardItems = [
	{ sizeX: 1, sizeY: 9, row: 0, col: 0, id: 1 },
	{ sizeX: 1, sizeY: 4, row: 0, col: 2, id: 2 },
	{ sizeX: 1, sizeY: 3, row: 0, col: 4, id: 3 },
	{ sizeX: 1, sizeY: 6, row: 0, col: 5, id: 4 },
	{ sizeX: 1, sizeY: 5, row: 1, col: 0, id: 5 },
];
```

## Watching item changes of size and position

The typical Angular way would be to do a $scope.$watch on your item or items in the scope.  Example:

```JavaScript
// two objects, converted to gridster items in the view via ng-repeat
$scope.items = [{},{}];

$scope.$watch('items', function(items){
   // one of the items changed
}, true);
```

or

```JavaScript
$scope.$watch('items[0]', function(){
   // item0 changed
}, true);
```

or

```JavaScript
$scope.$watch('items[0].sizeX', function(){
   // item0 sizeX changed
}, true);
```

The third argument, true, is to make the watch based on the value of the object, rather than just matching the reference to the object.


## Note
This directive/plugin does, unlike the jQuery plugin, use standard camelCase for variables and object properties, while the original plugin used lower\_case\_with_underscores.  These options have not and may never be implemented:

* widget_class - not necessary since directives already whatever classes and attributes you want to add
* widget_margins - replaced by 'margins'
* widget\_base\_dimensions - replaced by 'defaultSizeX' and 'defaultSizeY'
* min_cols - currently, only 'columns' is used to defined the maximum width
* max_cols - currently, only 'columns' is used to defined the maximum width
* min_rows - replaced by 'minRows'
* max_rows - replaced by 'maxRows'
* max\_size\_x
* max\_size\_y
* extra_cols
* extra_rows
* autogenerate_stylesheet
* avoid\_overlapped\_widgets
* resize.axes
* resize.handle_class - replaced by 'resize.handle', which doesn't need to be a class
* resize.handle\_append\_to
* resize.max_size
* collision.on\_overlap\_start
* collision.on_overlap
* collision.on\_overlap\_stop

## Contributing

#### Install project dependencies
```bash
  npm install
  bower install
```

#### Style Guide
Please respect the formatting specified in .editorconfig

#### Grunt Tasks
```grunt default``` Runs jshint & compiles project

```grunt dev``` Opens demo page, starts karma test runner, runs unit tests on src & test folder changes

```grunt e2e``` Watch src folder and run e2e tests on changes

```grunt test``` Runs the unit & e2e tests
