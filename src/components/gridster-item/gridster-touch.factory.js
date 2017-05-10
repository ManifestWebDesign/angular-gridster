(function(angular) {
	'use strict';

	angular.module('gridster').factory('GridsterTouch', [function() {
		return function GridsterTouch(target, startEvent, moveEvent, endEvent) {
			var lastXYById = {};

			//  Opera doesn't have Object.keys so we use this wrapper
			var numberOfKeys = function(theObject) {
				if (Object.keys) {
					return Object.keys(theObject).length;
				}

				var n = 0,
					key;
				for (key in theObject) {
					++n;
				}

				return n;
			};

			//  this calculates the delta needed to convert pageX/Y to offsetX/Y because offsetX/Y don't exist in the TouchEvent object or in Firefox's MouseEvent object
			var computeDocumentToElementDelta = function(theElement) {
				var elementLeft = 0;
				var elementTop = 0;
				var oldIEUserAgent = navigator.userAgent.match(/\bMSIE\b/);

				for (var offsetElement = theElement; offsetElement != null; offsetElement = offsetElement.offsetParent) {
					//  the following is a major hack for versions of IE less than 8 to avoid an apparent problem on the IEBlog with double-counting the offsets
					//  this may not be a general solution to IE7's problem with offsetLeft/offsetParent
					if (oldIEUserAgent &&
						(!document.documentMode || document.documentMode < 8) &&
						offsetElement.currentStyle.position === 'relative' && offsetElement.offsetParent && offsetElement.offsetParent.currentStyle.position === 'relative' && offsetElement.offsetLeft === offsetElement.offsetParent.offsetLeft) {
						// add only the top
						elementTop += offsetElement.offsetTop;
					} else {
						elementLeft += offsetElement.offsetLeft;
						elementTop += offsetElement.offsetTop;
					}
				}

				return {
					x: elementLeft,
					y: elementTop
				};
			};

			//  cache the delta from the document to our event target (reinitialized each mousedown/MSPointerDown/touchstart)
			var documentToTargetDelta = computeDocumentToElementDelta(target);
			var useSetReleaseCapture = false;

			//  common event handler for the mouse/pointer/touch models and their down/start, move, up/end, and cancel events
			var doEvent = function(theEvtObj) {

				if (theEvtObj.type === 'mousemove' && numberOfKeys(lastXYById) === 0) {
					return;
				}

				var prevent = true;

				var pointerList = theEvtObj.changedTouches ? theEvtObj.changedTouches : [theEvtObj];
				for (var i = 0; i < pointerList.length; ++i) {
					var pointerObj = pointerList[i];
					var pointerId = (typeof pointerObj.identifier !== 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId !== 'undefined') ? pointerObj.pointerId : 1;

					//  use the pageX/Y coordinates to compute target-relative coordinates when we have them (in ie < 9, we need to do a little work to put them there)
					if (typeof pointerObj.pageX === 'undefined') {
						//  initialize assuming our source element is our target
						pointerObj.pageX = pointerObj.offsetX + documentToTargetDelta.x;
						pointerObj.pageY = pointerObj.offsetY + documentToTargetDelta.y;

						if (pointerObj.srcElement.offsetParent === target && document.documentMode && document.documentMode === 8 && pointerObj.type === 'mousedown') {
							//  source element is a child piece of VML, we're in IE8, and we've not called setCapture yet - add the origin of the source element
							pointerObj.pageX += pointerObj.srcElement.offsetLeft;
							pointerObj.pageY += pointerObj.srcElement.offsetTop;
						} else if (pointerObj.srcElement !== target && !document.documentMode || document.documentMode < 8) {
							//  source element isn't the target (most likely it's a child piece of VML) and we're in a version of IE before IE8 -
							//  the offsetX/Y values are unpredictable so use the clientX/Y values and adjust by the scroll offsets of its parents
							//  to get the document-relative coordinates (the same as pageX/Y)
							var sx = -2,
								sy = -2; // adjust for old IE's 2-pixel border
							for (var scrollElement = pointerObj.srcElement; scrollElement !== null; scrollElement = scrollElement.parentNode) {
								sx += scrollElement.scrollLeft ? scrollElement.scrollLeft : 0;
								sy += scrollElement.scrollTop ? scrollElement.scrollTop : 0;
							}

							pointerObj.pageX = pointerObj.clientX + sx;
							pointerObj.pageY = pointerObj.clientY + sy;
						}
					}


					var pageX = pointerObj.pageX;
					var pageY = pointerObj.pageY;

					if (theEvtObj.type.match(/(start|down)$/i)) {
						//  clause for processing MSPointerDown, touchstart, and mousedown

						//  refresh the document-to-target delta on start in case the target has moved relative to document
						documentToTargetDelta = computeDocumentToElementDelta(target);

						//  protect against failing to get an up or end on this pointerId
						if (lastXYById[pointerId]) {
							if (endEvent) {
								endEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}

							delete lastXYById[pointerId];
						}

						if (startEvent) {
							if (prevent) {
								prevent = startEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}
						}

						//  init last page positions for this pointer
						lastXYById[pointerId] = {
							x: pageX,
							y: pageY
						};

						// IE pointer model
						if (target.msSetPointerCapture && prevent) {
							target.msSetPointerCapture(pointerId);
						} else if (theEvtObj.type === 'mousedown' && numberOfKeys(lastXYById) === 1) {
							if (useSetReleaseCapture) {
								target.setCapture(true);
							} else {
								document.addEventListener('mousemove', doEvent, false);
								document.addEventListener('mouseup', doEvent, false);
							}
						}
					} else if (theEvtObj.type.match(/move$/i)) {
						//  clause handles mousemove, MSPointerMove, and touchmove

						if (lastXYById[pointerId] && !(lastXYById[pointerId].x === pageX && lastXYById[pointerId].y === pageY)) {
							//  only extend if the pointer is down and it's not the same as the last point

							if (moveEvent && prevent) {
								prevent = moveEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}

							//  update last page positions for this pointer
							lastXYById[pointerId].x = pageX;
							lastXYById[pointerId].y = pageY;
						}
					} else if (lastXYById[pointerId] && theEvtObj.type.match(/(up|end|cancel)$/i)) {
						//  clause handles up/end/cancel

						if (endEvent && prevent) {
							prevent = endEvent({
								target: theEvtObj.target,
								which: theEvtObj.which,
								pointerId: pointerId,
								pageX: pageX,
								pageY: pageY
							});
						}

						//  delete last page positions for this pointer
						delete lastXYById[pointerId];

						//  in the Microsoft pointer model, release the capture for this pointer
						//  in the mouse model, release the capture or remove document-level event handlers if there are no down points
						//  nothing is required for the iOS touch model because capture is implied on touchstart
						if (target.msReleasePointerCapture) {
							target.msReleasePointerCapture(pointerId);
						} else if (theEvtObj.type === 'mouseup' && numberOfKeys(lastXYById) === 0) {
							if (useSetReleaseCapture) {
								target.releaseCapture();
							} else {
								document.removeEventListener('mousemove', doEvent, false);
								document.removeEventListener('mouseup', doEvent, false);
							}
						}
					}
				}

				if (prevent) {
					if (theEvtObj.preventDefault) {
						theEvtObj.preventDefault();
					}

					if (theEvtObj.preventManipulation) {
						theEvtObj.preventManipulation();
					}

					if (theEvtObj.preventMouseEvent) {
						theEvtObj.preventMouseEvent();
					}
				}
			};

			// saving the settings for contentZooming and touchaction before activation
			var contentZooming, msTouchAction;

			this.enable = function() {

				if (window.navigator.msPointerEnabled) {
					//  Microsoft pointer model
					target.addEventListener('MSPointerDown', doEvent, false);
					target.addEventListener('MSPointerMove', doEvent, false);
					target.addEventListener('MSPointerUp', doEvent, false);
					target.addEventListener('MSPointerCancel', doEvent, false);

					//  css way to prevent panning in our target area
					if (typeof target.style.msContentZooming !== 'undefined') {
						contentZooming = target.style.msContentZooming;
						target.style.msContentZooming = 'none';
					}

					//  new in Windows Consumer Preview: css way to prevent all built-in touch actions on our target
					//  without this, you cannot touch draw on the element because IE will intercept the touch events
					if (typeof target.style.msTouchAction !== 'undefined') {
						msTouchAction = target.style.msTouchAction;
						target.style.msTouchAction = 'none';
					}
				} else if (target.addEventListener) {
					//  iOS touch model
					target.addEventListener('touchstart', doEvent, false);
					target.addEventListener('touchmove', doEvent, false);
					target.addEventListener('touchend', doEvent, false);
					target.addEventListener('touchcancel', doEvent, false);

					//  mouse model
					target.addEventListener('mousedown', doEvent, false);

					//  mouse model with capture
					//  rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
					if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
						useSetReleaseCapture = true;

						target.addEventListener('mousemove', doEvent, false);
						target.addEventListener('mouseup', doEvent, false);
					}
				} else if (target.attachEvent && target.setCapture) {
					//  legacy IE mode - mouse with capture
					useSetReleaseCapture = true;
					target.attachEvent('onmousedown', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
					target.attachEvent('onmousemove', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
					target.attachEvent('onmouseup', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
				}
			};

			this.disable = function() {
				if (window.navigator.msPointerEnabled) {
					//  Microsoft pointer model
					target.removeEventListener('MSPointerDown', doEvent, false);
					target.removeEventListener('MSPointerMove', doEvent, false);
					target.removeEventListener('MSPointerUp', doEvent, false);
					target.removeEventListener('MSPointerCancel', doEvent, false);

					//  reset zooming to saved value
					if (contentZooming) {
						target.style.msContentZooming = contentZooming;
					}

					// reset touch action setting
					if (msTouchAction) {
						target.style.msTouchAction = msTouchAction;
					}
				} else if (target.removeEventListener) {
					//  iOS touch model
					target.removeEventListener('touchstart', doEvent, false);
					target.removeEventListener('touchmove', doEvent, false);
					target.removeEventListener('touchend', doEvent, false);
					target.removeEventListener('touchcancel', doEvent, false);

					//  mouse model
					target.removeEventListener('mousedown', doEvent, false);

					//  mouse model with capture
					//  rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
					if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
						useSetReleaseCapture = true;

						target.removeEventListener('mousemove', doEvent, false);
						target.removeEventListener('mouseup', doEvent, false);
					}
				} else if (target.detachEvent && target.setCapture) {
					//  legacy IE mode - mouse with capture
					useSetReleaseCapture = true;
					target.detachEvent('onmousedown');
					target.detachEvent('onmousemove');
					target.detachEvent('onmouseup');
				}
			};

			return this;
		};
	}]);
})(window.angular);
