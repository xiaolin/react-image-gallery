import { useCallback, useRef } from "react";
import type { SwipeDirection, SwipeEventData } from "src/types";

interface UseSwipeHandlersConfig {
  delta?: number;
  onSwiping?: (data: SwipeEventData) => void;
  onSwiped?: (data: SwipeEventData) => void;
}

interface SwipeHandlers {
  ref: (el: HTMLElement | null) => void;
}

interface TouchSample {
  x: number;
  y: number;
  time: number;
}

const VELOCITY_WINDOW_MS = 100;

function getDirection(dx: number, dy: number): SwipeDirection {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? "Right" : "Left";
  }
  return dy > 0 ? "Down" : "Up";
}

function calculateVelocity(samples: TouchSample[]): number {
  if (samples.length < 2) return 0;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const dt = last.time - first.time;
  if (dt === 0) return 0;
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Pixels per millisecond — matches react-swipeable's velocity scale
  return distance / dt;
}

/**
 * Custom swipe handler hook that replaces react-swipeable.
 * Fires onSwiped synchronously in the touchend handler,
 * eliminating the frame delay that causes swipe-end jank.
 */
export function useSwipeHandlers({
  delta = 0,
  onSwiping,
  onSwiped,
}: UseSwipeHandlersConfig): SwipeHandlers {
  const stateRef = useRef({
    swiping: false,
    startX: 0,
    startY: 0,
    samples: [] as TouchSample[],
  });

  const configRef = useRef({ delta, onSwiping, onSwiped });
  configRef.current = { delta, onSwiping, onSwiped };

  const handlersRef = useRef<{
    touchstart: (e: TouchEvent) => void;
    touchmove: (e: TouchEvent) => void;
    touchend: (e: TouchEvent) => void;
  } | null>(null);

  if (!handlersRef.current) {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const state = stateRef.current;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.swiping = false;
      state.samples = [
        { x: touch.clientX, y: touch.clientY, time: Date.now() },
      ];
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const state = stateRef.current;
      const { delta: d, onSwiping: cb } = configRef.current;

      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Track velocity samples (keep recent window only)
      const now = Date.now();
      state.samples.push({ x: touch.clientX, y: touch.clientY, time: now });
      const cutoff = now - VELOCITY_WINDOW_MS;
      while (state.samples.length > 1 && state.samples[0].time < cutoff) {
        state.samples.shift();
      }

      // Check delta threshold
      if (!state.swiping) {
        if (Math.max(absX, absY) < d) return;
        state.swiping = true;
      }

      if (cb) {
        const dir = getDirection(dx, dy);
        const velocity = calculateVelocity(state.samples);
        cb({ event: e, absX, absY, dir, velocity });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const state = stateRef.current;
      const { onSwiped: cb } = configRef.current;

      if (!state.swiping) return;
      state.swiping = false;

      if (cb) {
        const dx = (e.changedTouches[0]?.clientX ?? 0) - state.startX;
        const dy = (e.changedTouches[0]?.clientY ?? 0) - state.startY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const dir = getDirection(dx, dy);
        const velocity = calculateVelocity(state.samples);
        cb({ event: e, absX, absY, dir, velocity });
      }

      state.samples = [];
    };

    handlersRef.current = {
      touchstart: handleTouchStart,
      touchmove: handleTouchMove,
      touchend: handleTouchEnd,
    };
  }

  const elRef = useRef<HTMLElement | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    const handlers = handlersRef.current!;
    // Cleanup previous element
    if (elRef.current) {
      elRef.current.removeEventListener("touchstart", handlers.touchstart);
      elRef.current.removeEventListener("touchmove", handlers.touchmove);
      elRef.current.removeEventListener("touchend", handlers.touchend);
    }
    elRef.current = el;
    if (el) {
      // Use passive: false for touchmove so preventDefault can be called if needed
      el.addEventListener("touchstart", handlers.touchstart, { passive: true });
      el.addEventListener("touchmove", handlers.touchmove, { passive: false });
      el.addEventListener("touchend", handlers.touchend, { passive: true });
    }
  }, []);

  return { ref };
}

export default useSwipeHandlers;
