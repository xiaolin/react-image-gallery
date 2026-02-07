import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ForwardedRef, RefObject } from "react";
import clsx from "clsx";
import Bullet from "src/components/Bullet";
import BulletNav from "src/components/BulletNav";
import {
  DEFAULT_FLICK_THRESHOLD,
  DEFAULT_SLIDE_DURATION,
  DEFAULT_SLIDE_INTERVAL,
  DEFAULT_SWIPE_THRESHOLD,
} from "src/components/constants";
import BottomNav from "src/components/controls/BottomNav";
import Fullscreen from "src/components/controls/Fullscreen";
import LeftNav from "src/components/controls/LeftNav";
import PlayPause from "src/components/controls/PlayPause";
import RightNav from "src/components/controls/RightNav";
import TopNav from "src/components/controls/TopNav";
import { useAutoPlay } from "src/components/hooks/useAutoPlay";
import { useFullscreen } from "src/components/hooks/useFullscreen";
import { useGalleryNavigation } from "src/components/hooks/useGalleryNavigation";
import { useThumbnails } from "src/components/hooks/useThumbnails";
import IndexIndicator from "src/components/IndexIndicator";
import Item from "src/components/Item";
import Slide from "src/components/Slide";
import { injectStyles } from "src/components/styleInjector";
import SwipeWrapper from "src/components/SwipeWrapper";
import Thumbnail from "src/components/Thumbnail";
import ThumbnailBar from "src/components/ThumbnailBar";
import debounce from "src/components/utils/debounce";
import { calculateMomentum } from "src/components/utils/thumbnailMomentum";
import type {
  GalleryItem,
  ImageGalleryProps,
  ImageGalleryRef,
  SwipeDirection,
  SwipeEventData,
  ThumbnailPosition,
} from "src/types";

// Auto-inject styles when module loads
injectStyles();

// ============= Constants =============
const screenChangeEvents = [
  "fullscreenchange",
  "MSFullscreenChange",
  "mozfullscreenchange",
  "webkitfullscreenchange",
];

// ============= Helper Functions =============
function isEnterOrSpaceKey(event: React.KeyboardEvent): boolean {
  const key = parseInt(String(event.keyCode || event.which || 0), 10);
  const ENTER_KEY_CODE = 13;
  const SPACEBAR_KEY_CODE = 32;
  return key === ENTER_KEY_CODE || key === SPACEBAR_KEY_CODE;
}

function getThumbnailPositionClassName(
  thumbnailPosition: ThumbnailPosition
): string {
  const classNames: Record<ThumbnailPosition, string> = {
    left: " image-gallery-thumbnails-left",
    right: " image-gallery-thumbnails-right",
    bottom: " image-gallery-thumbnails-bottom",
    top: " image-gallery-thumbnails-top",
  };
  return classNames[thumbnailPosition] || "";
}

/**
 * ImageGallery - A responsive and customizable image gallery component
 *
 * Refactored to functional component with custom hooks for better maintainability.
 * Supports swipe gestures, thumbnails, fullscreen, autoplay, and more.
 */
const ImageGallery = forwardRef<ImageGalleryRef, ImageGalleryProps>(
  function ImageGallery(
    props: ImageGalleryProps,
    ref: ForwardedRef<ImageGalleryRef>
  ) {
    // ============= Props with Defaults =============
    const {
      additionalClass = "",
      autoPlay = false,
      disableKeyDown = false,
      disableSwipe = false,
      disableThumbnailScroll = false,
      disableThumbnailSwipe = false,
      flickThreshold = DEFAULT_FLICK_THRESHOLD,
      indexSeparator = " / ",
      infinite = true,
      isRTL = false,
      items,
      lazyLoad = false,
      onBeforeSlide,
      onBulletClick,
      onClick,
      onErrorImageURL = "",
      onImageError,
      onImageLoad,
      onMouseLeave,
      onMouseOver,
      onPause,
      onPlay,
      onScreenChange,
      onSlide,
      onThumbnailClick,
      onThumbnailError,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      renderBottomNav = (onClick, disabled) => (
        <BottomNav disabled={disabled} onClick={onClick} />
      ),
      renderCustomControls,
      renderFullscreenButton = (onClick, isFullscreen) => (
        <Fullscreen isFullscreen={isFullscreen} onClick={onClick} />
      ),
      renderItem,
      renderLeftNav = (onClick, disabled) => (
        <LeftNav disabled={disabled} onClick={onClick} />
      ),
      renderPlayPauseButton = (onClick, isPlaying) => (
        <PlayPause isPlaying={isPlaying} onClick={onClick} />
      ),
      renderRightNav = (onClick, disabled) => (
        <RightNav disabled={disabled} onClick={onClick} />
      ),
      renderThumbInner,
      renderTopNav = (onClick, disabled) => (
        <TopNav disabled={disabled} onClick={onClick} />
      ),
      showBullets = false,
      maxBullets,
      showFullscreenButton = true,
      showIndex = false,
      showNav = true,
      showPlayButton = true,
      showThumbnails = true,
      slideDuration = DEFAULT_SLIDE_DURATION,
      slideInterval = DEFAULT_SLIDE_INTERVAL,
      slideOnThumbnailOver = false,
      slideVertically = false,
      startIndex = 0,
      stopPropagation = false,
      swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
      thumbnailPosition = "bottom",
      useBrowserFullscreen = true,
      useTranslate3D = true,
      useWindowKeyDown = true,
    } = props;

    // ============= Refs =============
    const imageGalleryRef = useRef<HTMLDivElement | null>(null);
    const imageGallerySlideWrapperRef = useRef<HTMLDivElement | null>(null);
    const thumbnailMouseOverTimerRef = useRef<number | null>(null);
    const loadedImagesRef = useRef<Record<string, boolean>>({});
    const lazyLoadedRef = useRef<boolean[]>([]);
    const resizeSlideWrapperObserverRef = useRef<ResizeObserver | null>(null);
    const handleKeyDownRef = useRef<((event: KeyboardEvent) => void) | null>(
      null
    );

    // ============= Local State =============
    const [galleryWidth, setGalleryWidth] = useState(0);
    const [galleryHeight, setGalleryHeight] = useState(0);
    const [gallerySlideWrapperHeight, setGallerySlideWrapperHeight] =
      useState(0);
    const [swipingUpDown, setSwipingUpDown] = useState(false);
    const [swipingLeftRight, setSwipingLeftRight] = useState(false);

    const totalSlides = items.length;
    const canSlide = totalSlides >= 2;

    // ============= Use Gallery Navigation Hook =============
    const {
      currentIndex,
      isTransitioning,
      currentSlideOffset,
      canSlideLeft,
      canSlideRight,
      slideToIndex,
      slideToIndexCore,
      slideToIndexWithStyleReset,
      slideLeft,
      slideRight,
      getContainerStyle,
      getExtendedSlides,
      getAlignmentClass,
      setCurrentSlideOffset,
      setSlideStyle,
    } = useGalleryNavigation({
      items,
      startIndex,
      infinite,
      isRTL,
      slideDuration,
      onSlide,
      onBeforeSlide,
    });

    // ============= Use Thumbnails Hook =============
    const {
      thumbsTranslate,
      setThumbsTranslate,
      thumbsSwipedTranslate,
      setThumbsSwipedTranslate,
      setThumbsStyle,
      thumbnailsWrapperWidth,
      thumbnailsWrapperHeight,
      isSwipingThumbnail,
      setIsSwipingThumbnail,
      thumbnailsWrapperRef,
      thumbnailsRef,
      isThumbnailVertical,
      getThumbnailStyle,
      getThumbnailBarHeight,
      initResizeObserver: initThumbnailResizeObserver,
      removeResizeObserver: removeThumbnailsResizeObserver,
    } = useThumbnails({
      currentIndex,
      items,
      thumbnailPosition,
      disableThumbnailScroll,
      slideDuration,
      isRTL,
      useTranslate3D,
    });

    // ============= Use Fullscreen Hook =============
    const {
      isFullscreen,
      modalFullscreen,
      fullScreen,
      exitFullScreen,
      toggleFullScreen,
      handleScreenChange,
    } = useFullscreen({
      useBrowserFullscreen,
      onScreenChange,
      galleryRef: imageGalleryRef,
    });

    // ============= Use AutoPlay Hook =============
    const { isPlaying, playPauseIntervalRef, play, pause, togglePlay } =
      useAutoPlay({
        autoPlay,
        slideInterval,
        slideDuration,
        infinite,
        totalSlides,
        currentIndex,
        canSlideRight,
        slideToIndexCore,
        slideToIndexWithStyleReset,
        onPlay,
        onPause,
      });

    // ============= Swipe Reset Helper =============
    const resetSwipingDirection = useCallback(() => {
      if (swipingUpDown) setSwipingUpDown(false);
      if (swipingLeftRight) setSwipingLeftRight(false);
    }, [swipingUpDown, swipingLeftRight]);

    // ============= Slide Swipe Handlers =============
    const sufficientSwipe = useCallback(() => {
      return Math.abs(currentSlideOffset) > swipeThreshold;
    }, [currentSlideOffset, swipeThreshold]);

    const handleSwiping = useCallback(
      ({ event, absX, absY, dir }: SwipeEventData) => {
        const direction = dir as SwipeDirection;
        if (
          (direction === "Up" || direction === "Down" || swipingUpDown) &&
          !swipingLeftRight
        ) {
          if (!swipingUpDown) setSwipingUpDown(true);
          if (!slideVertically) return;
        }

        if (
          (direction === "Left" || direction === "Right") &&
          !swipingLeftRight
        ) {
          setSwipingLeftRight(true);
        }

        if (disableSwipe) return;

        if (stopPropagation) {
          event.preventDefault();
        }

        if (!isTransitioning) {
          const isSwipeLeftOrRight =
            direction === "Left" || direction === "Right";
          const isSwipeTopOrDown = direction === "Up" || direction === "Down";

          if (isSwipeLeftOrRight && slideVertically) return;
          if (isSwipeTopOrDown && !slideVertically) return;

          const sides: Record<SwipeDirection, number> = {
            Left: -1,
            Right: 1,
            Up: -1,
            Down: 1,
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
            transition: "none",
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
        swipingUpDown,
        swipingLeftRight,
        setCurrentSlideOffset,
        setSlideStyle,
      ]
    );

    const handleOnSwipedTo = useCallback(
      (swipeDirection: number, isFlick: boolean, velocity: number) => {
        let slideTo = currentIndex;

        if ((sufficientSwipe() || isFlick) && !isTransitioning) {
          slideTo += swipeDirection;
        }

        if (
          (swipeDirection === -1 && !canSlideLeft()) ||
          (swipeDirection === 1 && !canSlideRight())
        ) {
          slideTo = currentIndex;
        }

        // Compute duration from swipe velocity so the animation continues
        // at the same speed the user's finger was moving.
        // velocity is in px/ms from the swipe library.
        const swipedPercent = Math.abs(currentSlideOffset);
        const remainingPercent =
          slideTo !== currentIndex
            ? 100 - swipedPercent // traveling to next/prev slide
            : swipedPercent; // snapping back to current slide
        const dimension = slideVertically ? galleryHeight : galleryWidth;
        const remainingPx = (remainingPercent / 100) * dimension;
        // Clamp: at least 80ms (not jarring), at most slideDuration
        const velocityDuration =
          velocity > 0
            ? Math.min(
                slideDuration,
                Math.max(80, Math.round(remainingPx / velocity))
              )
            : slideDuration;

        slideToIndexCore(slideTo, undefined, false, velocityDuration);
      },
      [
        currentIndex,
        currentSlideOffset,
        isTransitioning,
        slideDuration,
        slideVertically,
        galleryWidth,
        galleryHeight,
        sufficientSwipe,
        canSlideLeft,
        canSlideRight,
        slideToIndexCore,
      ]
    );

    const handleOnSwiped = useCallback(
      ({ event, dir, velocity }: SwipeEventData) => {
        if (disableSwipe) return;

        if (stopPropagation) event.stopPropagation();
        resetSwipingDirection();

        const direction = dir as SwipeDirection;
        let swipeDirection = (direction === "Left" ? 1 : -1) * (isRTL ? -1 : 1);
        if (slideVertically) swipeDirection = direction === "Up" ? 1 : -1;

        const isSwipeUpOrDown = direction === "Up" || direction === "Down";
        const isSwipeLeftOrRight =
          direction === "Left" || direction === "Right";
        const isLeftRightFlick = velocity > flickThreshold && !isSwipeUpOrDown;
        const isTopDownFlick = velocity > flickThreshold && !isSwipeLeftOrRight;

        const isFlick = slideVertically ? isTopDownFlick : isLeftRightFlick;

        handleOnSwipedTo(swipeDirection, isFlick, velocity);
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

    // ============= Thumbnail Swipe Handlers =============
    const handleThumbnailSwiping = useCallback(
      ({ event, absX, absY, dir }: SwipeEventData) => {
        const direction = dir as SwipeDirection;
        const isVertical = isThumbnailVertical();
        const emptySpaceMargin = 0;

        if (isVertical) {
          if (
            (direction === "Left" ||
              direction === "Right" ||
              swipingLeftRight) &&
            !swipingUpDown
          ) {
            if (!swipingLeftRight) setSwipingLeftRight(true);
            return;
          }
          if ((direction === "Up" || direction === "Down") && !swipingUpDown) {
            setSwipingUpDown(true);
          }
        } else {
          if (
            (direction === "Up" || direction === "Down" || swipingUpDown) &&
            !swipingLeftRight
          ) {
            if (!swipingUpDown) setSwipingUpDown(true);
            return;
          }
          if (
            (direction === "Left" || direction === "Right") &&
            !swipingLeftRight
          ) {
            setSwipingLeftRight(true);
          }
        }

        const thumbsElement = thumbnailsRef.current;
        if (!thumbsElement) return;

        let newThumbsTranslate: number;
        let totalSwipeableLength: number;
        let hasSwipedPassedEnd: boolean;
        let hasSwipedPassedStart: boolean;
        let isThumbnailBarSmallerThanContainer: boolean;

        if (isVertical) {
          const slideY = direction === "Down" ? absY : -absY;
          newThumbsTranslate = thumbsSwipedTranslate + slideY;
          totalSwipeableLength =
            thumbsElement.scrollHeight -
            thumbnailsWrapperHeight +
            emptySpaceMargin;
          hasSwipedPassedEnd =
            Math.abs(newThumbsTranslate) > totalSwipeableLength;
          hasSwipedPassedStart = newThumbsTranslate > emptySpaceMargin;
          isThumbnailBarSmallerThanContainer =
            thumbsElement.scrollHeight <= thumbnailsWrapperHeight;
        } else {
          const slideX = direction === "Right" ? absX : -absX;
          newThumbsTranslate = thumbsSwipedTranslate + slideX;
          totalSwipeableLength =
            thumbsElement.scrollWidth -
            thumbnailsWrapperWidth +
            emptySpaceMargin;
          hasSwipedPassedEnd =
            Math.abs(newThumbsTranslate) > totalSwipeableLength;
          hasSwipedPassedStart = newThumbsTranslate > emptySpaceMargin;
          isThumbnailBarSmallerThanContainer =
            thumbsElement.scrollWidth <= thumbnailsWrapperWidth;
        }

        if (isThumbnailBarSmallerThanContainer) return;
        if ((direction === "Left" || direction === "Up") && hasSwipedPassedEnd)
          return;
        if (
          (direction === "Right" || direction === "Down") &&
          hasSwipedPassedStart
        )
          return;

        if (stopPropagation) event.stopPropagation();

        setThumbsTranslate(newThumbsTranslate);
        // Only set transition style once at start of swipe to avoid re-renders
        if (!isSwipingThumbnail) {
          setThumbsStyle({ transition: "none" });
          setIsSwipingThumbnail(true);
        }
      },
      [
        isThumbnailVertical,
        thumbnailsWrapperHeight,
        thumbnailsWrapperWidth,
        thumbsSwipedTranslate,
        stopPropagation,
        isSwipingThumbnail,
        swipingUpDown,
        swipingLeftRight,
        thumbnailsRef,
        setThumbsTranslate,
        setThumbsStyle,
        setIsSwipingThumbnail,
      ]
    );

    const handleOnThumbnailSwiped = useCallback(
      ({ velocity, dir }: SwipeEventData) => {
        resetSwipingDirection();

        const thumbsElement = thumbnailsRef.current;
        const isVertical = isThumbnailVertical();

        // Get scroll dimensions
        const scrollSize = isVertical
          ? (thumbsElement?.scrollHeight ?? 0)
          : (thumbsElement?.scrollWidth ?? 0);
        const wrapperSize = isVertical
          ? thumbnailsWrapperHeight
          : thumbnailsWrapperWidth;

        // Calculate momentum using utility function
        const { targetTranslate, transitionStyle } = calculateMomentum({
          velocity,
          direction: dir,
          isVertical,
          currentTranslate: thumbsTranslate,
          scrollSize,
          wrapperSize,
          slideDuration,
        });

        setThumbsStyle({ transition: transitionStyle });
        setThumbsTranslate(targetTranslate);
        setThumbsSwipedTranslate(targetTranslate);
        setIsSwipingThumbnail(false);
      },
      [
        resetSwipingDirection,
        thumbsTranslate,
        setThumbsTranslate,
        setThumbsSwipedTranslate,
        setIsSwipingThumbnail,
        setThumbsStyle,
        slideDuration,
        isThumbnailVertical,
        thumbnailsRef,
        thumbnailsWrapperHeight,
        thumbnailsWrapperWidth,
      ]
    );

    // ============= Keyboard Handler =============
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        imageGalleryRef.current?.classList.remove("image-gallery-using-mouse");

        if (disableKeyDown) return;

        const LEFT_ARROW = 37;
        const RIGHT_ARROW = 39;
        const ESC_KEY = 27;
        const key = parseInt(String(event.keyCode || event.which || 0), 10);

        switch (key) {
          case LEFT_ARROW:
            if (canSlideLeft() && !playPauseIntervalRef?.current) {
              slideLeft(event);
            }
            break;
          case RIGHT_ARROW:
            if (canSlideRight() && !playPauseIntervalRef?.current) {
              slideRight(event);
            }
            break;
          case ESC_KEY:
            if (isFullscreen && !useBrowserFullscreen) {
              exitFullScreen();
            }
            break;
          default:
            break;
        }
      },
      [
        disableKeyDown,
        canSlideLeft,
        canSlideRight,
        slideLeft,
        slideRight,
        isFullscreen,
        useBrowserFullscreen,
        exitFullScreen,
        playPauseIntervalRef,
      ]
    );

    // Keep ref updated with latest handleKeyDown
    handleKeyDownRef.current = handleKeyDown;

    // Stable keyboard handler that uses the ref (avoids stale closure)
    const stableHandleKeyDown = useCallback((event: KeyboardEvent) => {
      handleKeyDownRef.current?.(event);
    }, []);

    // ============= Mouse Handler =============
    const handleMouseDown = useCallback(() => {
      imageGalleryRef.current?.classList.add("image-gallery-using-mouse");
    }, []);

    const handleSlideKeyUp = useCallback(
      (event: React.KeyboardEvent) => {
        if (isEnterOrSpaceKey(event) && onClick) {
          onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
        }
      },
      [onClick]
    );

    // ============= Thumbnail Event Handlers =============
    const onThumbnailMouseOver = useCallback(
      (_event: React.MouseEvent | React.FocusEvent, index: number) => {
        if (thumbnailMouseOverTimerRef.current) {
          window.clearTimeout(thumbnailMouseOverTimerRef.current);
          thumbnailMouseOverTimerRef.current = null;
        }
        thumbnailMouseOverTimerRef.current = window.setTimeout(() => {
          slideToIndex(index);
          pause();
        }, 300);
      },
      [slideToIndex, pause]
    );

    const onThumbnailMouseLeave = useCallback(() => {
      if (thumbnailMouseOverTimerRef.current) {
        window.clearTimeout(thumbnailMouseOverTimerRef.current);
        thumbnailMouseOverTimerRef.current = null;
        if (autoPlay) {
          play();
        }
      }
    }, [autoPlay, play]);

    const handleThumbnailMouseOver = useCallback(
      (event: React.MouseEvent | React.FocusEvent, index: number) => {
        if (slideOnThumbnailOver) onThumbnailMouseOver(event, index);
      },
      [slideOnThumbnailOver, onThumbnailMouseOver]
    );

    const handleThumbnailKeyUp = useCallback(
      (event: React.KeyboardEvent, index: number) => {
        if (isEnterOrSpaceKey(event)) {
          onThumbnailClick?.(
            event as unknown as React.MouseEvent<HTMLButtonElement>,
            index
          );
        }
      },
      [onThumbnailClick]
    );

    const handleThumbnailClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        const parentParent = (event.target as HTMLElement).parentNode
          ?.parentNode as HTMLElement | undefined;
        if (parentParent?.blur) {
          parentParent.blur();
        }
        if (currentIndex !== index) {
          if (totalSlides === 2) {
            slideToIndexWithStyleReset(index, event);
          } else {
            slideToIndex(index, event);
          }
        }
        if (onThumbnailClick) {
          onThumbnailClick(event, index);
        }
      },
      [
        currentIndex,
        totalSlides,
        slideToIndex,
        slideToIndexWithStyleReset,
        onThumbnailClick,
      ]
    );

    const handleBulletClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        (event.target as HTMLElement).blur();
        if (currentIndex !== index) {
          if (totalSlides === 2) {
            slideToIndexWithStyleReset(index, event);
          } else {
            slideToIndex(index, event);
          }
        }
        if (onBulletClick) {
          onBulletClick(event, index);
        }
      },
      [
        currentIndex,
        totalSlides,
        slideToIndex,
        slideToIndexWithStyleReset,
        onBulletClick,
      ]
    );

    // ============= Image Handlers =============
    const handleImageError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        if (
          onErrorImageURL &&
          event.currentTarget.src.indexOf(onErrorImageURL) === -1
        ) {
          event.currentTarget.src = onErrorImageURL;
        }
      },
      [onErrorImageURL]
    );

    const handleImageLoaded = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>, original: string) => {
        const imageExists = loadedImagesRef.current[original];
        if (!imageExists) {
          loadedImagesRef.current[original] = true;
          if (onImageLoad) {
            onImageLoad(event);
          }
          // In vertical mode, recalculate height once the image's natural
          // dimensions become available so the slide container sizes correctly.
          if (slideVertically) {
            handleResizeRef.current?.();
          }
        }
      },
      [onImageLoad, slideVertically]
    );

    // ============= Resize Handling =============
    const handleResize = useCallback(() => {
      if (!imageGalleryRef.current) return;

      const galleryW = imageGalleryRef.current.offsetWidth;
      setGalleryWidth(galleryW);
      setGalleryHeight(imageGalleryRef.current.offsetHeight);

      if (imageGallerySlideWrapperRef.current) {
        if (slideVertically) {
          // In vertical mode, images have height:100%/width:auto, so the
          // wrapper's natural offsetHeight may collapse to 0 or be stale.
          // Instead, find the currently visible image and compute the slide
          // height from its natural aspect ratio and the available width.
          const wrapperWidth =
            imageGallerySlideWrapperRef.current.offsetWidth || galleryW;
          const img =
            imageGallerySlideWrapperRef.current.querySelector<HTMLImageElement>(
              ".image-gallery-center .image-gallery-image"
            ) ??
            imageGallerySlideWrapperRef.current.querySelector<HTMLImageElement>(
              ".image-gallery-image"
            );

          if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const computedHeight = Math.round(wrapperWidth * aspectRatio);
            // Respect the max-height constraint from CSS (100vh - 80px)
            const maxHeight = window.innerHeight - 80;
            setGallerySlideWrapperHeight(Math.min(computedHeight, maxHeight));
          } else {
            // Fallback: if no image loaded yet, use the wrapper's current height
            setGallerySlideWrapperHeight(
              imageGallerySlideWrapperRef.current.offsetHeight
            );
          }
        } else {
          setGallerySlideWrapperHeight(
            imageGallerySlideWrapperRef.current.offsetHeight
          );
        }
      }
    }, [slideVertically]);

    const initSlideWrapperResizeObserver = useCallback(
      (element: RefObject<HTMLElement | null>) => {
        if (!element?.current) return;

        resizeSlideWrapperObserverRef.current = new ResizeObserver(
          debounce((entries: ResizeObserverEntry[]) => {
            if (!entries) return;
            entries.forEach(() => {
              handleResize();
            });
          }, 50)
        );

        resizeSlideWrapperObserverRef.current.observe(element.current);
      },
      [handleResize]
    );

    const removeSlideWrapperResizeObserver = useCallback(() => {
      if (
        resizeSlideWrapperObserverRef.current &&
        imageGallerySlideWrapperRef.current
      ) {
        resizeSlideWrapperObserverRef.current.unobserve(
          imageGallerySlideWrapperRef.current
        );
        resizeSlideWrapperObserverRef.current = null;
      }
    }, []);

    // ============= Refs for Stable Effect Callbacks =============
    const handleMouseDownRef = useRef<(() => void) | null>(null);
    const handleScreenChangeRef = useRef<(() => void) | null>(null);
    const initSlideWrapperResizeObserverRef = useRef<
      ((element: RefObject<HTMLElement | null>) => void) | null
    >(null);
    const initThumbnailResizeObserverRef = useRef<
      ((element: RefObject<HTMLElement | null>) => void) | null
    >(null);
    const removeSlideWrapperResizeObserverRef = useRef<(() => void) | null>(
      null
    );
    const removeThumbnailsResizeObserverRef = useRef<(() => void) | null>(null);
    const handleResizeRef = useRef<(() => void) | null>(null);

    // Keep refs updated with latest function references
    handleMouseDownRef.current = handleMouseDown;
    handleScreenChangeRef.current = handleScreenChange;
    initSlideWrapperResizeObserverRef.current = initSlideWrapperResizeObserver;
    initThumbnailResizeObserverRef.current = initThumbnailResizeObserver;
    removeSlideWrapperResizeObserverRef.current =
      removeSlideWrapperResizeObserver;
    removeThumbnailsResizeObserverRef.current = removeThumbnailsResizeObserver;
    handleResizeRef.current = handleResize;

    // Stable handlers for mount effect - these never change identity
    const stableHandleMouseDown = useCallback(() => {
      handleMouseDownRef.current?.();
    }, []);

    const stableHandleScreenChange = useCallback(() => {
      handleScreenChangeRef.current?.();
    }, []);

    // ============= Render Helpers =============
    const defaultRenderItem = useCallback(
      (item: GalleryItem) => {
        const handleError = onImageError || handleImageError;

        return (
          <Item
            description={item.description}
            fullscreen={item.fullscreen}
            handleImageLoaded={handleImageLoaded}
            isFullscreen={isFullscreen}
            loading={item.loading}
            original={item.original}
            originalAlt={item.originalAlt}
            originalHeight={item.originalHeight}
            originalTitle={item.originalTitle}
            originalWidth={item.originalWidth}
            sizes={item.sizes}
            srcSet={item.srcSet}
            onImageError={handleError}
          />
        );
      },
      [isFullscreen, onImageError, handleImageError, handleImageLoaded]
    );

    const defaultRenderThumbInner = useCallback(
      (item: GalleryItem) => {
        const handleError = onThumbnailError || handleImageError;

        return (
          <span className="image-gallery-thumbnail-inner">
            <img
              alt={item.thumbnailAlt}
              className="image-gallery-thumbnail-image"
              height={item.thumbnailHeight}
              loading={item.thumbnailLoading}
              src={item.thumbnail}
              title={item.thumbnailTitle}
              width={item.thumbnailWidth}
              onError={handleError}
            />
            {item.thumbnailLabel && (
              <div className="image-gallery-thumbnail-label">
                {item.thumbnailLabel}
              </div>
            )}
          </span>
        );
      },
      [onThumbnailError, handleImageError]
    );

    // ============= Computed Container Style =============
    const containerStyle = useMemo(() => {
      return getContainerStyle({
        useTranslate3D,
        slideVertically,
      });
    }, [getContainerStyle, useTranslate3D, slideVertically]);

    // ============= Build Slide Items =============
    const slideItems = useMemo(() => {
      const slides: React.ReactNode[] = [];
      const thumbnails: React.ReactNode[] = [];
      const bullets: React.ReactNode[] = [];

      // Get extended slides (with clones for infinite mode)
      const { extendedItems, getSlideKey, getRealIndex } = getExtendedSlides();

      // Build slides from extended items (includes clones)
      extendedItems.forEach((item, displayIdx) => {
        const realIndex = getRealIndex(displayIdx);
        const alignment = getAlignmentClass(displayIdx);
        const originalClass = item.originalClass
          ? ` ${item.originalClass}`
          : "";
        const handleRenderItemFn =
          item.renderItem || renderItem || defaultRenderItem;

        // For lazy loading, check the real index
        const showItem =
          !lazyLoad || alignment || lazyLoadedRef.current[realIndex];
        if (showItem && lazyLoad && !lazyLoadedRef.current[realIndex]) {
          lazyLoadedRef.current[realIndex] = true;
        }

        slides.push(
          <Slide
            key={getSlideKey(displayIdx)}
            alignment={alignment}
            index={realIndex}
            originalClass={originalClass}
            onClick={onClick}
            onKeyUp={handleSlideKeyUp}
            onMouseLeave={onMouseLeave}
            onMouseOver={onMouseOver}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
          >
            {showItem ? (
              handleRenderItemFn(item)
            ) : (
              <div style={{ height: "100%" }} />
            )}
          </Slide>
        );
      });

      // Thumbnails and bullets use the original items array (no clones)
      items.forEach((item, index) => {
        const thumbnailClass = item.thumbnailClass
          ? ` ${item.thumbnailClass}`
          : "";
        const handleRenderThumbInnerFn =
          item.renderThumbInner || renderThumbInner || defaultRenderThumbInner;

        if (showThumbnails && item.thumbnail) {
          thumbnails.push(
            <Thumbnail
              key={`thumbnail-${index}`}
              index={index}
              isActive={currentIndex === index}
              thumbnailClass={thumbnailClass}
              onClick={(event) => handleThumbnailClick(event, index)}
              onFocus={(event) => handleThumbnailMouseOver(event, index)}
              onKeyUp={(event) => handleThumbnailKeyUp(event, index)}
              onMouseLeave={slideOnThumbnailOver ? onThumbnailMouseLeave : null}
              onMouseOver={(event) => handleThumbnailMouseOver(event, index)}
            >
              {handleRenderThumbInnerFn(item)}
            </Thumbnail>
          );
        }

        if (showBullets) {
          bullets.push(
            <Bullet
              key={`bullet-${index}`}
              bulletClass={item.bulletClass}
              index={index}
              isActive={currentIndex === index}
              onClick={(event) => handleBulletClick(event, index)}
            />
          );
        }
      });

      return { slides, thumbnails, bullets };
    }, [
      items,
      currentIndex,
      getExtendedSlides,
      getAlignmentClass,
      lazyLoad,
      showThumbnails,
      showBullets,
      slideOnThumbnailOver,
      defaultRenderItem,
      defaultRenderThumbInner,
      renderItem,
      renderThumbInner,
      onClick,
      handleSlideKeyUp,
      onTouchMove,
      onTouchEnd,
      onTouchStart,
      onMouseOver,
      onMouseLeave,
      onThumbnailMouseLeave,
      handleThumbnailMouseOver,
      handleThumbnailKeyUp,
      handleThumbnailClick,
      handleBulletClick,
    ]);

    // ============= Effects =============

    // Initialize on mount - uses stable refs to avoid stale closures
    useEffect(() => {
      const galleryElement = imageGalleryRef.current;
      const useWindowKey = useWindowKeyDown; // Capture initial value

      if (useWindowKey) {
        window.addEventListener("keydown", stableHandleKeyDown);
      } else {
        galleryElement?.addEventListener("keydown", stableHandleKeyDown);
      }

      window.addEventListener("mousedown", stableHandleMouseDown);
      initSlideWrapperResizeObserverRef.current?.(imageGallerySlideWrapperRef);
      initThumbnailResizeObserverRef.current?.(thumbnailsWrapperRef);

      // Add screen change events
      screenChangeEvents.forEach((eventName) => {
        document.addEventListener(eventName, stableHandleScreenChange);
      });

      return () => {
        // Cleanup
        window.removeEventListener("mousedown", stableHandleMouseDown);
        window.removeEventListener("keydown", stableHandleKeyDown);
        galleryElement?.removeEventListener("keydown", stableHandleKeyDown);

        screenChangeEvents.forEach((eventName) => {
          document.removeEventListener(eventName, stableHandleScreenChange);
        });

        removeSlideWrapperResizeObserverRef.current?.();
        removeThumbnailsResizeObserverRef.current?.();
      };
    }, [
      useWindowKeyDown,
      stableHandleKeyDown,
      stableHandleMouseDown,
      stableHandleScreenChange,
      thumbnailsWrapperRef,
    ]);

    // Handle thumbnail position changes
    useEffect(() => {
      removeSlideWrapperResizeObserverRef.current?.();
      removeThumbnailsResizeObserverRef.current?.();
      initSlideWrapperResizeObserverRef.current?.(imageGallerySlideWrapperRef);
      initThumbnailResizeObserverRef.current?.(thumbnailsWrapperRef);
    }, [thumbnailPosition, thumbnailsWrapperRef]);

    // Handle showThumbnails changes
    useEffect(() => {
      if (showThumbnails) {
        initThumbnailResizeObserverRef.current?.(thumbnailsWrapperRef);
      } else {
        removeThumbnailsResizeObserverRef.current?.();
      }
      handleResizeRef.current?.();
    }, [showThumbnails, thumbnailsWrapperRef]);

    // Handle slideVertically changes - reinitialize observers and recalculate dimensions
    useEffect(() => {
      removeSlideWrapperResizeObserverRef.current?.();
      removeThumbnailsResizeObserverRef.current?.();
      initSlideWrapperResizeObserverRef.current?.(imageGallerySlideWrapperRef);
      initThumbnailResizeObserverRef.current?.(thumbnailsWrapperRef);
      handleResizeRef.current?.();
    }, [slideVertically, thumbnailsWrapperRef]);

    // Handle items changes - reset lazyLoaded
    useEffect(() => {
      if (lazyLoad) {
        lazyLoadedRef.current = [];
      }
      handleResizeRef.current?.();
    }, [items, lazyLoad]);

    // ============= Imperative Handle for Refs =============
    useImperativeHandle(ref, () => ({
      play,
      pause,
      togglePlay,
      fullScreen,
      exitFullScreen,
      toggleFullScreen,
      slideToIndex: slideToIndexCore,
      getCurrentIndex: () => currentIndex,
    }));

    // ============= Render =============
    const { slides, thumbnails, bullets } = slideItems;

    const slideWrapperClass = clsx(
      "image-gallery-slide-wrapper",
      getThumbnailPositionClassName(thumbnailPosition),
      { "image-gallery-rtl": isRTL }
    );

    const slideWrapper = (
      <div ref={imageGallerySlideWrapperRef} className={slideWrapperClass}>
        {renderCustomControls && renderCustomControls()}
        {canSlide ? (
          <>
            {showNav && (
              <>
                {slideVertically
                  ? renderTopNav(slideLeft, !canSlideLeft())
                  : renderLeftNav(slideLeft, !canSlideLeft())}
                {slideVertically
                  ? renderBottomNav(slideRight, !canSlideRight())
                  : renderRightNav(slideRight, !canSlideRight())}
              </>
            )}
            <SwipeWrapper
              className="image-gallery-swipe"
              delta={0}
              onSwiped={handleOnSwiped}
              onSwiping={handleSwiping}
            >
              <div
                className="image-gallery-slides"
                style={
                  slideVertically
                    ? { height: gallerySlideWrapperHeight }
                    : undefined
                }
              >
                <div
                  className={clsx("image-gallery-slides-container", {
                    vertical: slideVertically,
                  })}
                  style={containerStyle}
                >
                  {slides}
                </div>
              </div>
            </SwipeWrapper>
          </>
        ) : (
          <div
            className="image-gallery-slides"
            style={
              slideVertically
                ? { height: gallerySlideWrapperHeight }
                : undefined
            }
          >
            <div
              className={clsx("image-gallery-slides-container", {
                vertical: slideVertically,
              })}
              style={containerStyle}
            >
              {slides}
            </div>
          </div>
        )}
        {showPlayButton && renderPlayPauseButton(togglePlay, isPlaying)}
        {showBullets && (
          <BulletNav
            bullets={bullets}
            currentIndex={currentIndex}
            maxBullets={maxBullets}
            slideVertically={slideVertically}
          />
        )}
        {showFullscreenButton &&
          renderFullscreenButton(toggleFullScreen, isFullscreen)}
        {showIndex && (
          <IndexIndicator
            currentIndex={currentIndex}
            indexSeparator={indexSeparator}
            totalItems={totalSlides}
          />
        )}
      </div>
    );

    const igClass = clsx("image-gallery", additionalClass, {
      "fullscreen-modal": modalFullscreen,
    });

    const igContentClass = clsx(
      "image-gallery-content",
      getThumbnailPositionClassName(thumbnailPosition),
      { fullscreen: isFullscreen }
    );

    return (
      <div ref={imageGalleryRef} aria-live="polite" className={igClass}>
        <div className={igContentClass}>
          {(thumbnailPosition === "bottom" || thumbnailPosition === "right") &&
            slideWrapper}
          {showThumbnails && thumbnails.length > 0 && (
            <ThumbnailBar
              disableThumbnailSwipe={disableThumbnailSwipe}
              isRTL={isRTL}
              thumbnailBarHeight={getThumbnailBarHeight(
                gallerySlideWrapperHeight
              )}
              thumbnailPosition={thumbnailPosition}
              thumbnails={thumbnails}
              thumbnailsRef={thumbnailsRef}
              thumbnailStyle={getThumbnailStyle()}
              thumbnailsWrapperRef={thumbnailsWrapperRef}
              onSwiped={handleOnThumbnailSwiped}
              onSwiping={handleThumbnailSwiping}
            />
          )}
          {(thumbnailPosition === "top" || thumbnailPosition === "left") &&
            slideWrapper}
        </div>
      </div>
    );
  }
);

export default ImageGallery;
