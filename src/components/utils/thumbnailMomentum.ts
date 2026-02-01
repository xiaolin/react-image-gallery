/**
 * Utility functions for thumbnail momentum scrolling calculations
 */

export interface MomentumConfig {
  velocity: number;
  direction: string;
  isVertical: boolean;
  currentTranslate: number;
  scrollSize: number;
  wrapperSize: number;
  slideDuration: number;
  emptySpaceMargin?: number;
  momentumMultiplier?: number;
}

export interface MomentumResult {
  targetTranslate: number;
  transitionDuration: number;
  transitionStyle: string;
}

/**
 * Calculate momentum distance based on velocity
 * @param velocity - The swipe velocity (typically 0-2+)
 * @param multiplier - Pixels per velocity unit (default 150)
 */
export function calculateMomentumDistance(
  velocity: number,
  multiplier: number = 150
): number {
  return velocity * multiplier;
}

/**
 * Determine the direction sign for momentum based on swipe direction
 * @param direction - The swipe direction ("Left", "Right", "Up", "Down")
 * @param isVertical - Whether the thumbnail bar is vertical
 */
export function getMomentumDirection(
  direction: string,
  isVertical: boolean
): number {
  if (isVertical) {
    return direction === "Down" ? 1 : -1;
  }
  return direction === "Right" ? 1 : -1;
}

/**
 * Clamp a translate value to valid bounds
 * @param translate - The proposed translate value
 * @param maxScroll - Maximum scroll distance (positive value)
 * @param emptySpaceMargin - Allowed margin at boundaries (default 0 for strict bounds)
 */
export function clampTranslate(
  translate: number,
  maxScroll: number,
  emptySpaceMargin: number = 0
): number {
  // Can't go past start (positive beyond margin)
  let clamped = Math.min(emptySpaceMargin, translate);
  // Can't go past end (negative beyond maxScroll)
  clamped = Math.max(-maxScroll, clamped);
  return clamped;
}

/**
 * Calculate transition duration based on velocity
 * Higher velocity = slightly longer duration for smoother deceleration
 * @param velocity - The swipe velocity
 * @param baseDuration - Base slide duration in ms
 * @param maxDuration - Maximum duration cap in ms
 */
export function calculateTransitionDuration(
  velocity: number,
  baseDuration: number = 450,
  maxDuration: number = 600
): number {
  return Math.min(maxDuration, baseDuration + velocity * 100);
}

/**
 * Calculate the full momentum result for a thumbnail swipe
 */
export function calculateMomentum(config: MomentumConfig): MomentumResult {
  const {
    velocity,
    direction,
    isVertical,
    currentTranslate,
    scrollSize,
    wrapperSize,
    slideDuration,
    emptySpaceMargin = 0,
    momentumMultiplier = 150,
  } = config;

  // Calculate momentum distance and direction
  const momentumDistance = calculateMomentumDistance(
    velocity,
    momentumMultiplier
  );
  const directionSign = getMomentumDirection(direction, isVertical);
  const momentum = momentumDistance * directionSign;

  // Calculate target translate with momentum
  let targetTranslate = currentTranslate + momentum;

  // Calculate max scroll and clamp
  const maxScroll = scrollSize - wrapperSize + emptySpaceMargin;
  if (maxScroll > 0) {
    targetTranslate = clampTranslate(
      targetTranslate,
      maxScroll,
      emptySpaceMargin
    );
  }

  // Calculate transition
  const transitionDuration = calculateTransitionDuration(
    velocity,
    slideDuration
  );
  const transitionStyle = `all ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  return {
    targetTranslate,
    transitionDuration,
    transitionStyle,
  };
}
