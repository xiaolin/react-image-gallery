import { useCallback, useState } from "react";
import type { RefObject } from "react";
import type { OnScreenChangeCallback } from "src/types";

// Extended Document interface for fullscreen API compatibility
interface FullscreenDocument extends Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

interface FullscreenElement extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface UseFullscreenProps {
  useBrowserFullscreen?: boolean;
  onScreenChange?: OnScreenChangeCallback | null;
  galleryRef: RefObject<HTMLDivElement | null>;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  modalFullscreen: boolean;
  fullScreen: () => void;
  exitFullScreen: () => void;
  toggleFullScreen: () => void;
  handleScreenChange: () => void;
}

/**
 * Custom hook for managing fullscreen functionality
 */
export function useFullscreen({
  useBrowserFullscreen = true,
  onScreenChange,
  galleryRef,
}: UseFullscreenProps): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalFullscreen, setModalFullscreen] = useState(false);

  // Handle browser fullscreen change events
  const handleScreenChange = useCallback(() => {
    const doc = document as FullscreenDocument;
    const fullScreenElement =
      doc.fullscreenElement ||
      doc.msFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement;

    const isCurrentlyFullscreen = galleryRef?.current === fullScreenElement;

    if (onScreenChange) {
      onScreenChange(isCurrentlyFullscreen);
    }

    if (useBrowserFullscreen) {
      setIsFullscreen(isCurrentlyFullscreen);
    }
  }, [galleryRef, useBrowserFullscreen, onScreenChange]);

  // Set modal fullscreen (fallback for browsers without fullscreen API)
  const setModalFullscreenState = useCallback(
    (state: boolean) => {
      setModalFullscreen(state);
      if (onScreenChange) {
        onScreenChange(state);
      }
    },
    [onScreenChange]
  );

  // Enter fullscreen
  const fullScreen = useCallback(() => {
    const gallery = galleryRef?.current as FullscreenElement | null;
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

    const doc = document as FullscreenDocument;

    if (useBrowserFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
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
