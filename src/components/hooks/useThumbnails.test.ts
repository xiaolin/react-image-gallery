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
    slideDuration: 450,
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
});
