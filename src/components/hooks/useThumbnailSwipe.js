import { useCallback, useState } from "react";
import { DOWN, LEFT, RIGHT, UP } from "react-swipeable";

/**
 * Custom hook for handling thumbnail swipe gestures
 */
export function useThumbnailSwipe({
  stopPropagation = false,
  swipingThumbnailTransitionDuration = 0,
  slideDuration = 450,
  isThumbnailVertical,
  thumbnailsRef,
  thumbnailsWrapperHeight,
  thumbnailsWrapperWidth,
  thumbsSwipedTranslate,
  setThumbsTranslate,
  setThumbsSwipedTranslate,
  setThumbsStyle,
  setIsSwipingThumbnail,
}) {
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

  const handleThumbnailSwiping = useCallback(
    ({ event, absX, absY, dir }) => {
      const isVertical = isThumbnailVertical();
      const emptySpaceMargin = 20;

      if (isVertical) {
        // For vertical thumbnails, prevent left/right swipes
        if (
          (dir === LEFT || dir === RIGHT || swipingLeftRight) &&
          !swipingUpDown
        ) {
          if (!swipingLeftRight) {
            setSwipingLeftRight(true);
          }
          return;
        }

        if ((dir === UP || dir === DOWN) && !swipingUpDown) {
          setSwipingUpDown(true);
        }
      } else {
        // For horizontal thumbnails, prevent up/down swipes
        if (
          (dir === UP || dir === DOWN || swipingUpDown) &&
          !swipingLeftRight
        ) {
          if (!swipingUpDown) {
            setSwipingUpDown(true);
          }
          return;
        }

        if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
          setSwipingLeftRight(true);
        }
      }

      const thumbsElement = thumbnailsRef.current;
      if (!thumbsElement) return;

      let thumbsTranslate;
      let totalSwipeableLength;
      let hasSwipedPassedEnd;
      let hasSwipedPassedStart;
      let isThumbnailBarSmallerThanContainer;

      if (isVertical) {
        const slideY = dir === DOWN ? absY : -absY;
        thumbsTranslate = thumbsSwipedTranslate + slideY;
        totalSwipeableLength =
          thumbsElement.scrollHeight -
          thumbnailsWrapperHeight +
          emptySpaceMargin;
        hasSwipedPassedEnd = Math.abs(thumbsTranslate) > totalSwipeableLength;
        hasSwipedPassedStart = thumbsTranslate > emptySpaceMargin;
        isThumbnailBarSmallerThanContainer =
          thumbsElement.scrollHeight <= thumbnailsWrapperHeight;
      } else {
        const slideX = dir === RIGHT ? absX : -absX;
        thumbsTranslate = thumbsSwipedTranslate + slideX;
        totalSwipeableLength =
          thumbsElement.scrollWidth - thumbnailsWrapperWidth + emptySpaceMargin;
        hasSwipedPassedEnd = Math.abs(thumbsTranslate) > totalSwipeableLength;
        hasSwipedPassedStart = thumbsTranslate > emptySpaceMargin;
        isThumbnailBarSmallerThanContainer =
          thumbsElement.scrollWidth <= thumbnailsWrapperWidth;
      }

      if (isThumbnailBarSmallerThanContainer) {
        return;
      }

      if ((dir === LEFT || dir === UP) && hasSwipedPassedEnd) {
        return;
      }

      if ((dir === RIGHT || dir === DOWN) && hasSwipedPassedStart) {
        return;
      }

      if (stopPropagation) event.stopPropagation();

      const swipingTransition = {
        transition: `transform ${swipingThumbnailTransitionDuration}ms ease-out`,
      };

      setThumbsTranslate(thumbsTranslate);
      setThumbsStyle(swipingTransition);
    },
    [
      isThumbnailVertical,
      thumbnailsRef,
      thumbnailsWrapperHeight,
      thumbnailsWrapperWidth,
      thumbsSwipedTranslate,
      stopPropagation,
      swipingThumbnailTransitionDuration,
      swipingUpDown,
      swipingLeftRight,
      setThumbsTranslate,
      setThumbsStyle,
    ]
  );

  const handleOnThumbnailSwiped = useCallback(
    (thumbsTranslate) => {
      resetSwipingDirection();
      setIsSwipingThumbnail(true);
      setThumbsSwipedTranslate(thumbsTranslate);
      setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
    },
    [
      resetSwipingDirection,
      slideDuration,
      setIsSwipingThumbnail,
      setThumbsSwipedTranslate,
      setThumbsStyle,
    ]
  );

  return {
    handleThumbnailSwiping,
    handleOnThumbnailSwiped,
    resetSwipingDirection,
  };
}

export default useThumbnailSwipe;
