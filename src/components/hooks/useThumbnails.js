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

    if (currentIndex === 0) {
      setThumbsTranslate(0);
      setThumbsSwipedTranslate(0);
    } else {
      setThumbsTranslate(nextTranslate);
      setThumbsSwipedTranslate(nextTranslate);
    }
  }, [currentIndex, getThumbsTranslate, isSwipingThumbnail]);

  // Slide thumbnail bar when currentIndex changes
  useEffect(() => {
    slideThumbnailBar();
  }, [currentIndex, slideThumbnailBar]);

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
