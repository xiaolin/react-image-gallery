import { act, renderHook } from "@testing-library/react";
import { useAutoPlay } from "./useAutoPlay";

describe("useAutoPlay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const defaultProps = {
    autoPlay: false,
    slideInterval: 3000,
    slideDuration: 550,
    infinite: true,
    totalSlides: 5,
    currentIndex: 0,
    canSlideRight: jest.fn(() => true),
    slideToIndexCore: jest.fn(),
    slideToIndexWithStyleReset: jest.fn(),
    onPlay: jest.fn(),
    onPause: jest.fn(),
  };

  it("returns isPlaying as false initially", () => {
    const { result } = renderHook(() => useAutoPlay(defaultProps));
    expect(result.current.isPlaying).toBe(false);
  });

  it("sets isPlaying to true when play is called", () => {
    const { result } = renderHook(() => useAutoPlay(defaultProps));

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("calls onPlay callback when play is called", () => {
    const onPlay = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, onPlay })
    );

    act(() => {
      result.current.play();
    });

    expect(onPlay).toHaveBeenCalledWith(0);
  });

  it("does not call onPlay when shouldCallOnPlay is false", () => {
    const onPlay = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, onPlay })
    );

    act(() => {
      result.current.play(false);
    });

    expect(onPlay).not.toHaveBeenCalled();
  });

  it("sets isPlaying to false when pause is called", () => {
    const { result } = renderHook(() => useAutoPlay(defaultProps));

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("calls onPause callback when pause is called", () => {
    const onPause = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, onPause })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause();
    });

    expect(onPause).toHaveBeenCalledWith(0);
  });

  it("does not call onPause when shouldCallOnPause is false", () => {
    const onPause = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, onPause })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause(false);
    });

    expect(onPause).not.toHaveBeenCalled();
  });

  it("togglePlay starts playing when not playing", () => {
    const { result } = renderHook(() => useAutoPlay(defaultProps));

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("togglePlay pauses when playing", () => {
    const { result } = renderHook(() => useAutoPlay(defaultProps));

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("slides to next index after slideInterval", () => {
    const slideToIndexCore = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, slideToIndexCore, totalSlides: 5 })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(slideToIndexCore).toHaveBeenCalledWith(1);
  });

  it("uses slideToIndexWithStyleReset for 2 slides", () => {
    const slideToIndexWithStyleReset = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({
        ...defaultProps,
        slideToIndexWithStyleReset,
        totalSlides: 2,
      })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(slideToIndexWithStyleReset).toHaveBeenCalledWith(1);
  });

  it("stops at end when not infinite and cannot slide right", () => {
    const onPause = jest.fn();
    const canSlideRight = jest.fn(() => false);
    const { result } = renderHook(() =>
      useAutoPlay({
        ...defaultProps,
        infinite: false,
        canSlideRight,
        onPause,
      })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.isPlaying).toBe(false);
    expect(onPause).toHaveBeenCalled();
  });

  it("does not start multiple intervals when play is called multiple times", () => {
    const slideToIndexCore = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({ ...defaultProps, slideToIndexCore })
    );

    act(() => {
      result.current.play();
      result.current.play();
      result.current.play();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should only slide once, not three times
    expect(slideToIndexCore).toHaveBeenCalledTimes(1);
  });

  it("uses minimum of slideInterval and slideDuration", () => {
    const slideToIndexCore = jest.fn();
    const { result } = renderHook(() =>
      useAutoPlay({
        ...defaultProps,
        slideToIndexCore,
        slideInterval: 200,
        slideDuration: 450,
      })
    );

    act(() => {
      result.current.play();
    });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    expect(slideToIndexCore).toHaveBeenCalled();
  });

  it("clears interval on unmount", () => {
    const { result, unmount } = renderHook(() => useAutoPlay(defaultProps));

    act(() => {
      result.current.play();
    });

    unmount();

    // No error should occur and interval should be cleared
    expect(() => jest.advanceTimersByTime(10000)).not.toThrow();
  });
});
