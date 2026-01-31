import type { RefObject } from "react";
import { act, renderHook } from "@testing-library/react";
import { useFullscreen } from "./useFullscreen";

describe("useFullscreen", () => {
  const createGalleryRef = (): RefObject<HTMLDivElement | null> => ({
    current: document.createElement("div"),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns isFullscreen as false initially", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );
    expect(result.current.isFullscreen).toBe(false);
  });

  it("returns modalFullscreen as false initially", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );
    expect(result.current.modalFullscreen).toBe(false);
  });

  it("sets isFullscreen to true when fullScreen is called", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );

    act(() => {
      result.current.fullScreen();
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it("sets isFullscreen to false when exitFullScreen is called", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );

    act(() => {
      result.current.fullScreen();
    });

    act(() => {
      result.current.exitFullScreen();
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it("toggles fullscreen state", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );

    act(() => {
      result.current.toggleFullScreen();
    });
    expect(result.current.isFullscreen).toBe(true);

    act(() => {
      result.current.toggleFullScreen();
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it("uses modal fullscreen when useBrowserFullscreen is false", () => {
    const onScreenChange = jest.fn();
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({
        useBrowserFullscreen: false,
        onScreenChange,
        galleryRef,
      })
    );

    act(() => {
      result.current.fullScreen();
    });

    expect(result.current.isFullscreen).toBe(true);
    expect(result.current.modalFullscreen).toBe(true);
    expect(onScreenChange).toHaveBeenCalledWith(true);
  });

  it("calls onScreenChange with false when exiting modal fullscreen", () => {
    const onScreenChange = jest.fn();
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({
        useBrowserFullscreen: false,
        onScreenChange,
        galleryRef,
      })
    );

    act(() => {
      result.current.fullScreen();
    });

    act(() => {
      result.current.exitFullScreen();
    });

    expect(onScreenChange).toHaveBeenLastCalledWith(false);
    expect(result.current.modalFullscreen).toBe(false);
  });

  it("does nothing when exitFullScreen is called but not fullscreen", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );

    act(() => {
      result.current.exitFullScreen();
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it("does nothing when galleryRef is null", () => {
    const nullRef: RefObject<HTMLDivElement | null> = { current: null };
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef: nullRef })
    );

    act(() => {
      result.current.fullScreen();
    });

    // Should not throw and state should remain unchanged
    expect(result.current.isFullscreen).toBe(false);
  });

  it("handleScreenChange detects when gallery is fullscreen element", () => {
    const onScreenChange = jest.fn();
    const galleryRef = createGalleryRef();

    // Mock fullscreenElement to match gallery element
    Object.defineProperty(document, "fullscreenElement", {
      value: galleryRef.current,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, onScreenChange, galleryRef })
    );

    act(() => {
      result.current.handleScreenChange();
    });

    expect(onScreenChange).toHaveBeenCalledWith(true);

    // Cleanup
    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  it("handleScreenChange detects when gallery is not fullscreen element", () => {
    const onScreenChange = jest.fn();
    const galleryRef = createGalleryRef();

    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, onScreenChange, galleryRef })
    );

    act(() => {
      result.current.handleScreenChange();
    });

    expect(onScreenChange).toHaveBeenCalledWith(false);
  });

  it("returns all expected functions and values", () => {
    const galleryRef = createGalleryRef();
    const { result } = renderHook(() =>
      useFullscreen({ useBrowserFullscreen: true, galleryRef })
    );

    expect(result.current).toHaveProperty("isFullscreen");
    expect(result.current).toHaveProperty("modalFullscreen");
    expect(result.current).toHaveProperty("fullScreen");
    expect(result.current).toHaveProperty("exitFullScreen");
    expect(result.current).toHaveProperty("toggleFullScreen");
    expect(result.current).toHaveProperty("handleScreenChange");
    expect(typeof result.current.fullScreen).toBe("function");
    expect(typeof result.current.exitFullScreen).toBe("function");
    expect(typeof result.current.toggleFullScreen).toBe("function");
    expect(typeof result.current.handleScreenChange).toBe("function");
  });
});
