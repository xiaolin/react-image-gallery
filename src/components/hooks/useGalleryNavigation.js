import { useCallback, useEffect, useRef, useState } from "react";
import throttle from "src/components/utils/throttle";

/**
 * Custom hook for managing gallery slide navigation
 * Handles slide index, transitions, and navigation logic
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
  const [slideStyle, setSlideStyle] = useState({
    transition: `all ${slideDuration}ms ease-out`,
  });

  const transitionTimerRef = useRef(null);
  const directionRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Reset index when items change
  useEffect(() => {
    setCurrentIndex(startIndex);
    setSlideStyle({ transition: "none" });
  }, [items, startIndex]);

  const totalSlides = items.length;
  const canSlide = totalSlides >= 2;

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

  // Core slide to index function (unthrottled)
  const slideToIndexCore = useCallback(
    (index, event, isPlayPause = false) => {
      if (isTransitioning && !isPlayPause) return;

      const slideCount = totalSlides - 1;
      let nextIndex = index;

      if (index < 0) {
        nextIndex = slideCount;
      } else if (index > slideCount) {
        nextIndex = 0;
      }

      if (onBeforeSlide && nextIndex !== currentIndex) {
        onBeforeSlide(nextIndex);
      }

      setPreviousIndex(currentIndex);
      setCurrentIndex(nextIndex);
      setIsTransitioning(nextIndex !== currentIndex);
      setCurrentSlideOffset(0);
      setSlideStyle({ transition: `all ${slideDuration}ms ease-out` });
    },
    [currentIndex, totalSlides, slideDuration, onBeforeSlide, isTransitioning]
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

      if (isTransitioning) return;

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

      if (isTransitioning) return;

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

  // Slide style calculation for transforms
  const getSlideStyle = useCallback(
    (index, { useTranslate3D = true, slideVertically = false } = {}) => {
      // ============= Helper Functions (defined inside useCallback for proper closure) =============

      /**
       * Calculate translate position for 2-slide infinite mode.
       * With only 2 slides and infinite scrolling enabled, we need special handling
       * to create the illusion of infinite scrolling.
       */
      function getTranslateXForTwoSlide(slideIndex) {
        const isSlide0 = slideIndex === 0;
        const isSlide1 = slideIndex === 1;
        const hasIndexChanged = currentIndex !== previousIndex;
        const isSwipingComplete = currentSlideOffset === 0;

        const baseTranslateX = -100 * currentIndex;
        let translateX = baseTranslateX + slideIndex * 100 + currentSlideOffset;

        const swipeDirection =
          currentSlideOffset > 0
            ? "left"
            : currentSlideOffset < 0
              ? "right"
              : null;
        if (swipeDirection) {
          directionRef.current = swipeDirection;
        }

        // During active swipe
        const isSwipingLeftToRevealSlide1 =
          isSlide1 && currentIndex === 0 && currentSlideOffset > 0;
        const isSwipingRightToRevealSlide0 =
          isSlide0 && currentIndex === 1 && currentSlideOffset < 0;

        if (isSwipingLeftToRevealSlide1) {
          translateX = -100 + currentSlideOffset;
        } else if (isSwipingRightToRevealSlide0) {
          translateX = 100 + currentSlideOffset;
        }

        // After swipe completes (transition animation)
        if (isSwipingComplete && directionRef.current) {
          const wasSwipingLeft = directionRef.current === "left";
          const wasSwipingRight = directionRef.current === "right";

          if (hasIndexChanged) {
            const slide0JustBecamePrevious = isSlide0 && previousIndex === 0;
            const slide1JustBecamePrevious = isSlide1 && previousIndex === 1;

            if (slide0JustBecamePrevious && wasSwipingLeft) {
              translateX = 100;
            } else if (slide1JustBecamePrevious && wasSwipingRight) {
              translateX = -100;
            }
          } else {
            const slide1ShouldBeHiddenLeft =
              isSlide1 && currentIndex === 0 && wasSwipingLeft;
            const slide0ShouldBeHiddenRight =
              isSlide0 && currentIndex === 1 && wasSwipingRight;

            if (slide1ShouldBeHiddenLeft) {
              translateX = -100;
            } else if (slide0ShouldBeHiddenRight) {
              translateX = 100;
            }
          }
        }

        return translateX;
      }

      /**
       * Check if we're jumping more than one slide (e.g., thumbnail click).
       */
      function isJumpingMultipleSlides() {
        const lastSlideIndex = totalSlides - 1;
        const slideDistance = Math.abs(previousIndex - currentIndex);
        const isMultiSlideJump = slideDistance > 1;
        const isNotWrappingFromFirstToLast = !(
          previousIndex === 0 && currentIndex === lastSlideIndex
        );
        const isNotWrappingFromLastToFirst = !(
          previousIndex === lastSlideIndex && currentIndex === 0
        );

        return (
          isMultiSlideJump &&
          isNotWrappingFromFirstToLast &&
          isNotWrappingFromLastToFirst
        );
      }

      /**
       * Check if this slide is at the boundary (first or last).
       */
      function isBoundarySlide(slideIndex) {
        return slideIndex === 0 || slideIndex === totalSlides - 1;
      }

      /**
       * Check if this slide should be hidden during transition.
       */
      function shouldHideDuringTransition(slideIndex) {
        const isPartOfTransition =
          slideIndex === previousIndex || slideIndex === currentIndex;
        return isTransitioning && !isPartOfTransition;
      }

      /**
       * Determine if a slide should be visible.
       */
      function isSlideVisible(slideIndex) {
        if (!shouldHideDuringTransition(slideIndex)) {
          return true;
        }
        return isJumpingMultipleSlides() && !isBoundarySlide(slideIndex);
      }

      // ============= Main Logic =============
      const baseTranslateX = -100 * currentIndex;
      const lastSlideIndex = totalSlides - 1;

      let translateValue =
        (baseTranslateX + index * 100) * (isRTL ? -1 : 1) + currentSlideOffset;

      if (infinite && totalSlides > 2) {
        if (currentIndex === 0 && index === lastSlideIndex) {
          translateValue = -100 * (isRTL ? -1 : 1) + currentSlideOffset;
        } else if (currentIndex === lastSlideIndex && index === 0) {
          translateValue = 100 * (isRTL ? -1 : 1) + currentSlideOffset;
        }
      }

      // Special case for 2 items with infinite
      if (infinite && totalSlides === 2) {
        translateValue = getTranslateXForTwoSlide(index);
      }

      let translate = slideVertically
        ? `translate(0, ${translateValue}%)`
        : `translate(${translateValue}%, 0)`;

      if (useTranslate3D) {
        translate = slideVertically
          ? `translate3d(0, ${translateValue}%, 0)`
          : `translate3d(${translateValue}%, 0, 0)`;
      }

      const isVisible = isSlideVisible(index);

      return {
        display: isVisible ? "inherit" : "none",
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        transform: translate,
        ...slideStyle,
      };
    },
    [
      currentIndex,
      previousIndex,
      currentSlideOffset,
      slideStyle,
      totalSlides,
      infinite,
      isRTL,
      isTransitioning,
    ]
  );

  // Trigger onSliding effect when transitioning
  useEffect(() => {
    if (isTransitioning) {
      onSliding();
    }
  }, [isTransitioning, onSliding]);

  return {
    currentIndex,
    previousIndex,
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
    getSlideStyle,
    setCurrentSlideOffset,
    setSlideStyle,
    setIsTransitioning,
  };
}

export default useGalleryNavigation;
