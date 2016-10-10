(function(angular) {
	'use strict';

	angular.module('gridster').directive('gridsterPreview', function() {
		return {
			replace: true,
			scope: true,
			require: '^gridster',
			template: '<div ng-style="previewStyle()" class="gridster-item gridster-preview-holder"></div>',
			link: function(scope, $el, attrs, gridster) {

				/**
				 * @returns {Object} style object for preview element
				 */
				scope.previewStyle = function() {
					if (!gridster.movingItem) {
						return {
							display: 'none'
						};
					}

					return {
						display: 'block',
						height: (gridster.movingItem.sizeY * gridster.curRowHeight - gridster.margins[0]) + 'px',
						width: (gridster.movingItem.sizeX * gridster.curColWidth - gridster.margins[1]) + 'px',
						top: (gridster.movingItem.row * gridster.curRowHeight + (gridster.outerMargin ? gridster.margins[0] : 0)) + 'px',
						left: (gridster.movingItem.col * gridster.curColWidth + (gridster.outerMargin ? gridster.margins[1] : 0)) + 'px'
					};
				};
			}
		};
	});
})(window.angular);
