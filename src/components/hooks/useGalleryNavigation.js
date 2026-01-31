import { useCallback, useEffect, useRef, useState } from "react";
import throttle from "src/components/utils/throttle";

/**
 * Custom hook for gallery navigation using flex container approach
 *
 * Uses a single container transform with all slides always in DOM.
 * For infinite mode, clones first/last slides and instantly jumps when hitting clones.
 * This eliminates the white flash caused by display:none destroying GPU layers.
 *
 * Flex approach: [clone-last, slide0, slide1, ..., slideN, clone-first]
 * Display index includes clones, currentIndex is the real slide index.
 */
export function useGalleryNavigation({
  items,
  startIndex = 0,
  infinite = true,
  isRTL = false,
  slideDuration = 450,
  onSlide,
  onBeforeSlide,
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [previousIndex, setPreviousIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSlideOffset, setCurrentSlideOffset] = useState(0);
  // For flex approach, we track the container's display position
  // In infinite mode: displayIndex = currentIndex + 1 (because of leading clone)
  const [displayIndex, setDisplayIndex] = useState(
    infinite && items.length > 1 ? startIndex + 1 : startIndex
  );
  const [slideStyle, setSlideStyle] = useState({
    transition: `all ${slideDuration}ms ease-out`,
  });

  const transitionTimerRef = useRef(null);
  const jumpTimerRef = useRef(null);
  const isJumpingRef = useRef(false);

  const totalSlides = items.length;
  const canSlide = totalSlides >= 2;
  // In infinite mode, we have 2 extra clone slides
  const totalDisplaySlides =
    infinite && totalSlides > 1 ? totalSlides + 2 : totalSlides;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (jumpTimerRef.current) {
        window.clearTimeout(jumpTimerRef.current);
      }
    };
  }, []);

  // Reset index when items change
  useEffect(() => {
    setCurrentIndex(startIndex);
    setDisplayIndex(infinite && items.length > 1 ? startIndex + 1 : startIndex);
    setSlideStyle({ transition: "none" });
  }, [items, startIndex, infinite]);

  const canSlidePrevious = useCallback(() => {
    return currentIndex > 0;
  }, [currentIndex]);

  const canSlideNext = useCallback(() => {
    return currentIndex < totalSlides - 1;
  }, [currentIndex, totalSlides]);

  const canSlideLeft = useCallback(() => {
    return infinite || (isRTL ? canSlideNext() : canSlidePrevious());
  }, [infinite, isRTL, canSlideNext, canSlidePrevious]);

  const canSlideRight = useCallback(() => {
    return infinite || (isRTL ? canSlidePrevious() : canSlideNext());
  }, [infinite, isRTL, canSlideNext, canSlidePrevious]);

  const onSliding = useCallback(() => {
    transitionTimerRef.current = window.setTimeout(() => {
      if (isTransitioning) {
        setIsTransitioning(false);
        if (onSlide) {
          onSlide(currentIndex);
        }
      }
    }, slideDuration + 50);
  }, [isTransitioning, currentIndex, slideDuration, onSlide]);

  /**
   * Convert real slide index to display index (accounting for clone offset)
   */
  const realToDisplayIndex = useCallback(
    (realIndex) => {
      if (infinite && totalSlides > 1) {
        return realIndex + 1; // +1 because of leading clone
      }
      return realIndex;
    },
    [infinite, totalSlides]
  );

  /**
   * Handle instant jump when reaching clone slides (for infinite mode)
   * This is called after the transition to a clone completes
   */
  const handleCloneJump = useCallback(
    (targetRealIndex, targetDisplayIndex) => {
      // Disable transition and instantly jump to the real slide
      isJumpingRef.current = true;
      setSlideStyle({ transition: "none" });
      setDisplayIndex(targetDisplayIndex);

      // Re-enable transition after the instant jump
      jumpTimerRef.current = window.setTimeout(() => {
        setSlideStyle({ transition: `all ${slideDuration}ms ease-out` });
        isJumpingRef.current = false;
      }, 50);
    },
    [slideDuration]
  );

  // Core slide to index function (unthrottled)
  const slideToIndexCore = useCallback(
    (index, event, isPlayPause = false) => {
      if ((isTransitioning || isJumpingRef.current) && !isPlayPause) return;

      const slideCount = totalSlides - 1;
      let nextIndex = index;
      let nextDisplayIndex;
      let willWrap = false;
      let wrapDirection = null; // 'start' or 'end'

      // Handle wrapping for infinite mode
      if (index < 0) {
        nextIndex = slideCount;
        willWrap = true;
        wrapDirection = "start"; // Going from first to last
      } else if (index > slideCount) {
        nextIndex = 0;
        willWrap = true;
        wrapDirection = "end"; // Going from last to first
      }

      if (infinite && totalSlides > 1) {
        if (willWrap && wrapDirection === "start") {
          // Going left from slide 0: animate to clone at position 0, then jump to real last slide
          nextDisplayIndex = 0;
        } else if (willWrap && wrapDirection === "end") {
          // Going right from last slide: animate to clone at last position, then jump to real first slide
          nextDisplayIndex = totalDisplaySlides - 1;
        } else {
          nextDisplayIndex = nextIndex + 1; // Normal navigation (+1 for leading clone offset)
        }
      } else {
        nextDisplayIndex = nextIndex;
      }

      if (onBeforeSlide && nextIndex !== currentIndex) {
        onBeforeSlide(nextIndex);
      }

      setPreviousIndex(currentIndex);
      setCurrentIndex(nextIndex);
      setDisplayIndex(nextDisplayIndex);
      setIsTransitioning(nextIndex !== currentIndex || willWrap);
      setCurrentSlideOffset(0);
      setSlideStyle({ transition: `all ${slideDuration}ms ease-out` });

      // Schedule clone jump if we're wrapping in infinite mode
      if (infinite && totalSlides > 1 && willWrap) {
        transitionTimerRef.current = window.setTimeout(() => {
          setIsTransitioning(false);
          if (onSlide) {
            onSlide(nextIndex);
          }
          // Jump to the real slide after animation completes
          const realDisplayIndex = realToDisplayIndex(nextIndex);
          handleCloneJump(nextIndex, realDisplayIndex);
        }, slideDuration + 20);
      }
    },
    [
      currentIndex,
      totalSlides,
      totalDisplaySlides,
      slideDuration,
      onBeforeSlide,
      onSlide,
      isTransitioning,
      infinite,
      realToDisplayIndex,
      handleCloneJump,
    ]
  );

  // Throttled version for user interactions
  const slideToIndexThrottled = useRef(
    throttle(
      (index, event) => {
        slideToIndexCore(index, event, false);
      },
      slideDuration,
      { trailing: false }
    )
  );

  // Update throttle when slideDuration changes
  useEffect(() => {
    slideToIndexThrottled.current = throttle(
      (index, event) => {
        slideToIndexCore(index, event, false);
      },
      slideDuration,
      { trailing: false }
    );
  }, [slideDuration, slideToIndexCore]);

  const slideToIndex = useCallback((index, event) => {
    slideToIndexThrottled.current(index, event);
  }, []);

  // For two-slide edge case
  const slideToIndexWithStyleReset = useCallback(
    (nextIndex, event) => {
      setCurrentSlideOffset(
        (prev) => prev + (currentIndex > nextIndex ? 0.001 : -0.001)
      );
      setSlideStyle({ transition: "none" });

      window.setTimeout(() => {
        slideToIndexCore(nextIndex, event);
      }, 25);
    },
    [currentIndex, slideToIndexCore]
  );

  const slideLeft = useCallback(
    (event) => {
      const direction = isRTL ? "right" : "left";
      const nextIndex = currentIndex + (direction === "left" ? -1 : 1);

      if (isTransitioning || isJumpingRef.current) return;

      if (totalSlides === 2) {
        slideToIndexWithStyleReset(nextIndex, event);
      } else {
        slideToIndex(nextIndex, event);
      }
    },
    [
      isRTL,
      currentIndex,
      isTransitioning,
      totalSlides,
      slideToIndexWithStyleReset,
      slideToIndex,
    ]
  );

  const slideRight = useCallback(
    (event) => {
      const direction = isRTL ? "left" : "right";
      const nextIndex = currentIndex + (direction === "left" ? -1 : 1);

      if (isTransitioning || isJumpingRef.current) return;

      if (totalSlides === 2) {
        slideToIndexWithStyleReset(nextIndex, event);
      } else {
        slideToIndex(nextIndex, event);
      }
    },
    [
      isRTL,
      currentIndex,
      isTransitioning,
      totalSlides,
      slideToIndexWithStyleReset,
      slideToIndex,
    ]
  );

  /**
   * Get the container transform style for the flex-based slides
   * This replaces the old per-slide transform approach
   *
   * Both horizontal and vertical use percentage-based transforms.
   * For vertical, the parent must have an explicit height set so that
   * each slide's height: 100% resolves correctly.
   */
  const getContainerStyle = useCallback(
    ({ useTranslate3D = true, slideVertically = false } = {}) => {
      // Calculate the translation based on displayIndex and swipe offset
      const swipeOffset = currentSlideOffset * (isRTL ? -1 : 1);

      // Both horizontal and vertical use percentage values
      // Each slide is 100% wide (horizontal) or 100% tall (vertical)
      const baseOffset = displayIndex * 100;
      const translateValue = -(baseOffset - swipeOffset);

      const transform = slideVertically
        ? useTranslate3D
          ? `translate3d(0, ${translateValue}%, 0)`
          : `translate(0, ${translateValue}%)`
        : useTranslate3D
          ? `translate3d(${translateValue}%, 0, 0)`
          : `translate(${translateValue}%, 0)`;

      return {
        transform,
        WebkitTransform: transform,
        MozTransform: transform,
        msTransform: transform,
        OTransform: transform,
        ...slideStyle,
      };
    },
    [displayIndex, currentSlideOffset, slideStyle, isRTL]
  );

  /**
   * Build the slides array with clones for infinite mode
   * Returns: { slides: extendedItems[], getSlideKey: fn }
   */
  const getExtendedSlides = useCallback(() => {
    if (!infinite || totalSlides <= 1) {
      return {
        extendedItems: items,
        getSlideKey: (index) => `slide-${index}`,
        getRealIndex: (displayIdx) => displayIdx,
      };
    }

    // For infinite mode: [clone-of-last, ...items, clone-of-first]
    const extendedItems = [
      items[totalSlides - 1], // Clone of last at the start
      ...items,
      items[0], // Clone of first at the end
    ];

    return {
      extendedItems,
      getSlideKey: (index) => {
        if (index === 0) return "slide-clone-last";
        if (index === extendedItems.length - 1) return "slide-clone-first";
        return `slide-${index - 1}`;
      },
      // Convert display index to real item index
      getRealIndex: (displayIdx) => {
        if (displayIdx === 0) return totalSlides - 1; // Clone of last
        if (displayIdx === extendedItems.length - 1) return 0; // Clone of first
        return displayIdx - 1;
      },
    };
  }, [items, totalSlides, infinite]);

  /**
   * Get alignment class for a slide based on its display index
   */
  const getAlignmentClass = useCallback(
    (dispIndex) => {
      // Get the real index for this display position
      const { getRealIndex } = getExtendedSlides();
      const realIdx = getRealIndex(dispIndex);

      if (realIdx === currentIndex) return "image-gallery-center";
      if (realIdx === (currentIndex - 1 + totalSlides) % totalSlides)
        return "image-gallery-left";
      if (realIdx === (currentIndex + 1) % totalSlides)
        return "image-gallery-right";
      return "";
    },
    [currentIndex, totalSlides, getExtendedSlides]
  );

  // Trigger onSliding effect when transitioning (but not for clone jumps)
  useEffect(() => {
    if (isTransitioning && !isJumpingRef.current) {
      onSliding();
    }
  }, [isTransitioning, onSliding]);

  return {
    currentIndex,
    previousIndex,
    displayIndex,
    isTransitioning,
    currentSlideOffset,
    slideStyle,
    canSlide,
    canSlideLeft,
    canSlideRight,
    canSlidePrevious,
    canSlideNext,
    slideToIndex,
    slideToIndexCore,
    slideToIndexWithStyleReset,
    slideLeft,
    slideRight,
    getContainerStyle,
    getExtendedSlides,
    getAlignmentClass,
    setCurrentSlideOffset,
    setSlideStyle,
    setIsTransitioning,
    totalDisplaySlides,
  };
}

export default useGalleryNavigation;
