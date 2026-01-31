import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { arrayOf, bool, func, number, oneOf, shape, string } from "prop-types";
import { DOWN, LEFT, RIGHT, UP } from "react-swipeable";
import Bullet from "src/components/Bullet";
import BulletNav from "src/components/BulletNav";
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

// Auto-inject styles when module loads
injectStyles();

// ============= Constants =============
const screenChangeEvents = [
  "fullscreenchange",
  "MSFullscreenChange",
  "mozfullscreenchange",
  "webkitfullscreenchange",
];

const imageSetType = arrayOf(
  shape({
    srcSet: string,
    media: string,
  })
);

// ============= Helper Functions =============
function isEnterOrSpaceKey(event) {
  const key = parseInt(event.keyCode || event.which || 0, 10);
  const ENTER_KEY_CODE = 13;
  const SPACEBAR_KEY_CODE = 32;
  return key === ENTER_KEY_CODE || key === SPACEBAR_KEY_CODE;
}

function getThumbnailPositionClassName(thumbnailPosition) {
  const classNames = {
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
const ImageGallery = forwardRef(function ImageGallery(props, ref) {
  // ============= Props with Defaults =============
  const {
    additionalClass = "",
    autoPlay = false,
    disableKeyDown = false,
    disableSwipe = false,
    disableThumbnailScroll = false,
    disableThumbnailSwipe = false,
    flickThreshold = 0.4,
    indexSeparator = " / ",
    infinite = true,
    isRTL = false,
    items,
    lazyLoad = false,
    onBeforeSlide = null,
    onBulletClick = null,
    onClick = null,
    onErrorImageURL = "",
    onImageError = null,
    onImageLoad = null,
    onMouseLeave = null,
    onMouseOver = null,
    onPause = null,
    onPlay = null,
    onScreenChange = null,
    onSlide = null,
    onThumbnailClick = null,
    onThumbnailError = null,
    onTouchEnd = null,
    onTouchMove = null,
    onTouchStart = null,
    renderBottomNav = (onClick, disabled) => (
      <BottomNav disabled={disabled} onClick={onClick} />
    ),
    renderCustomControls = null,
    renderFullscreenButton = (onClick, isFullscreen) => (
      <Fullscreen isFullscreen={isFullscreen} onClick={onClick} />
    ),
    renderItem = null,
    renderLeftNav = (onClick, disabled) => (
      <LeftNav disabled={disabled} onClick={onClick} />
    ),
    renderPlayPauseButton = (onClick, isPlaying) => (
      <PlayPause isPlaying={isPlaying} onClick={onClick} />
    ),
    renderRightNav = (onClick, disabled) => (
      <RightNav disabled={disabled} onClick={onClick} />
    ),
    renderThumbInner = null,
    renderTopNav = (onClick, disabled) => (
      <TopNav disabled={disabled} onClick={onClick} />
    ),
    showBullets = false,
    showFullscreenButton = true,
    showIndex = false,
    showNav = true,
    showPlayButton = true,
    showThumbnails = true,
    slideDuration = 450,
    slideInterval = 3000,
    slideOnThumbnailOver = false,
    slideVertically = false,
    startIndex = 0,
    stopPropagation = false,
    swipeThreshold = 30,
    swipingTransitionDuration = 0,
    thumbnailPosition = "bottom",
    useBrowserFullscreen = true,
    useTranslate3D = true,
    useWindowKeyDown = true,
  } = props;

  // ============= Refs =============
  const imageGalleryRef = useRef(null);
  const imageGallerySlideWrapperRef = useRef(null);
  const thumbnailMouseOverTimerRef = useRef(null);
  const loadedImagesRef = useRef({});
  const lazyLoadedRef = useRef([]);
  const resizeSlideWrapperObserverRef = useRef(null);
  const handleKeyDownRef = useRef(null);

  // ============= Local State =============
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [galleryHeight, setGalleryHeight] = useState(0);
  const [gallerySlideWrapperHeight, setGallerySlideWrapperHeight] = useState(0);
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
    ({ event, absX, absY, dir }) => {
      if ((dir === UP || dir === DOWN || swipingUpDown) && !swipingLeftRight) {
        if (!swipingUpDown) setSwipingUpDown(true);
        if (!slideVertically) return;
      }

      if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
        setSwipingLeftRight(true);
      }

      if (disableSwipe) return;

      if (stopPropagation) {
        event.preventDefault();
      }

      if (!isTransitioning) {
        const isSwipeLeftOrRight = dir === LEFT || dir === RIGHT;
        const isSwipeTopOrDown = dir === UP || dir === DOWN;

        if (isSwipeLeftOrRight && slideVertically) return;
        if (isSwipeTopOrDown && !slideVertically) return;

        const sides = {
          [LEFT]: -1,
          [RIGHT]: 1,
          [UP]: -1,
          [DOWN]: 1,
        };

        const side = sides[dir];
        let slideOffset = (absX / galleryWidth) * 100;
        if (slideVertically) {
          slideOffset = (absY / galleryHeight) * 100;
        }

        if (Math.abs(slideOffset) >= 100) {
          slideOffset = 100;
        }

        const swipingTransition = {
          transition: `transform ${swipingTransitionDuration}ms ease-out`,
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
      swipingTransitionDuration,
      swipingUpDown,
      swipingLeftRight,
      setCurrentSlideOffset,
      setSlideStyle,
    ]
  );

  const handleOnSwipedTo = useCallback(
    (swipeDirection, isFlick) => {
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

      slideToIndexCore(slideTo);
    },
    [
      currentIndex,
      isTransitioning,
      sufficientSwipe,
      canSlideLeft,
      canSlideRight,
      slideToIndexCore,
    ]
  );

  const handleOnSwiped = useCallback(
    ({ event, dir, velocity }) => {
      if (disableSwipe) return;

      if (stopPropagation) event.stopPropagation();
      resetSwipingDirection();

      let swipeDirection = (dir === LEFT ? 1 : -1) * (isRTL ? -1 : 1);
      if (slideVertically) swipeDirection = dir === UP ? 1 : -1;

      const isSwipeUpOrDown = dir === UP || dir === DOWN;
      const isSwipeLeftOrRight = dir === LEFT || dir === RIGHT;
      const isLeftRightFlick = velocity > flickThreshold && !isSwipeUpOrDown;
      const isTopDownFlick = velocity > flickThreshold && !isSwipeLeftOrRight;

      const isFlick = slideVertically ? isTopDownFlick : isLeftRightFlick;

      handleOnSwipedTo(swipeDirection, isFlick);
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
    ({ event, absX, absY, dir }) => {
      const isVertical = isThumbnailVertical();
      const emptySpaceMargin = 20;

      if (isVertical) {
        if (
          (dir === LEFT || dir === RIGHT || swipingLeftRight) &&
          !swipingUpDown
        ) {
          if (!swipingLeftRight) setSwipingLeftRight(true);
          return;
        }
        if ((dir === UP || dir === DOWN) && !swipingUpDown) {
          setSwipingUpDown(true);
        }
      } else {
        if (
          (dir === UP || dir === DOWN || swipingUpDown) &&
          !swipingLeftRight
        ) {
          if (!swipingUpDown) setSwipingUpDown(true);
          return;
        }
        if ((dir === LEFT || dir === RIGHT) && !swipingLeftRight) {
          setSwipingLeftRight(true);
        }
      }

      const thumbsElement = thumbnailsRef.current;
      if (!thumbsElement) return;

      let newThumbsTranslate;
      let totalSwipeableLength;
      let hasSwipedPassedEnd;
      let hasSwipedPassedStart;
      let isThumbnailBarSmallerThanContainer;

      if (isVertical) {
        const slideY = dir === DOWN ? absY : -absY;
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
        const slideX = dir === RIGHT ? absX : -absX;
        newThumbsTranslate = thumbsSwipedTranslate + slideX;
        totalSwipeableLength =
          thumbsElement.scrollWidth - thumbnailsWrapperWidth + emptySpaceMargin;
        hasSwipedPassedEnd =
          Math.abs(newThumbsTranslate) > totalSwipeableLength;
        hasSwipedPassedStart = newThumbsTranslate > emptySpaceMargin;
        isThumbnailBarSmallerThanContainer =
          thumbsElement.scrollWidth <= thumbnailsWrapperWidth;
      }

      if (isThumbnailBarSmallerThanContainer) return;
      if ((dir === LEFT || dir === UP) && hasSwipedPassedEnd) return;
      if ((dir === RIGHT || dir === DOWN) && hasSwipedPassedStart) return;

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

  const handleOnThumbnailSwiped = useCallback(() => {
    resetSwipingDirection();
    setThumbsSwipedTranslate(thumbsTranslate);
    // Keep transition: none - thumbnails are already at final position
    // Transition will be set by slideThumbnailBar when currentIndex changes
  }, [resetSwipingDirection, thumbsTranslate, setThumbsSwipedTranslate]);

  // ============= Keyboard Handler =============
  const handleKeyDown = useCallback(
    (event) => {
      imageGalleryRef.current?.classList.remove("image-gallery-using-mouse");

      if (disableKeyDown) return;

      const LEFT_ARROW = 37;
      const RIGHT_ARROW = 39;
      const ESC_KEY = 27;
      const key = parseInt(event.keyCode || event.which || 0, 10);

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
  const stableHandleKeyDown = useCallback((event) => {
    handleKeyDownRef.current?.(event);
  }, []);

  // ============= Mouse Handler =============
  const handleMouseDown = useCallback(() => {
    imageGalleryRef.current?.classList.add("image-gallery-using-mouse");
  }, []);

  const handleSlideKeyUp = useCallback(
    (event) => {
      if (isEnterOrSpaceKey(event) && onClick) {
        onClick(event);
      }
    },
    [onClick]
  );

  // ============= Thumbnail Event Handlers =============
  const onThumbnailMouseOver = useCallback(
    (event, index) => {
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
    (event, index) => {
      if (slideOnThumbnailOver) onThumbnailMouseOver(event, index);
    },
    [slideOnThumbnailOver, onThumbnailMouseOver]
  );

  const handleThumbnailKeyUp = useCallback(
    (event, index) => {
      if (isEnterOrSpaceKey(event)) {
        onThumbnailClick?.(event, index);
      }
    },
    [onThumbnailClick]
  );

  const handleThumbnailClick = useCallback(
    (event, index) => {
      event.target.parentNode.parentNode.blur();
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
    (event, index) => {
      event.target.blur();
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
    (event) => {
      if (onErrorImageURL && event.target.src.indexOf(onErrorImageURL) === -1) {
        event.target.src = onErrorImageURL;
      }
    },
    [onErrorImageURL]
  );

  const handleImageLoaded = useCallback(
    (event, original) => {
      const imageExists = loadedImagesRef.current[original];
      if (!imageExists && onImageLoad) {
        loadedImagesRef.current[original] = true;
        onImageLoad(event);
      }
    },
    [onImageLoad]
  );

  // ============= Resize Handling =============
  const handleResize = useCallback(() => {
    if (!imageGalleryRef.current) return;

    setGalleryWidth(imageGalleryRef.current.offsetWidth);
    setGalleryHeight(imageGalleryRef.current.offsetHeight);

    if (imageGallerySlideWrapperRef.current) {
      setGallerySlideWrapperHeight(
        imageGallerySlideWrapperRef.current.offsetHeight
      );
    }
  }, []);

  const initSlideWrapperResizeObserver = useCallback(
    (element) => {
      if (!element?.current) return;

      resizeSlideWrapperObserverRef.current = new ResizeObserver(
        debounce((entries) => {
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
  // These refs hold the latest function references, enabling stable callbacks
  // that don't cause effect re-runs but always use fresh function implementations
  const handleMouseDownRef = useRef(null);
  const handleScreenChangeRef = useRef(null);
  const initSlideWrapperResizeObserverRef = useRef(null);
  const initThumbnailResizeObserverRef = useRef(null);
  const removeSlideWrapperResizeObserverRef = useRef(null);
  const removeThumbnailsResizeObserverRef = useRef(null);
  const handleResizeRef = useRef(null);

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
    (item) => {
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
    (item) => {
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
    const slides = [];
    const thumbnails = [];
    const bullets = [];

    // Get extended slides (with clones for infinite mode)
    const { extendedItems, getSlideKey, getRealIndex } = getExtendedSlides();

    // Build slides from extended items (includes clones)
    extendedItems.forEach((item, displayIdx) => {
      const realIndex = getRealIndex(displayIdx);
      const alignment = getAlignmentClass(displayIdx);
      const originalClass = item.originalClass ? ` ${item.originalClass}` : "";
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

  // Handle items changes - reset lazyLoaded
  useEffect(() => {
    if (lazyLoad) {
      lazyLoadedRef.current = [];
    }
    handleResizeRef.current?.();
  }, [items, lazyLoad]);

  // Reset swiping thumbnail state after transitioning ends
  useEffect(() => {
    if (!isTransitioning && isSwipingThumbnail) {
      setIsSwipingThumbnail(false);
    }
  }, [isTransitioning, isSwipingThumbnail, setIsSwipingThumbnail]);

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
              style={slideVertically ? { height: gallerySlideWrapperHeight } : undefined}
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
          style={slideVertically ? { height: gallerySlideWrapperHeight } : undefined}
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
        <BulletNav bullets={bullets} slideVertically={slideVertically} />
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
});

// ============= PropTypes =============
ImageGallery.propTypes = {
  additionalClass: string,
  autoPlay: bool,
  disableKeyDown: bool,
  disableSwipe: bool,
  disableThumbnailScroll: bool,
  disableThumbnailSwipe: bool,
  flickThreshold: number,
  indexSeparator: string,
  infinite: bool,
  isRTL: bool,
  items: arrayOf(
    shape({
      bulletClass: string,
      bulletOnClick: func,
      description: string,
      original: string,
      originalHeight: number,
      originalWidth: number,
      loading: string,
      thumbnailHeight: number,
      thumbnailWidth: number,
      thumbnailLoading: string,
      fullscreen: string,
      originalAlt: string,
      originalTitle: string,
      thumbnail: string,
      thumbnailAlt: string,
      thumbnailLabel: string,
      thumbnailTitle: string,
      originalClass: string,
      thumbnailClass: string,
      renderItem: func,
      renderThumbInner: func,
      imageSet: imageSetType,
      srcSet: string,
      sizes: string,
    })
  ).isRequired,
  lazyLoad: bool,
  renderBottomNav: func,
  renderCustomControls: func,
  renderFullscreenButton: func,
  renderItem: func,
  renderLeftNav: func,
  renderPlayPauseButton: func,
  renderRightNav: func,
  renderThumbInner: func,
  renderTopNav: func,
  showBullets: bool,
  showFullscreenButton: bool,
  showIndex: bool,
  showNav: bool,
  showPlayButton: bool,
  showThumbnails: bool,
  slideDuration: number,
  slideInterval: number,
  slideOnThumbnailOver: bool,
  slideVertically: bool,
  startIndex: number,
  stopPropagation: bool,
  swipeThreshold: number,
  swipingTransitionDuration: number,
  thumbnailPosition: oneOf(["top", "bottom", "left", "right"]),
  useBrowserFullscreen: bool,
  useTranslate3D: bool,
  useWindowKeyDown: bool,
  onBeforeSlide: func,
  onBulletClick: func,
  onClick: func,
  onErrorImageURL: string,
  onImageError: func,
  onImageLoad: func,
  onMouseLeave: func,
  onMouseOver: func,
  onPause: func,
  onPlay: func,
  onScreenChange: func,
  onSlide: func,
  onThumbnailClick: func,
  onThumbnailError: func,
  onTouchEnd: func,
  onTouchMove: func,
  onTouchStart: func,
};

ImageGallery.defaultProps = {
  onErrorImageURL: "",
  additionalClass: "",
  showNav: true,
  autoPlay: false,
  lazyLoad: false,
  infinite: true,
  showIndex: false,
  showBullets: false,
  showThumbnails: true,
  showPlayButton: true,
  showFullscreenButton: true,
  disableThumbnailScroll: false,
  disableKeyDown: false,
  disableSwipe: false,
  disableThumbnailSwipe: false,
  useTranslate3D: true,
  isRTL: false,
  useBrowserFullscreen: true,
  flickThreshold: 0.4,
  stopPropagation: false,
  indexSeparator: " / ",
  thumbnailPosition: "bottom",
  startIndex: 0,
  slideDuration: 450,
  swipingTransitionDuration: 0,
  onSlide: null,
  onBeforeSlide: null,
  onScreenChange: null,
  onPause: null,
  onPlay: null,
  onClick: null,
  onImageLoad: null,
  onImageError: null,
  onTouchMove: null,
  onTouchEnd: null,
  onTouchStart: null,
  onMouseOver: null,
  onMouseLeave: null,
  onBulletClick: null,
  onThumbnailError: null,
  onThumbnailClick: null,
  renderCustomControls: null,
  renderThumbInner: null,
  renderItem: null,
  slideInterval: 3000,
  slideOnThumbnailOver: false,
  swipeThreshold: 30,
  slideVertically: false,
  renderLeftNav: (onClick, disabled) => (
    <LeftNav disabled={disabled} onClick={onClick} />
  ),
  renderRightNav: (onClick, disabled) => (
    <RightNav disabled={disabled} onClick={onClick} />
  ),
  renderTopNav: (onClick, disabled) => (
    <TopNav disabled={disabled} onClick={onClick} />
  ),
  renderBottomNav: (onClick, disabled) => (
    <BottomNav disabled={disabled} onClick={onClick} />
  ),
  renderPlayPauseButton: (onClick, isPlaying) => (
    <PlayPause isPlaying={isPlaying} onClick={onClick} />
  ),
  renderFullscreenButton: (onClick, isFullscreen) => (
    <Fullscreen isFullscreen={isFullscreen} onClick={onClick} />
  ),
  useWindowKeyDown: true,
};

export default ImageGallery;
