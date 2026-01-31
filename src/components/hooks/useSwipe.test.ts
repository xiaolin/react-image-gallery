import { act, renderHook } from "@testing-library/react";
import { DOWN, LEFT, RIGHT, UP } from "react-swipeable";
import type { SwipeEventData } from "react-swipeable";
import { useSwipe } from "./useSwipe";

describe("useSwipe", () => {
  const defaultProps = {
    disableSwipe: false,
    stopPropagation: false,
    swipeThreshold: 30,
    swipingTransitionDuration: 0,
    flickThreshold: 0.4,
    slideVertically: false,
    isRTL: false,
    galleryWidth: 1000,
    galleryHeight: 500,
    isTransitioning: false,
    canSlideLeft: jest.fn(() => true),
    canSlideRight: jest.fn(() => true),
    slideToIndex: jest.fn(),
    currentIndex: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial state correctly", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    expect(result.current.currentSlideOffset).toBe(0);
    expect(result.current.swipingUpDown).toBe(false);
    expect(result.current.swipingLeftRight).toBe(false);
  });

  it("handleSwiping updates offset for left swipe", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBeLessThan(0);
  });

  it("handleSwiping updates offset for right swipe", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: RIGHT,
      deltaX: 100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBeGreaterThan(0);
  });

  it("does not handle swipe when disableSwipe is true", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, disableSwipe: true })
    );

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBe(0);
  });

  it("does not update offset when transitioning", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, isTransitioning: true })
    );

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBe(0);
  });

  it("handleOnSwiped calls slideToIndex for sufficient swipe", () => {
    const slideToIndex = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideToIndex })
    );

    // First swipe enough to trigger
    const swipingData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipingData);
    });

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: false,
      event: new MouseEvent("mouseup") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleOnSwiped(swipeData);
    });

    expect(slideToIndex).toHaveBeenCalled();
  });

  it("handleOnSwiped triggers slide on flick even with small swipe", () => {
    const slideToIndex = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideToIndex, flickThreshold: 0.4 })
    );

    const swipeData: SwipeEventData = {
      absX: 10,
      absY: 0,
      dir: LEFT,
      deltaX: -10,
      deltaY: 0,
      velocity: 0.8, // High velocity = flick
      vxvy: [0.8, 0],
      initial: [0, 0],
      first: false,
      event: new MouseEvent("mouseup") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleOnSwiped(swipeData);
    });

    expect(slideToIndex).toHaveBeenCalledWith(1);
  });

  it("swipes in opposite direction in RTL mode", () => {
    const slideToIndex = jest.fn();
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideToIndex, isRTL: true })
    );

    const swipingData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipingData);
    });

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: false,
      event: new MouseEvent("mouseup") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleOnSwiped(swipeData);
    });

    // In RTL, left swipe goes to previous (index -1)
    expect(slideToIndex).toHaveBeenCalledWith(-1);
  });

  it("handles vertical swipe when slideVertically is true", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideVertically: true })
    );

    const swipeData: SwipeEventData = {
      absX: 0,
      absY: 100,
      dir: UP,
      deltaX: 0,
      deltaY: -100,
      velocity: 0.5,
      vxvy: [0, 0.5],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBeLessThan(0);
  });

  it("handles down swipe when slideVertically is true", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideVertically: true })
    );

    const swipeData: SwipeEventData = {
      absX: 0,
      absY: 100,
      dir: DOWN,
      deltaX: 0,
      deltaY: 100,
      velocity: 0.5,
      vxvy: [0, 0.5],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBeGreaterThan(0);
  });

  it("ignores horizontal swipe when slideVertically is true", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideVertically: true })
    );

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: LEFT,
      deltaX: -100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.currentSlideOffset).toBe(0);
  });

  it("locks to up/down direction when started vertically", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    const verticalSwipe: SwipeEventData = {
      absX: 0,
      absY: 50,
      dir: UP,
      deltaX: 0,
      deltaY: -50,
      velocity: 0.3,
      vxvy: [0, 0.3],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(verticalSwipe);
    });

    expect(result.current.swipingUpDown).toBe(true);
  });

  it("locks to left/right direction when started horizontally", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    const horizontalSwipe: SwipeEventData = {
      absX: 50,
      absY: 0,
      dir: LEFT,
      deltaX: -50,
      deltaY: 0,
      velocity: 0.3,
      vxvy: [0.3, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(horizontalSwipe);
    });

    expect(result.current.swipingLeftRight).toBe(true);
  });

  it("resetSwipingDirection clears swiping state", () => {
    const { result } = renderHook(() => useSwipe(defaultProps));

    const swipeData: SwipeEventData = {
      absX: 50,
      absY: 0,
      dir: LEFT,
      deltaX: -50,
      deltaY: 0,
      velocity: 0.3,
      vxvy: [0.3, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(result.current.swipingLeftRight).toBe(true);

    act(() => {
      result.current.resetSwipingDirection();
    });

    expect(result.current.swipingLeftRight).toBe(false);
  });

  it("does not slide when canSlideLeft returns false", () => {
    const slideToIndex = jest.fn();
    const canSlideLeft = jest.fn(() => false);
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, slideToIndex, canSlideLeft, currentIndex: 0 })
    );

    const swipingData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: RIGHT,
      deltaX: 100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipingData);
    });

    const swipeData: SwipeEventData = {
      absX: 100,
      absY: 0,
      dir: RIGHT,
      deltaX: 100,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: false,
      event: new MouseEvent("mouseup") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleOnSwiped(swipeData);
    });

    // Should slide to current index (no change)
    expect(slideToIndex).toHaveBeenCalledWith(0);
  });

  it("caps slide offset at 100%", () => {
    const { result } = renderHook(() =>
      useSwipe({ ...defaultProps, galleryWidth: 100 })
    );

    const swipeData: SwipeEventData = {
      absX: 200, // More than gallery width
      absY: 0,
      dir: LEFT,
      deltaX: -200,
      deltaY: 0,
      velocity: 0.5,
      vxvy: [0.5, 0],
      initial: [0, 0],
      first: true,
      event: new MouseEvent("mousemove") as unknown as TouchEvent,
    };

    act(() => {
      result.current.handleSwiping(swipeData);
    });

    expect(Math.abs(result.current.currentSlideOffset)).toBeLessThanOrEqual(
      100
    );
  });
});
