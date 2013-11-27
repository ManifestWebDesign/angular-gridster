'use strict';

angular.module('app', [
	'gridster'
])

.directive('integer', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
				if (viewValue === '' || viewValue === null || typeof viewValue === 'undefined') {
					return null;
				}
                return parseInt(viewValue, 10);
            });
        }
    };
})

;