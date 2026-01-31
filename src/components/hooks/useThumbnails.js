import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "src/components/utils/debounce";

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
}) {
  const [thumbsTranslate, setThumbsTranslate] = useState(0);
  const [thumbsSwipedTranslate, setThumbsSwipedTranslate] = useState(0);
  const [thumbsStyle, setThumbsStyle] = useState({
    transition: `all ${slideDuration}ms ease-out`,
  });
  const [thumbnailsWrapperWidth, setThumbnailsWrapperWidth] = useState(0);
  const [thumbnailsWrapperHeight, setThumbnailsWrapperHeight] = useState(0);
  const [isSwipingThumbnail, setIsSwipingThumbnail] = useState(false);

  const thumbnailsWrapperRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const previousIndexRef = useRef(currentIndex);

  const isThumbnailVertical = useCallback(() => {
    return thumbnailPosition === "left" || thumbnailPosition === "right";
  }, [thumbnailPosition]);

  // Calculate thumbnail translation based on current index
  const getThumbsTranslate = useCallback(
    (indexDifference) => {
      if (disableThumbnailScroll) return 0;

      const thumbsElement = thumbnailsRef.current;
      if (!thumbsElement) return 0;

      let hiddenScroll;
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
  }, [
    currentIndex,
    getThumbsTranslate,
    isSwipingThumbnail,
    slideDuration,
    setThumbsStyle,
  ]);

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
      // First rAF: browser schedules next paint
      // Second rAF: layout has been calculated
      // setTimeout: ensure React state updates have flushed
      const recalculatePosition = () => {
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

        let hiddenScroll;
        if (isVertical) {
          if (thumbsElement.scrollHeight <= newWrapperHeight) {
            // No scrolling needed, just restore transition
            setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
            return;
          }
          hiddenScroll = thumbsElement.scrollHeight - newWrapperHeight;
        } else {
          if (thumbsElement.scrollWidth <= newWrapperWidth) {
            // No scrolling needed, just restore transition
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
        // Use rAF to ensure the translate is applied before enabling transition
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
  const getThumbnailStyle = useCallback(() => {
    const verticalTranslateValue = isRTL
      ? thumbsTranslate * -1
      : thumbsTranslate;
    let translate;

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
    };
  }, [
    thumbsTranslate,
    thumbsStyle,
    isRTL,
    useTranslate3D,
    isThumbnailVertical,
  ]);

  // Get thumbnail bar height for vertical layouts
  const getThumbnailBarHeight = useCallback(
    (gallerySlideWrapperHeight) => {
      if (isThumbnailVertical()) {
        return { height: gallerySlideWrapperHeight };
      }
      return {};
    },
    [isThumbnailVertical]
  );

  // Initialize resize observer for thumbnail wrapper
  const initResizeObserver = useCallback((element) => {
    if (!element?.current) return;

    resizeObserverRef.current = new ResizeObserver(
      debounce((entries) => {
        if (!entries) return;
        entries.forEach((entry) => {
          setThumbnailsWrapperWidth(entry.contentRect.width);
          setThumbnailsWrapperHeight(entry.contentRect.height);
        });
      }, 50)
    );

    resizeObserverRef.current.observe(element.current);
  }, []);

  // Clean up resize observer
  const removeResizeObserver = useCallback(() => {
    if (resizeObserverRef.current && thumbnailsWrapperRef.current) {
      resizeObserverRef.current.unobserve(thumbnailsWrapperRef.current);
      resizeObserverRef.current = null;
    }
  }, []);

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
