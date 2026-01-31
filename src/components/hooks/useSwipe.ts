import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { DOWN, LEFT, RIGHT, UP } from "react-swipeable";
import type { SwipeEventData } from "react-swipeable";

type SwipeDirection = typeof LEFT | typeof RIGHT | typeof UP | typeof DOWN;

interface UseSwipeProps {
  disableSwipe?: boolean;
  stopPropagation?: boolean;
  swipeThreshold?: number;
  swipingTransitionDuration?: number;
  flickThreshold?: number;
  slideVertically?: boolean;
  isRTL?: boolean;
  galleryWidth: number;
  galleryHeight: number;
  isTransitioning: boolean;
  canSlideLeft: () => boolean;
  canSlideRight: () => boolean;
  slideToIndex: (index: number, event?: React.SyntheticEvent | Event) => void;
  currentIndex: number;
}

interface UseSwipeReturn {
  currentSlideOffset: number;
  setCurrentSlideOffset: React.Dispatch<React.SetStateAction<number>>;
  slideStyle: CSSProperties;
  setSlideStyle: React.Dispatch<React.SetStateAction<CSSProperties>>;
  swipingUpDown: boolean;
  swipingLeftRight: boolean;
  handleSwiping: (swipeData: SwipeEventData) => void;
  handleOnSwiped: (swipeData: SwipeEventData) => void;
  resetSwipingDirection: () => void;
}

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
}: UseSwipeProps): UseSwipeReturn {
  const [currentSlideOffset, setCurrentSlideOffset] = useState(0);
  const [slideStyle, setSlideStyle] = useState<CSSProperties>({});
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
    ({ event, absX, absY, dir }: SwipeEventData): void => {
      const direction = dir as SwipeDirection;

      // Handle swiping direction lock
      if (
        (direction === UP || direction === DOWN || swipingUpDown) &&
        !swipingLeftRight
      ) {
        if (!swipingUpDown) {
          setSwipingUpDown(true);
        }
        if (!slideVertically) return;
      }

      if ((direction === LEFT || direction === RIGHT) && !swipingLeftRight) {
        setSwipingLeftRight(true);
      }

      if (disableSwipe) return;

      if (stopPropagation) {
        event.preventDefault();
      }

      if (!isTransitioning) {
        const isSwipeLeftOrRight = direction === LEFT || direction === RIGHT;
        const isSwipeTopOrDown = direction === UP || direction === DOWN;

        if (isSwipeLeftOrRight && slideVertically) return;
        if (isSwipeTopOrDown && !slideVertically) return;

        const sides: Record<SwipeDirection, number> = {
          [LEFT]: -1,
          [RIGHT]: 1,
          [UP]: -1,
          [DOWN]: 1,
        };

        const side = sides[direction];

        let slideOffset = (absX / galleryWidth) * 100;
        if (slideVertically) {
          slideOffset = (absY / galleryHeight) * 100;
        }

        if (Math.abs(slideOffset) >= 100) {
          slideOffset = 100;
        }

        const swipingTransition: CSSProperties = {
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
    (swipeDirection: number, isFlick: boolean): void => {
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
    ({ event, dir, velocity }: SwipeEventData): void => {
      if (disableSwipe) return;

      if (stopPropagation) event.stopPropagation();
      resetSwipingDirection();

      const direction = dir as SwipeDirection;
      let swipeDirection = (direction === LEFT ? 1 : -1) * (isRTL ? -1 : 1);
      if (slideVertically) swipeDirection = direction === UP ? 1 : -1;

      const isSwipeUpOrDown = direction === UP || direction === DOWN;
      const isSwipeLeftOrRight = direction === LEFT || direction === RIGHT;
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
