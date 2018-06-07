'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DynamicProperties = function (_EventTarget) {
	_inherits(DynamicProperties, _EventTarget);

	function DynamicProperties() {
		var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { throttle: 64 };

		_classCallCheck(this, DynamicProperties);

		var _this = _possibleConstructorReturn(this, (DynamicProperties.__proto__ || Object.getPrototypeOf(DynamicProperties)).call(this));

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

				var change = new Event('change');
				_this.dispatchEvent(change);
			}, settings.throttle);
		});
		return _this;
	}

	return DynamicProperties;
}(EventTarget);

exports.default = DynamicProperties;