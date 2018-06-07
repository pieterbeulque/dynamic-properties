export default (() => {
	const EMITTER = document.createDocumentFragment();

	return class DynamicProperties {
		constructor(properties = {}, settings = { throttle: 64 }) {
			let cached = {};

			const addProperty = (key, getter, element = null) => {
				if (typeof this[key] !== 'undefined') {
					console.warn(key, 'is already defined in this property list');
					return false;
				}

				Object.defineProperty(this, key, {
					enumerable: true,
					configurable: true,
					get: () => {
						if (typeof cached[key] === 'undefined') {
							if (element) {
								cached[key] = getter.call(element);
							} else {
								cached[key] = getter();
							}
						}

						return cached[key];
					},
				});

				return this;
			};

			Object.entries(properties).forEach(([key, getter]) => {
				if (typeof getter === 'function') {
					addProperty(key, getter);
				} else if (typeof getter !== 'string' && getter.length) {
					// Lazy array check
					addProperty(key, getter[0], getter[1] || window);
				}
			});

			// Reset cache on resize
			let resizeTimeout;
			window.addEventListener('resize', () => {
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
				}

				resizeTimeout = setTimeout(() => {
					cached = {};
					resizeTimeout = undefined;

					const change = new Event('change');
					this.dispatchEvent(change);
				}, settings.throttle);
			});
		}

		addEventListener(...args) {
			EMITTER.addEventListener(...args);
		}

		removeEventListener(...args) {
			EMITTER.removeEventListener(...args);
		}

		dispatchEvent(...args) {
			EMITTER.dispatchEvent(...args);
		}
	};
})();
