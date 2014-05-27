/**
 * Bind scope to transcluded content
 *
 * Fix for breaking change in 1.20
 * see https://github.com/angular/angular.js/issues/7874
 */
app.directive('inject', function() {
	return {
		link: function($scope, $element, $attrs, controller, $transclude) {
			var innerScope = $scope.$new();
			$transclude(innerScope, function(clone) {
				$element.empty();
				$element.append(clone);
				$element.on('$destroy', function() {
					innerScope.$destroy();
				});
			});
		}
	};
});
