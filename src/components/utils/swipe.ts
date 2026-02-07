import type { SwipeDirection } from "src/types";

/**
 * Pure utility functions for swipe gesture logic.
 *
 * These are extracted from the ImageGallery component so they can be
 * unit-tested without DOM dependencies, jsdom limitations, or React rendering.
 */

/**
 * Determines whether the accumulated swipe offset exceeds the threshold
 * required to advance to the next/previous slide.
 */
export function isSufficientSwipe(offset: number, threshold: number): boolean {
  return Math.abs(offset) > threshold;
}

/**
 * Calculates the swipe offset as a percentage of the gallery dimension.
 * Clamps the result to [-100, 100].
 */
export function calculateSwipeOffset(
  absX: number,
  absY: number,
  galleryWidth: number,
  galleryHeight: number,
  direction: SwipeDirection,
  slideVertically: boolean
): number {
  const sides: Record<SwipeDirection, number> = {
    Left: -1,
    Right: 1,
    Up: -1,
    Down: 1,
  };

  const side = sides[direction];
  let offset = slideVertically
    ? (absY / galleryHeight) * 100
    : (absX / galleryWidth) * 100;

  if (Math.abs(offset) >= 100) {
    offset = 100;
  }

  return side * offset;
}

/**
 * Determines the swipe direction multiplier from the swipe direction string.
 * Returns +1 (next slide) or -1 (previous slide).
 */
export function getSwipeDirection(
  direction: SwipeDirection,
  isRTL: boolean,
  slideVertically: boolean
): number {
  if (slideVertically) {
    return direction === "Up" ? 1 : -1;
  }
  return (direction === "Left" ? 1 : -1) * (isRTL ? -1 : 1);
}

/**
 * Determines whether a swipe gesture qualifies as a "flick" (fast swipe).
 */
export function isFlickSwipe(
  velocity: number,
  flickThreshold: number,
  direction: SwipeDirection,
  slideVertically: boolean
): boolean {
  const isSwipeUpOrDown = direction === "Up" || direction === "Down";
  const isSwipeLeftOrRight = direction === "Left" || direction === "Right";
  const isLeftRightFlick = velocity > flickThreshold && !isSwipeUpOrDown;
  const isTopDownFlick = velocity > flickThreshold && !isSwipeLeftOrRight;
  return slideVertically ? isTopDownFlick : isLeftRightFlick;
}

/**
 * Computes the target slide index after a swipe ends.
 */
export function computeSlideTarget(
  currentIndex: number,
  swipeDirection: number,
  isSufficient: boolean,
  isFlick: boolean,
  isTransitioning: boolean,
  canSlideLeft: boolean,
  canSlideRight: boolean
): number {
  let slideTo = currentIndex;

  if ((isSufficient || isFlick) && !isTransitioning) {
    slideTo += swipeDirection;
  }

  // Clamp: if we can't slide in the requested direction, stay put
  if (swipeDirection === -1 && !canSlideLeft) {
    slideTo = currentIndex;
  }
  if (swipeDirection === 1 && !canSlideRight) {
    slideTo = currentIndex;
  }

  return slideTo;
}

/**
 * Computes the target displayIndex for the CSS transform.
 * Mirrors the logic in slideToIndexCore from useGalleryNavigation.
 */
export function computeTargetDisplayIndex(
  slideTo: number,
  totalSlides: number,
  totalDisplaySlides: number,
  infinite: boolean
): number {
  const slideCount = totalSlides - 1;

  if (slideTo < 0) {
    // Wrapping start (going past first slide)
    return 0;
  }
  if (slideTo > slideCount) {
    // Wrapping end (going past last slide)
    return infinite && totalSlides > 1 ? totalDisplaySlides - 1 : slideCount;
  }
  // Normal navigation
  return infinite && totalSlides > 1 ? slideTo + 1 : slideTo;
}

/**
 * Computes the CSS transition duration based on the swipe velocity,
 * remaining distance, and gallery dimension. Produces a natural
 * continuation of the user's finger speed.
 *
 * Returns a duration in milliseconds, clamped between 80ms and slideDuration.
 */
export function computeVelocityDuration(
  finalOffset: number,
  slideTo: number,
  currentIndex: number,
  velocity: number,
  slideDuration: number,
  galleryDimension: number
): number {
  const swipedPercent = Math.abs(finalOffset);
  const remainingPercent =
    slideTo !== currentIndex
      ? 100 - swipedPercent // traveling to next/prev slide
      : swipedPercent; // snapping back to current slide
  const remainingPx = (remainingPercent / 100) * galleryDimension;

  if (velocity > 0) {
    return Math.min(
      slideDuration,
      Math.max(80, Math.round(remainingPx / velocity))
    );
  }
  return slideDuration;
}

/**
 * Checks whether the swipe direction is valid for the current mode.
 * Returns true if the swipe should be ignored.
 */
export function shouldIgnoreSwipeDirection(
  direction: SwipeDirection,
  slideVertically: boolean
): boolean {
  const isSwipeLeftOrRight = direction === "Left" || direction === "Right";
  const isSwipeTopOrDown = direction === "Up" || direction === "Down";

  if (isSwipeLeftOrRight && slideVertically) return true;
  if (isSwipeTopOrDown && !slideVertically) return true;
  return false;
}
