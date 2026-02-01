import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  DEFAULT_SLIDE_DURATION,
  DEFAULT_SLIDE_INTERVAL,
} from "src/components/constants";
import type { OnPauseCallback, OnPlayCallback, SlideEvent } from "src/types";

interface UseAutoPlayProps {
  autoPlay?: boolean;
  slideInterval?: number;
  slideDuration?: number;
  infinite?: boolean;
  totalSlides: number;
  currentIndex: number;
  canSlideRight: () => boolean;
  slideToIndexCore: (
    index: number,
    event?: SlideEvent,
    isPlayPause?: boolean
  ) => void;
  slideToIndexWithStyleReset: (index: number, event?: SlideEvent) => void;
  onPlay?: OnPlayCallback | null;
  onPause?: OnPauseCallback | null;
}

interface UseAutoPlayReturn {
  isPlaying: boolean;
  playPauseIntervalRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
  play: (shouldCallOnPlay?: boolean) => void;
  pause: (shouldCallOnPause?: boolean) => void;
  togglePlay: () => void;
}

/**
 * Custom hook for managing autoplay functionality
 * Uses refs to avoid stale closures in setInterval
 */
export function useAutoPlay({
  autoPlay = false,
  slideInterval = DEFAULT_SLIDE_INTERVAL,
  slideDuration = DEFAULT_SLIDE_DURATION,
  infinite = true,
  totalSlides,
  currentIndex,
  canSlideRight,
  slideToIndexCore,
  slideToIndexWithStyleReset,
  onPlay,
  onPause,
}: UseAutoPlayProps): UseAutoPlayReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const playPauseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Ref to hold the latest pauseOrPlay function (avoids stale closure in setInterval)
  const pauseOrPlayRef = useRef<(() => void) | null>(null);

  const pauseOrPlay = useCallback(() => {
    if (!infinite && !canSlideRight()) {
      // Stop at the end if not infinite
      if (playPauseIntervalRef.current) {
        clearInterval(playPauseIntervalRef.current);
        playPauseIntervalRef.current = null;
        setIsPlaying(false);
        if (onPause) {
          onPause(currentIndex);
        }
      }
    } else {
      const nextIndex = currentIndex + 1;
      // Handle 2 slides the same way as manual sliding
      if (totalSlides === 2) {
        slideToIndexWithStyleReset(nextIndex);
      } else {
        slideToIndexCore(nextIndex);
      }
    }
  }, [
    infinite,
    canSlideRight,
    currentIndex,
    totalSlides,
    slideToIndexCore,
    slideToIndexWithStyleReset,
    onPause,
  ]);

  // Keep ref updated with latest pauseOrPlay
  pauseOrPlayRef.current = pauseOrPlay;

  const play = useCallback(
    (shouldCallOnPlay = true) => {
      if (!playPauseIntervalRef.current) {
        setIsPlaying(true);
        playPauseIntervalRef.current = setInterval(
          () => pauseOrPlayRef.current?.(),
          Math.max(slideInterval, slideDuration)
        );
        if (onPlay && shouldCallOnPlay) {
          onPlay(currentIndex);
        }
      }
    },
    [slideInterval, slideDuration, onPlay, currentIndex]
  );

  const pause = useCallback(
    (shouldCallOnPause = true) => {
      if (playPauseIntervalRef.current) {
        clearInterval(playPauseIntervalRef.current);
        playPauseIntervalRef.current = null;
        setIsPlaying(false);
        if (onPause && shouldCallOnPause) {
          onPause(currentIndex);
        }
      }
    },
    [onPause, currentIndex]
  );

  const togglePlay = useCallback(() => {
    if (playPauseIntervalRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  // Refs for stable function access in effects
  const playRef = useRef(play);
  const pauseRef = useRef(pause);
  playRef.current = play;
  pauseRef.current = pause;

  // Reset interval when slideInterval or slideDuration changes
  useEffect(() => {
    if (isPlaying) {
      pauseRef.current(false);
      playRef.current(false);
    }
  }, [slideInterval, slideDuration, isPlaying]);

  // Start autoPlay if enabled
  useEffect(() => {
    if (autoPlay && !playPauseIntervalRef.current) {
      playRef.current();
    }
  }, [autoPlay]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (playPauseIntervalRef.current) {
        clearInterval(playPauseIntervalRef.current);
        playPauseIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    playPauseIntervalRef,
    play,
    pause,
    togglePlay,
  };
}

export default useAutoPlay;
