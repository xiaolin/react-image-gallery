import { act, renderHook } from "@testing-library/react";
import type { GalleryItem, ThumbnailPosition } from "src/types";
import { useThumbnails } from "./useThumbnails";

describe("useThumbnails", () => {
  const createItems = (count: number): GalleryItem[] =>
    Array.from({ length: count }, (_, i) => ({
      original: `image${i}.jpg`,
      thumbnail: `thumb${i}.jpg`,
    }));

  const defaultProps: {
    currentIndex: number;
    items: GalleryItem[];
    thumbnailPosition: ThumbnailPosition;
    disableThumbnailScroll: boolean;
    slideDuration: number;
    isRTL: boolean;
    useTranslate3D: boolean;
  } = {
    currentIndex: 0,
    items: createItems(10),
    thumbnailPosition: "bottom",
    disableThumbnailScroll: false,
    slideDuration: 550,
    isRTL: false,
    useTranslate3D: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial state correctly", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    expect(result.current.thumbsTranslate).toBe(0);
    expect(result.current.thumbsSwipedTranslate).toBe(0);
    expect(result.current.isSwipingThumbnail).toBe(false);
  });

  it("isThumbnailVertical returns false for bottom position", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "bottom" })
    );
    expect(result.current.isThumbnailVertical()).toBe(false);
  });

  it("isThumbnailVertical returns false for top position", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "top" })
    );
    expect(result.current.isThumbnailVertical()).toBe(false);
  });

  it("isThumbnailVertical returns true for left position", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "left" })
    );
    expect(result.current.isThumbnailVertical()).toBe(true);
  });

  it("isThumbnailVertical returns true for right position", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "right" })
    );
    expect(result.current.isThumbnailVertical()).toBe(true);
  });

  it("setThumbsTranslate updates state", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setThumbsTranslate(-100);
    });

    expect(result.current.thumbsTranslate).toBe(-100);
  });

  it("setThumbsSwipedTranslate updates state", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setThumbsSwipedTranslate(-50);
    });

    expect(result.current.thumbsSwipedTranslate).toBe(-50);
  });

  it("setIsSwipingThumbnail updates state", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setIsSwipingThumbnail(true);
    });

    expect(result.current.isSwipingThumbnail).toBe(true);
  });

  it("setThumbsStyle updates state", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setThumbsStyle({ transition: "none" });
    });

    expect(result.current.thumbsStyle).toEqual({ transition: "none" });
  });

  it("getThumbsTranslate returns 0 when scroll is disabled", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, disableThumbnailScroll: true })
    );

    expect(result.current.getThumbsTranslate(5)).toBe(0);
  });

  it("getThumbsTranslate returns 0 when thumbnailsRef is null", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    // thumbnailsRef starts as null
    expect(result.current.getThumbsTranslate(5)).toBe(0);
  });

  it("thumbnailsWrapperRef is initialized", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    expect(result.current.thumbnailsWrapperRef).toBeDefined();
    expect(result.current.thumbnailsWrapperRef.current).toBeNull();
  });

  it("thumbnailsRef is initialized", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    expect(result.current.thumbnailsRef).toBeDefined();
    expect(result.current.thumbnailsRef.current).toBeNull();
  });

  it("getThumbnailStyle returns transform style", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    const style = result.current.getThumbnailStyle();

    expect(style).toHaveProperty("transform");
  });

  it("getThumbnailStyle uses translate3d when useTranslate3D is true", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, useTranslate3D: true })
    );

    const style = result.current.getThumbnailStyle();

    expect(style.transform).toContain("translate3d");
  });

  it("getThumbnailBarHeight returns empty object for horizontal", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "bottom" })
    );

    const height = result.current.getThumbnailBarHeight(500);

    expect(height).toEqual({});
  });

  it("getThumbnailBarHeight returns height for vertical", () => {
    const { result } = renderHook(() =>
      useThumbnails({ ...defaultProps, thumbnailPosition: "left" })
    );

    const height = result.current.getThumbnailBarHeight(500);

    expect(height).toHaveProperty("height");
  });

  it("slideThumbnailBar does not update when swiping", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setIsSwipingThumbnail(true);
      result.current.setThumbsTranslate(-100);
    });

    const translateBefore = result.current.thumbsTranslate;

    act(() => {
      result.current.slideThumbnailBar();
    });

    expect(result.current.thumbsTranslate).toBe(translateBefore);
  });

  it("resetSwipingThumbnail sets isSwipingThumbnail to false", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setIsSwipingThumbnail(true);
    });

    expect(result.current.isSwipingThumbnail).toBe(true);

    act(() => {
      result.current.resetSwipingThumbnail();
    });

    expect(result.current.isSwipingThumbnail).toBe(false);
  });

  it("handleThumbnailSwipeEnd syncs swiped translate and sets swiping state", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    act(() => {
      result.current.setThumbsTranslate(-100);
    });

    act(() => {
      result.current.handleThumbnailSwipeEnd();
    });

    // handleThumbnailSwipeEnd syncs thumbsSwipedTranslate with thumbsTranslate
    expect(result.current.thumbsSwipedTranslate).toBe(-100);
    expect(result.current.isSwipingThumbnail).toBe(true);
  });

  it("updates translation when currentIndex changes", () => {
    const { result, rerender } = renderHook((props) => useThumbnails(props), {
      initialProps: defaultProps,
    });

    const _initialTranslate = result.current.thumbsTranslate;

    // Rerender with different currentIndex
    rerender({ ...defaultProps, currentIndex: 5 });

    // After effect runs, slideThumbnailBar should be called
    // Since refs are null, translate stays 0, but style should update
    expect(result.current.thumbsStyle).toHaveProperty("transition");
  });

  it("resets transforms when thumbnail position changes", () => {
    jest.useFakeTimers();

    const { result, rerender } = renderHook(
      (props: typeof defaultProps) => useThumbnails(props),
      { initialProps: defaultProps }
    );

    act(() => {
      result.current.setThumbsTranslate(-100);
    });

    rerender({ ...defaultProps, thumbnailPosition: "left" });

    // After position change, transforms are reset
    expect(result.current.thumbsTranslate).toBe(0);
    expect(result.current.thumbsSwipedTranslate).toBe(0);

    jest.useRealTimers();
  });

  it("thumbnailsWrapperWidth starts at 0", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    expect(result.current.thumbnailsWrapperWidth).toBe(0);
  });

  it("thumbnailsWrapperHeight starts at 0", () => {
    const { result } = renderHook(() => useThumbnails(defaultProps));

    expect(result.current.thumbnailsWrapperHeight).toBe(0);
  });

  describe("ResizeObserver behavior", () => {
    it("initResizeObserver creates and observes element", () => {
      const mockObserve = jest.fn();
      const mockUnobserve = jest.fn();
      const mockResizeObserver = jest.fn().mockImplementation(() => ({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: jest.fn(),
      }));
      window.ResizeObserver = mockResizeObserver;

      const { result } = renderHook(() => useThumbnails(defaultProps));

      const mockElement = document.createElement("div");
      const mockRef = { current: mockElement };

      act(() => {
        result.current.initResizeObserver(mockRef);
      });

      expect(mockResizeObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith(mockElement);
    });

    it("removeResizeObserver cleans up observer", () => {
      const mockObserve = jest.fn();
      const mockUnobserve = jest.fn();
      const mockResizeObserver = jest.fn().mockImplementation(() => ({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: jest.fn(),
      }));
      window.ResizeObserver = mockResizeObserver;

      const { result } = renderHook(() => useThumbnails(defaultProps));

      // Set up the wrapper ref to have an element
      const mockElement = document.createElement("div");
      Object.defineProperty(result.current.thumbnailsWrapperRef, "current", {
        value: mockElement,
        writable: true,
      });

      // Initialize the observer first
      act(() => {
        result.current.initResizeObserver(result.current.thumbnailsWrapperRef);
      });

      // Now remove it
      act(() => {
        result.current.removeResizeObserver();
      });

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });
  });

  describe("swipe state management", () => {
    it("does not reset translate when only isSwipingThumbnail changes (not dimensions)", () => {
      // This test ensures the fix for thumbnail swipe position resetting is maintained
      // The bug was: when isSwipingThumbnail changed from true to false,
      // the resize-effect would run and reset thumbsTranslate to index-based position
      const { result } = renderHook(() => useThumbnails(defaultProps));

      // Simulate a swipe by setting translate and swiping state
      act(() => {
        result.current.setThumbsTranslate(-150);
        result.current.setThumbsSwipedTranslate(-150);
        result.current.setIsSwipingThumbnail(true);
      });

      expect(result.current.thumbsTranslate).toBe(-150);
      expect(result.current.isSwipingThumbnail).toBe(true);

      // Now simulate swipe ending by setting isSwipingThumbnail to false
      act(() => {
        result.current.setIsSwipingThumbnail(false);
      });

      // The translate should NOT be reset just because isSwipingThumbnail changed
      // (dimensions haven't changed, so the resize-effect should not reset position)
      expect(result.current.thumbsTranslate).toBe(-150);
      expect(result.current.thumbsSwipedTranslate).toBe(-150);
    });

    it("allows setting translate values while swiping", () => {
      const { result } = renderHook(() => useThumbnails(defaultProps));

      // Start swiping
      act(() => {
        result.current.setIsSwipingThumbnail(true);
        result.current.setThumbsStyle({ transition: "none" });
      });

      // Update translate during swipe
      act(() => {
        result.current.setThumbsTranslate(-50);
      });
      expect(result.current.thumbsTranslate).toBe(-50);

      act(() => {
        result.current.setThumbsTranslate(-100);
      });
      expect(result.current.thumbsTranslate).toBe(-100);

      act(() => {
        result.current.setThumbsTranslate(-150);
      });
      expect(result.current.thumbsTranslate).toBe(-150);
    });

    it("preserves swiped position after multiple swipe cycles", () => {
      const { result } = renderHook(() => useThumbnails(defaultProps));

      // First swipe cycle
      act(() => {
        result.current.setIsSwipingThumbnail(true);
        result.current.setThumbsTranslate(-100);
      });
      act(() => {
        result.current.setThumbsSwipedTranslate(-100);
        result.current.setIsSwipingThumbnail(false);
      });
      expect(result.current.thumbsTranslate).toBe(-100);

      // Second swipe cycle (should start from previous position)
      act(() => {
        result.current.setIsSwipingThumbnail(true);
        result.current.setThumbsTranslate(-200);
      });
      act(() => {
        result.current.setThumbsSwipedTranslate(-200);
        result.current.setIsSwipingThumbnail(false);
      });
      expect(result.current.thumbsTranslate).toBe(-200);
    });
  });
});
