import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing autoplay functionality
 * Uses refs to avoid stale closures in setInterval
 */
export function useAutoPlay({
  autoPlay = false,
  slideInterval = 3000,
  slideDuration = 450,
  infinite = true,
  totalSlides,
  currentIndex,
  canSlideRight,
  slideToIndexCore,
  slideToIndexWithStyleReset,
  onPlay,
  onPause,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playPauseIntervalRef = useRef(null);

  // Ref to hold the latest pauseOrPlay function (avoids stale closure in setInterval)
  const pauseOrPlayRef = useRef(null);

  const pauseOrPlay = useCallback(() => {
    if (!infinite && !canSlideRight()) {
      // Stop at the end if not infinite
      if (playPauseIntervalRef.current) {
        window.clearInterval(playPauseIntervalRef.current);
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
        playPauseIntervalRef.current = window.setInterval(
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
        window.clearInterval(playPauseIntervalRef.current);
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
        window.clearInterval(playPauseIntervalRef.current);
        playPauseIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    playPauseIntervalId: playPauseIntervalRef.current,
    play,
    pause,
    togglePlay,
  };
}

export default useAutoPlay;
