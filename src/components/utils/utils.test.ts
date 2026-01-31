import debounce from "./debounce";
import throttle from "./throttle";

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("delays function execution until after wait time", () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it("resets timer on subsequent calls", () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    jest.advanceTimersByTime(50);

    debouncedFunc(); // Reset timer
    jest.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled(); // Still waiting

    jest.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it("passes arguments to the original function", () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc("arg1", "arg2");
    jest.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("preserves this context", () => {
    const obj = {
      value: 42,
      getValue: jest.fn(function (this: { value: number }) {
        return this.value;
      }),
      debouncedGetValue: null as ReturnType<typeof debounce> | null,
    };

    obj.debouncedGetValue = debounce(obj.getValue, 100);
    obj.debouncedGetValue();
    jest.advanceTimersByTime(100);

    expect(obj.getValue).toHaveBeenCalled();
  });

  it("only calls function once for rapid successive calls", () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it("uses the last arguments when called multiple times", () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc("first");
    debouncedFunc("second");
    debouncedFunc("third");

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledWith("third");
  });
});

describe("throttle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("executes immediately on first call (leading edge)", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);
  });

  it("ignores calls within the throttle period", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc();
    throttledFunc();
    throttledFunc();

    expect(func).toHaveBeenCalledTimes(1);
  });

  it("allows calls after throttle period", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);

    throttledFunc();
    expect(func).toHaveBeenCalledTimes(2);
  });

  it("passes arguments to the original function", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc("arg1", "arg2");
    expect(func).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("preserves this context", () => {
    const obj = {
      value: 42,
      getValue: jest.fn(function (this: { value: number }) {
        return this.value;
      }),
      throttledGetValue: null as ReturnType<typeof throttle> | null,
    };

    obj.throttledGetValue = throttle(obj.getValue, 100);
    obj.throttledGetValue();

    expect(obj.getValue).toHaveBeenCalled();
  });

  it("supports trailing: false option (no trailing call)", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100, { trailing: false });

    throttledFunc("first");
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith("first");

    throttledFunc("second");
    throttledFunc("third");

    jest.advanceTimersByTime(100);
    // With trailing: false, should NOT call with "third"
    expect(func).toHaveBeenCalledTimes(1);

    // But next call after throttle period should work
    throttledFunc("fourth");
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith("fourth");
  });

  it("supports trailing: true option (default - trailing call)", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100, { trailing: true });

    throttledFunc("first");
    expect(func).toHaveBeenCalledTimes(1);

    throttledFunc("second");
    throttledFunc("third");

    jest.advanceTimersByTime(100);
    // With trailing: true, should call with last args
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith("third");
  });

  it("default behavior has trailing call", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc("first");
    throttledFunc("second");

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenLastCalledWith("second");
  });

  it("does not make trailing call if no calls during throttle period", () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 100);

    throttledFunc("first");
    expect(func).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    // No trailing call because no calls were made during throttle
    expect(func).toHaveBeenCalledTimes(1);
  });
});
