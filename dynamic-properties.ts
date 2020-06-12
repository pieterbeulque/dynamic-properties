export type Property = (element?: Element) => unknown;

export interface Properties {
  [key: string]: Property | [Property, Element];
}

export interface Cache {
  [key: string]: unknown;
}

export interface Store {
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, callback: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void;
  dispatchEvent: (event: Event) => boolean;

  $clear: () => void;

  [key: string]: unknown;
}

export default function dynamicProperties(properties: Properties = {}, settings = { throttle: 64 }): Store {
  const EMITTER = document.createDocumentFragment();
  let cached: Cache = {};

  const addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void => {
    EMITTER.addEventListener(type, listener, options);
  };

  const removeEventListener = (type: string, callback: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void => {
    EMITTER.removeEventListener(type, callback, options);
  };

  const dispatchEvent = (event: Event): boolean => EMITTER.dispatchEvent(event);

  const $clear = () => {
    cached = {};
  };

  const store = {
    addEventListener, removeEventListener, dispatchEvent, $clear,
  };

  const addProperty = (key: string, getter: Property, element?: Element) => {
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
    } else if (Array.isArray(getter)) {
      // Lazy array check
      addProperty(key, getter[0], getter[1]);
    }
  });

  // Reset cache on resize
  let resizeTimeout;
  window.addEventListener('resize', (): void => {
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
