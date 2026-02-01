import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import debounce from "src/components/utils/debounce";
import type { GalleryItem, ThumbnailPosition } from "src/types";

interface UseThumbnailsProps {
  currentIndex: number;
  items: GalleryItem[];
  thumbnailPosition?: ThumbnailPosition;
  disableThumbnailScroll?: boolean;
  slideDuration?: number;
  isRTL?: boolean;
  useTranslate3D?: boolean;
}

interface UseThumbnailsReturn {
  thumbsTranslate: number;
  setThumbsTranslate: (value: number) => void;
  thumbsSwipedTranslate: number;
  setThumbsSwipedTranslate: (value: number) => void;
  thumbsStyle: CSSProperties;
  setThumbsStyle: (style: CSSProperties) => void;
  thumbnailsWrapperWidth: number;
  thumbnailsWrapperHeight: number;
  isSwipingThumbnail: boolean;
  setIsSwipingThumbnail: (value: boolean) => void;
  thumbnailsWrapperRef: RefObject<HTMLDivElement | null>;
  thumbnailsRef: RefObject<HTMLDivElement | null>;
  isThumbnailVertical: () => boolean;
  getThumbsTranslate: (indexDifference: number) => number;
  getThumbnailStyle: () => CSSProperties;
  getThumbnailBarHeight: (gallerySlideWrapperHeight: number) => {
    height?: number;
  };
  slideThumbnailBar: () => void;
  initResizeObserver: (element: RefObject<HTMLElement | null>) => void;
  removeResizeObserver: () => void;
  handleThumbnailSwipeEnd: () => void;
  resetSwipingThumbnail: () => void;
}

/**
 * Custom hook for managing thumbnail bar state and navigation
 */
export function useThumbnails({
  currentIndex,
  items,
  thumbnailPosition = "bottom",
  disableThumbnailScroll = false,
  slideDuration = 450,
  isRTL = false,
  useTranslate3D = true,
}: UseThumbnailsProps): UseThumbnailsReturn {
  const [thumbsTranslate, setThumbsTranslate] = useState(0);
  const [thumbsSwipedTranslate, setThumbsSwipedTranslate] = useState(0);
  const [thumbsStyle, setThumbsStyle] = useState<CSSProperties>({
    transition: `all ${slideDuration}ms ease-out`,
  });
  const [thumbnailsWrapperWidth, setThumbnailsWrapperWidth] = useState(0);
  const [thumbnailsWrapperHeight, setThumbnailsWrapperHeight] = useState(0);
  const [isSwipingThumbnail, setIsSwipingThumbnail] = useState(false);

  const thumbnailsWrapperRef = useRef<HTMLDivElement | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const previousIndexRef = useRef(currentIndex);

  const isThumbnailVertical = useCallback(() => {
    return thumbnailPosition === "left" || thumbnailPosition === "right";
  }, [thumbnailPosition]);

  // Calculate thumbnail translation based on current index
  const getThumbsTranslate = useCallback(
    (indexDifference: number): number => {
      if (disableThumbnailScroll) return 0;

      const thumbsElement = thumbnailsRef.current;
      if (!thumbsElement) return 0;

      let hiddenScroll: number;
      const isVertical = isThumbnailVertical();

      if (isVertical) {
        if (thumbsElement.scrollHeight <= thumbnailsWrapperHeight) {
          return 0;
        }
        hiddenScroll = thumbsElement.scrollHeight - thumbnailsWrapperHeight;
      } else {
        if (
          thumbsElement.scrollWidth <= thumbnailsWrapperWidth ||
          thumbnailsWrapperWidth <= 0
        ) {
          return 0;
        }
        hiddenScroll = thumbsElement.scrollWidth - thumbnailsWrapperWidth;
      }

      const perIndexScroll = hiddenScroll / (items.length - 1);
      return indexDifference * perIndexScroll;
    },
    [
      disableThumbnailScroll,
      items.length,
      thumbnailsWrapperWidth,
      thumbnailsWrapperHeight,
      isThumbnailVertical,
    ]
  );

  // Update thumbnail position when current index changes
  const slideThumbnailBar = useCallback(() => {
    if (isSwipingThumbnail) return;

    const nextTranslate = -getThumbsTranslate(currentIndex);

    // Restore transition for smooth auto-scroll when slide changes
    setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });

    if (currentIndex === 0) {
      setThumbsTranslate(0);
      setThumbsSwipedTranslate(0);
    } else {
      setThumbsTranslate(nextTranslate);
      setThumbsSwipedTranslate(nextTranslate);
    }
  }, [currentIndex, getThumbsTranslate, isSwipingThumbnail, slideDuration]);

  // Slide thumbnail bar only when currentIndex actually changes (not on other re-renders)
  useEffect(() => {
    if (previousIndexRef.current !== currentIndex) {
      previousIndexRef.current = currentIndex;
      slideThumbnailBar();
    }
  }, [currentIndex, slideThumbnailBar]);

  // Reset transform when thumbnail position changes
  // Force re-read dimensions from DOM since orientation changed
  const previousPositionRef = useRef(thumbnailPosition);
  useEffect(() => {
    if (previousPositionRef.current !== thumbnailPosition) {
      previousPositionRef.current = thumbnailPosition;

      // Reset transforms immediately (no transition during position change)
      setThumbsStyle({ transition: "none" });
      setThumbsTranslate(0);
      setThumbsSwipedTranslate(0);

      // Use multiple rAF frames to ensure layout is complete
      const recalculatePosition = (): void => {
        if (!thumbnailsWrapperRef.current || !thumbnailsRef.current) return;

        const wrapperRect =
          thumbnailsWrapperRef.current.getBoundingClientRect();
        const newWrapperWidth = wrapperRect.width;
        const newWrapperHeight = wrapperRect.height;

        setThumbnailsWrapperWidth(newWrapperWidth);
        setThumbnailsWrapperHeight(newWrapperHeight);

        // Calculate new translate for current index using fresh dimensions
        const isVertical =
          thumbnailPosition === "left" || thumbnailPosition === "right";
        const thumbsElement = thumbnailsRef.current;

        let hiddenScroll: number;
        if (isVertical) {
          if (thumbsElement.scrollHeight <= newWrapperHeight) {
            setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
            return;
          }
          hiddenScroll = thumbsElement.scrollHeight - newWrapperHeight;
        } else {
          if (thumbsElement.scrollWidth <= newWrapperWidth) {
            setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
            return;
          }
          hiddenScroll = thumbsElement.scrollWidth - newWrapperWidth;
        }

        const perIndexScroll = hiddenScroll / (items.length - 1);
        const newTranslate = -(currentIndex * perIndexScroll);

        setThumbsTranslate(newTranslate);
        setThumbsSwipedTranslate(newTranslate);

        // Restore smooth transition for future movements
        requestAnimationFrame(() => {
          setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
        });
      };

      // Wait for layout to settle with multiple frames
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(recalculatePosition, 100);
        });
      });
    }
  }, [thumbnailPosition, currentIndex, items.length, slideDuration]);

  // Get thumbnail container style
  const getThumbnailStyle = useCallback((): CSSProperties => {
    const verticalTranslateValue = isRTL
      ? thumbsTranslate * -1
      : thumbsTranslate;
    let translate: string;

    if (isThumbnailVertical()) {
      translate = useTranslate3D
        ? `translate3d(0, ${thumbsTranslate}px, 0)`
        : `translate(0, ${thumbsTranslate}px)`;
    } else {
      translate = useTranslate3D
        ? `translate3d(${verticalTranslateValue}px, 0, 0)`
        : `translate(${verticalTranslateValue}px, 0)`;
    }

    return {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate,
      ...thumbsStyle,
    } as CSSProperties;
  }, [
    thumbsTranslate,
    thumbsStyle,
    isRTL,
    useTranslate3D,
    isThumbnailVertical,
  ]);

  // Get thumbnail bar height for vertical layouts
  const getThumbnailBarHeight = useCallback(
    (gallerySlideWrapperHeight: number): { height?: number } => {
      if (isThumbnailVertical()) {
        return { height: gallerySlideWrapperHeight };
      }
      return {};
    },
    [isThumbnailVertical]
  );

  // Initialize resize observer for thumbnail wrapper
  const initResizeObserver = useCallback(
    (element: RefObject<HTMLElement | null>) => {
      if (!element?.current) return;

      resizeObserverRef.current = new ResizeObserver(
        debounce((entries: ResizeObserverEntry[]) => {
          if (!entries) return;
          entries.forEach((entry) => {
            setThumbnailsWrapperWidth(entry.contentRect.width);
            setThumbnailsWrapperHeight(entry.contentRect.height);
          });
        }, 50)
      );

      resizeObserverRef.current.observe(element.current);
    },
    []
  );

  // Clean up resize observer
  const removeResizeObserver = useCallback(() => {
    if (resizeObserverRef.current && thumbnailsWrapperRef.current) {
      resizeObserverRef.current.unobserve(thumbnailsWrapperRef.current);
      resizeObserverRef.current = null;
    }
  }, []);

  // Recalculate thumbnail position when wrapper dimensions change (window resize)
  // Use a ref to track the previous dimensions to only react to actual size changes
  const prevDimensionsRef = useRef({ width: 0, height: 0 });
  useEffect(() => {
    // Skip if dimensions are 0 (not yet measured)
    if (thumbnailsWrapperWidth === 0 && thumbnailsWrapperHeight === 0) return;

    // Only recalculate if dimensions actually changed (not just on isSwipingThumbnail change)
    const dimensionsChanged =
      prevDimensionsRef.current.width !== thumbnailsWrapperWidth ||
      prevDimensionsRef.current.height !== thumbnailsWrapperHeight;

    if (!dimensionsChanged) return;

    prevDimensionsRef.current = {
      width: thumbnailsWrapperWidth,
      height: thumbnailsWrapperHeight,
    };

    // Only recalculate if not currently swiping
    if (isSwipingThumbnail) return;

    const thumbsElement = thumbnailsRef.current;
    if (!thumbsElement) return;

    const isVertical = isThumbnailVertical();
    let hiddenScroll: number;

    if (isVertical) {
      if (thumbsElement.scrollHeight <= thumbnailsWrapperHeight) {
        setThumbsTranslate(0);
        setThumbsSwipedTranslate(0);
        return;
      }
      hiddenScroll = thumbsElement.scrollHeight - thumbnailsWrapperHeight;
    } else {
      if (thumbsElement.scrollWidth <= thumbnailsWrapperWidth) {
        setThumbsTranslate(0);
        setThumbsSwipedTranslate(0);
        return;
      }
      hiddenScroll = thumbsElement.scrollWidth - thumbnailsWrapperWidth;
    }

    const perIndexScroll = hiddenScroll / (items.length - 1);
    const newTranslate = -(currentIndex * perIndexScroll);

    setThumbsTranslate(newTranslate);
    setThumbsSwipedTranslate(newTranslate);
  }, [
    thumbnailsWrapperWidth,
    thumbnailsWrapperHeight,
    currentIndex,
    items.length,
    isSwipingThumbnail,
    isThumbnailVertical,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      removeResizeObserver();
    };
  }, [removeResizeObserver]);

  // Handle thumbnail swipe end
  const handleThumbnailSwipeEnd = useCallback(() => {
    setIsSwipingThumbnail(true);
    setThumbsSwipedTranslate(thumbsTranslate);
    setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
  }, [thumbsTranslate, slideDuration]);

  // Reset swiping state
  const resetSwipingThumbnail = useCallback(() => {
    setIsSwipingThumbnail(false);
  }, []);

  return {
    thumbsTranslate,
    setThumbsTranslate,
    thumbsSwipedTranslate,
    setThumbsSwipedTranslate,
    thumbsStyle,
    setThumbsStyle,
    thumbnailsWrapperWidth,
    thumbnailsWrapperHeight,
    isSwipingThumbnail,
    setIsSwipingThumbnail,
    thumbnailsWrapperRef,
    thumbnailsRef,
    isThumbnailVertical,
    getThumbsTranslate,
    getThumbnailStyle,
    getThumbnailBarHeight,
    slideThumbnailBar,
    initResizeObserver,
    removeResizeObserver,
    handleThumbnailSwipeEnd,
    resetSwipingThumbnail,
  };
}

export default useThumbnails;
