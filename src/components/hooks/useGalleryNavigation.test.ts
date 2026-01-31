import { renderHook } from "@testing-library/react";
import type { GalleryItem } from "src/types";
import { useGalleryNavigation } from "./useGalleryNavigation";

describe("useGalleryNavigation", () => {
  const items: GalleryItem[] = [
    { original: "image0.jpg", thumbnail: "thumb0.jpg" },
    { original: "image1.jpg", thumbnail: "thumb1.jpg" },
    { original: "image2.jpg", thumbnail: "thumb2.jpg" },
    { original: "image3.jpg", thumbnail: "thumb3.jpg" },
    { original: "image4.jpg", thumbnail: "thumb4.jpg" },
  ];

  const singleItem: GalleryItem[] = [
    { original: "image0.jpg", thumbnail: "thumb0.jpg" },
  ];

  it("returns correct initial state", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canSlide).toBe(true);
    expect(result.current.isTransitioning).toBe(false);
  });

  it("returns correct startIndex when provided", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 2, infinite: true })
    );
    expect(result.current.currentIndex).toBe(2);
  });

  it("canSlide is false when there is only 1 item", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items: singleItem, startIndex: 0, infinite: true })
    );
    expect(result.current.canSlide).toBe(false);
  });

  it("canSlideLeft/Right return true in infinite mode", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    expect(result.current.canSlideLeft()).toBe(true);
    expect(result.current.canSlideRight()).toBe(true);
  });

  it("canSlideLeft returns false at first slide when not infinite", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: false })
    );
    expect(result.current.canSlideLeft()).toBe(false);
    expect(result.current.canSlideRight()).toBe(true);
  });

  it("canSlideRight returns false at last slide when not infinite", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 4, infinite: false })
    );
    expect(result.current.canSlideLeft()).toBe(true);
    expect(result.current.canSlideRight()).toBe(false);
  });

  it("canSlidePrevious returns false at index 0", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    expect(result.current.canSlidePrevious()).toBe(false);
  });

  it("canSlideNext returns false at last index", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 4, infinite: true })
    );
    expect(result.current.canSlideNext()).toBe(false);
  });

  it("totalDisplaySlides accounts for clones in infinite mode", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    expect(result.current.totalDisplaySlides).toBe(7);
  });

  it("totalDisplaySlides equals items length in non-infinite mode", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: false })
    );
    expect(result.current.totalDisplaySlides).toBe(5);
  });

  it("getContainerStyle returns transform style", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    const style = result.current.getContainerStyle();
    expect(style).toHaveProperty("transform");
  });

  it("getExtendedSlides returns items with clones for infinite mode", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: true })
    );
    const { extendedItems } = result.current.getExtendedSlides();
    expect(extendedItems.length).toBe(7);
  });

  it("getExtendedSlides returns original items for non-infinite mode", () => {
    const { result } = renderHook(() =>
      useGalleryNavigation({ items, startIndex: 0, infinite: false })
    );
    const { extendedItems } = result.current.getExtendedSlides();
    expect(extendedItems.length).toBe(5);
  });
});
