import { useCallback, useEffect, useState } from "react";

const screenChangeEvents = [
  "fullscreenchange",
  "MSFullscreenChange",
  "mozfullscreenchange",
  "webkitfullscreenchange",
];

/**
 * Custom hook for managing fullscreen functionality
 */
export function useFullscreen({
  useBrowserFullscreen = true,
  onScreenChange,
  galleryRef,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalFullscreen, setModalFullscreen] = useState(false);

  // Handle browser fullscreen change events
  const handleScreenChange = useCallback(() => {
    const fullScreenElement =
      document.fullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;

    const isCurrentlyFullscreen = galleryRef?.current === fullScreenElement;

    if (onScreenChange) {
      onScreenChange(isCurrentlyFullscreen);
    }

    if (useBrowserFullscreen) {
      setIsFullscreen(isCurrentlyFullscreen);
    }
  }, [galleryRef, useBrowserFullscreen, onScreenChange]);

  // Add/remove screen change event listeners
  useEffect(() => {
    screenChangeEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleScreenChange);
    });

    return () => {
      screenChangeEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleScreenChange);
      });
    };
  }, [handleScreenChange]);

  // Set modal fullscreen (fallback for browsers without fullscreen API)
  const setModalFullscreenState = useCallback(
    (state) => {
      setModalFullscreen(state);
      if (onScreenChange) {
        onScreenChange(state);
      }
    },
    [onScreenChange]
  );

  // Enter fullscreen
  const fullScreen = useCallback(() => {
    const gallery = galleryRef?.current;
    if (!gallery) return;

    if (useBrowserFullscreen) {
      if (gallery.requestFullscreen) {
        gallery.requestFullscreen();
      } else if (gallery.msRequestFullscreen) {
        gallery.msRequestFullscreen();
      } else if (gallery.mozRequestFullScreen) {
        gallery.mozRequestFullScreen();
      } else if (gallery.webkitRequestFullscreen) {
        gallery.webkitRequestFullscreen();
      } else {
        // Fallback to modal fullscreen
        setModalFullscreenState(true);
      }
    } else {
      setModalFullscreenState(true);
    }

    setIsFullscreen(true);
  }, [galleryRef, useBrowserFullscreen, setModalFullscreenState]);

  // Exit fullscreen
  const exitFullScreen = useCallback(() => {
    if (!isFullscreen) return;

    if (useBrowserFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else {
        setModalFullscreenState(false);
      }
    } else {
      setModalFullscreenState(false);
    }

    setIsFullscreen(false);
  }, [isFullscreen, useBrowserFullscreen, setModalFullscreenState]);

  // Toggle fullscreen
  const toggleFullScreen = useCallback(() => {
    if (isFullscreen) {
      exitFullScreen();
    } else {
      fullScreen();
    }
  }, [isFullscreen, exitFullScreen, fullScreen]);

  return {
    isFullscreen,
    modalFullscreen,
    fullScreen,
    exitFullScreen,
    toggleFullScreen,
    handleScreenChange,
  };
}

export default useFullscreen;
