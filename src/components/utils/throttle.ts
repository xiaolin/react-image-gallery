interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Throttle function - limits how often a function can be called
 * Compatible with lodash throttle options
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @param options - Options object
 * @returns Throttled function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;

  function invokeFunc(): void {
    if (lastArgs !== null) {
      func.apply(lastThis, lastArgs);
      lastCallTime = Date.now();
      lastArgs = null;
      lastThis = null;
    }
  }

  return function throttled(this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
