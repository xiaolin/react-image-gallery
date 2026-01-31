/**
 * Throttle function - limits how often a function can be called
 * Compatible with lodash throttle options
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge (default: true)
 * @param {boolean} options.trailing - Execute on trailing edge (default: true)
 * @returns {Function} Throttled function
 */
export default function throttle(func, limit, options = {}) {
  const { leading = true, trailing = true } = options;

  let lastCallTime = 0;
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;

  function invokeFunc() {
    func.apply(lastThis, lastArgs);
    lastCallTime = Date.now();
    lastArgs = null;
    lastThis = null;
  }

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    lastArgs = args;
    lastThis = this;

    // First call or enough time has passed
    if (timeSinceLastCall >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leading) {
        invokeFunc();
      } else {
        lastCallTime = now;
      }
    } else if (trailing && !timeoutId) {
      // Schedule trailing call
      const remaining = limit - timeSinceLastCall;
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (lastArgs) {
          invokeFunc();
        }
      }, remaining);
    }
  };
}
