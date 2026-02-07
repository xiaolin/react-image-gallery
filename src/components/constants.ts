/**
 * Default configuration values for the ImageGallery component.
 * Centralizing these makes it easier to update defaults across the codebase.
 */

// Animation & Timing
export const DEFAULT_SLIDE_DURATION = 550;
export const DEFAULT_SLIDE_INTERVAL = 3000;

// Thresholds
export const DEFAULT_FLICK_THRESHOLD = 0.4;
export const DEFAULT_SWIPE_THRESHOLD = 30;

// Momentum scrolling
export const DEFAULT_MOMENTUM_MULTIPLIER = 150;
export const DEFAULT_MAX_TRANSITION_DURATION = 700;

// Easing curves
// Material Design standard easing - smooth start and end, feels natural for navigation
export const DEFAULT_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
// Momentum easing - optimized for deceleration after swipe gestures
export const MOMENTUM_EASING = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
