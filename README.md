angular-gridster
================

An implementation of gridster-like widgets for Angular JS.  This is not a wrapper on the original gridster jQuery plugin (http://gridster.net/).  It is instead completely rewritten as Angular directives.  Rewriting allowed for some additional features and better use of Angular data binding.  Even more importantly, the original plugin had unpredictable behavior and crashed when wrapped with an Angular directive in my initial tests.

Demo html/css/js is included and can be executed by running "grunt serve" or by opening app/index.html in a web browser.

Here is an example of the default usage:
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
        col: 'item.position[1]'
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
With a scope like:
```JavaScript
    $scope.gridsterOpts = {
      minRows: 2, // the minimum height of the grid, in rows
      maxRows: 100,
      columns: 6, // the width of the grid, in columns
      colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
      rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
      margins: [10, 10], // the pixel distance between each widget
      defaultSizeX: 2, // the default width of a gridster item, if not specifed
      defaultSizeY: 1, // the default height of a gridster item, if not specified
      mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
      resizable: {
         enabled: true,
         start: function(event, uiWidget, $element) {}, // optional callback fired when resize is started,
         resize: function(event, uiWidget, $element) {}, // optional callback fired when item is resized,
         stop: function(event, uiWidget, $element) {} // optional callback fired when item is finished resizing
      },
      draggable: {
         enabled: true, // whether dragging items is supported
         handle: '.my-class', // optional selector for resize handle
         start: function(event, uiWidget, $element) {}, // optional callback fired when drag is started,
         drag: function(event, uiWidget, $element) {}, // optional callback fired when item is moved,
         stop: function(event, uiWidget, $element) {} // optional callback fired when item is finished dragging
      }
    };
```
This directive/plugin does not generate style tags, like the jQuery plugin.  It also uses standard camalCase for variables and object properties, while the original plugin used lower\_case\_with_underscores.  These options have not and may never be implemented:

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


Watching item size and position:

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
