'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DynamicProperties = function DynamicProperties() {
	var _this = this;

	var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { throttle: 64 };

	_classCallCheck(this, DynamicProperties);

	var cached = {};

	var addProperty = function addProperty(key, getter) {
		var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

		if (typeof _this[key] !== 'undefined') {
			console.warn(key, 'is already defined in this property list');
			return false;
		}

		Object.defineProperty(_this, key, {
			enumerable: true,
			configurable: true,
			get: function get() {
				if (typeof cached[key] === 'undefined') {
					if (element) {
						cached[key] = getter.call(element);
					} else {
						cached[key] = getter();
					}
				}

				return cached[key];
			}
		});

		return _this;
	};

	for (var key in properties) {
		var getter = properties[key];

		if (typeof getter === 'function') {
			addProperty(key, getter);
		} else if (typeof getter !== 'string' && getter.length) {
			// Lazy array check
			addProperty(key, getter[0], getter[1] || window);
		}
	}

	// Reset cache on resize
	var resizeTimeout = void 0;
	window.addEventListener('resize', function (e) {
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}

		resizeTimeout = setTimeout(function () {
			cached = {};
			resizeTimeout = undefined;
		}, settings.throttle);
	});
};

exports.default = DynamicProperties;