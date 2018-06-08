export default function dynamicProperties(properties = {}, settings = { throttle: 64 }) {
	const EMITTER = document.createDocumentFragment();
	let cached = {};

	const addEventListener = (...args) => {
		EMITTER.addEventListener(...args);
	};

	const removeEventListener = (...args) => {
		EMITTER.removeEventListener(...args);
	};

	const dispatchEvent = (...args) => {
		EMITTER.dispatchEvent(...args);
	};

	const store = { addEventListener, removeEventListener, dispatchEvent };

	const addProperty = (key, getter, element = null) => {
		if (typeof store[key] !== 'undefined') {
			console.warn(key, 'is already defined in this property list');
			return false;
		}

		Object.defineProperty(store, key, {
			enumerable: true,
			configurable: false,
			get: () => {
				if (typeof cached[key] !== 'undefined') {
					return cached[key];
				}

				const value = (element) ? getter.call(element) : getter();
				cached[key] = value;
				return cached[key];
			},
		});

		return store;
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
			store.dispatchEvent(change);
		}, settings.throttle);
	});

	return Object.freeze(store);
}
