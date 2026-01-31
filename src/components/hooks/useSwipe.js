import { useState, useCallback } from "react";
import { LEFT, RIGHT, UP, DOWN } from "react-swipeable";

/**
 * Custom hook for handling swipe gestures on slides
 */
export function useSwipe({
  disableSwipe = false,
  stopPropagation = false,
  swipeThreshold = 30,
  swipingTransitionDuration = 0,
  flickThreshold = 0.4,
  slideVertically = false,
  isRTL = false,
  galleryWidth,
  galleryHeight,
  isTransitioning,
  canSlideLeft,
  canSlideRight,
  slideToIndex,
  currentIndex,
}) {
  const [currentSlideOffset, setCurrentSlideOffset] = useState(0);
  const [slideStyle, setSlideStyle] = useState({});
  const [swipingUpDown, setSwipingUpDown] = useState(false);
  const [swipingLeftRight, setSwipingLeftRight] = useState(false);

  const resetSwipingDirection = useCallback(() => {
    if (swipingUpDown) {
      setSwipingUpDown(false);
    }
    if (swipingLeftRight) {
      setSwipingLeftRight(false);
    }
  }, [swipingUpDown, swipingLeftRight]);

  const sufficientSwipe = useCallback(() => {
    return Math.abs(currentSlideOffset) > swipeThreshold;
  }, [currentSlideOffset, swipeThreshold]);

  const handleSwiping = useCallback(
    ({ event, absX, absY, dir }) => {
      // Handle swiping direction lock
      if ((dir === UP || dir === DOWN || swipingUpDown) && !swipingLeftRight) {
        if (!swipingUpDown) {
          setSwipingUpDown(true);
        }
        if (!slideVertically) return;
      }

      if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
        setSwipingLeftRight(true);
      }

      if (disableSwipe) return;

      if (stopPropagation) {
        event.preventDefault();
      }

      if (!isTransitioning) {
        const isSwipeLeftOrRight = dir === LEFT || dir === RIGHT;
        const isSwipeTopOrDown = dir === UP || dir === DOWN;

        if (isSwipeLeftOrRight && slideVertically) return;
        if (isSwipeTopOrDown && !slideVertically) return;

        const sides = {
          [LEFT]: -1,
          [RIGHT]: 1,
          [UP]: -1,
          [DOWN]: 1,
        };

        const side = sides[dir];

        let slideOffset = (absX / galleryWidth) * 100;
        if (slideVertically) {
          slideOffset = (absY / galleryHeight) * 100;
        }

        if (Math.abs(slideOffset) >= 100) {
          slideOffset = 100;
        }

        const swipingTransition = {
          transition: `transform ${swipingTransitionDuration}ms ease-out`,
        };

        setCurrentSlideOffset(side * slideOffset);
        setSlideStyle(swipingTransition);
      } else {
        setCurrentSlideOffset(0);
      }
    },
    [
      disableSwipe,
      stopPropagation,
      isTransitioning,
      galleryWidth,
      galleryHeight,
      slideVertically,
      swipingTransitionDuration,
      swipingUpDown,
      swipingLeftRight,
    ]
  );

  const handleOnSwipedTo = useCallback(
    (swipeDirection, isFlick) => {
      let slideTo = currentIndex;

      if ((sufficientSwipe() || isFlick) && !isTransitioning) {
        slideTo += swipeDirection;
      }

      // Check boundaries
      if (
        (swipeDirection === -1 && !canSlideLeft()) ||
        (swipeDirection === 1 && !canSlideRight())
      ) {
        slideTo = currentIndex;
      }

      slideToIndex(slideTo);
    },
    [
      currentIndex,
      isTransitioning,
      sufficientSwipe,
      canSlideLeft,
      canSlideRight,
      slideToIndex,
    ]
  );

  const handleOnSwiped = useCallback(
    ({ event, dir, velocity }) => {
      if (disableSwipe) return;

      if (stopPropagation) event.stopPropagation();
      resetSwipingDirection();

      let swipeDirection = (dir === LEFT ? 1 : -1) * (isRTL ? -1 : 1);
      if (slideVertically) swipeDirection = dir === UP ? 1 : -1;

      const isSwipeUpOrDown = dir === UP || dir === DOWN;
      const isSwipeLeftOrRight = dir === LEFT || dir === RIGHT;
      const isLeftRightFlick = velocity > flickThreshold && !isSwipeUpOrDown;
      const isTopDownFlick = velocity > flickThreshold && !isSwipeLeftOrRight;

      const isFlick = slideVertically ? isTopDownFlick : isLeftRightFlick;

      handleOnSwipedTo(swipeDirection, isFlick);
    },
    [
      disableSwipe,
      stopPropagation,
      resetSwipingDirection,
      isRTL,
      slideVertically,
      flickThreshold,
      handleOnSwipedTo,
    ]
  );

  return {
    currentSlideOffset,
    setCurrentSlideOffset,
    slideStyle,
    setSlideStyle,
    swipingUpDown,
    swipingLeftRight,
    handleSwiping,
    handleOnSwiped,
    resetSwipingDirection,
  };
}

export default useSwipe;
