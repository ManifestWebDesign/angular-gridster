(function(angular, _) {
	'use strict';

	angular.module('gridster').factory('GridsterViewport', GridsterViewportFactory);

	GridsterViewportFactory.$inject = ['$injector'];

	function GridsterViewportFactory($injector) {
		/**
		 * Constructor
		 */
		function GridsterViewport($element) {
			this.$element = $element;
			this.viewport = {
				count: 0,
				isIn: false
			};
		}

		/**
		 * Will determine if the $element of the instance is in the view port or not.
		 * @returns {boolean}
		 * @private
		 */
		GridsterViewport.prototype.isInViewPort_ = function isInViewPort_() {
			if (!_.chain(this).get('$element.0.getBoundingClientRect').isFunction().valueOf()) {
				return false;
			}

			var isVisible = Boolean(this.$element[0].offsetWidth * this.$element[0].offsetHeight);

			if (!isVisible) {
				return isVisible;
			}

			var winHeight = $injector.get('$window').innerHeight;
			var rect_ = this.$element[0].getBoundingClientRect();
			// Is top part visible
			var topEdgeVisible = rect_.top >= 0 && rect_.top < winHeight;
			// Is bottom part visible
			var bottomEdgeVisible = rect_.bottom > 0 && rect_.bottom <= winHeight;

			return topEdgeVisible || bottomEdgeVisible;
		};

		/**
		 * Will return the scope of the instances' $element.
		 * @returns {Object}
		 * @private
		 */
		GridsterViewport.prototype.getScope_ = function getScope_() {
			if (!_.chain(this).get('$element.scope').isFunction().valueOf()) {
				return null;
			}

			return this.$element.scope();
		};

		/**
		 * Will check if the $element is in the viewport and update viewport properties
		 * accordingly.
		 * @returns {Object}
		 */
		GridsterViewport.prototype.identify = function identify() {
			if (this.isInViewPort_()) {
				this.viewport.count = this.viewport.count + 1;
				this.viewport.isIn = true;
			} else {
				this.viewport.isIn = false;
			}

			return this;
		};

		/**
		 * Will fire a broadcast on the scope of $element passing item
		 * @param  {GridsterItemCtrl} item
		 * @returns {Object}
		 */
		GridsterViewport.prototype.notify = function notify(item) {
			if (!this.getScope_()) {
				return this;
			}

			this.getScope_().$broadcast('gridster-item-viewport-status', item);

			return this;
		};

		/**
		 * Plain getter
		 * @returns {boolean}
		 */
		GridsterViewport.prototype.isVisible = function isVisible() {
			return _.get(this, 'viewport.isIn', false);
		};

		/**
		 * Will determine if $element is currently visible and if it has been in the viewport only once
		 * @returns {boolean}
		 */
		GridsterViewport.prototype.isFirstTimeVisible = function isFirstTimeVisible() {
			return this.isVisible() && _.get(this, 'viewport.count') === 1;
		};

		/**
		 * Kills references inside this instance
		 */
		GridsterViewport.prototype.destroy = function destroy() {
			this.$element = null;
			this.viewport = null;
		};

		return GridsterViewport;
	}
})(window.angular, window._);
