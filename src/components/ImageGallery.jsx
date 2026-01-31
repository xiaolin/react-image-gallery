import clsx from "clsx";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import debounce from "lodash-es/debounce";
import { LEFT, RIGHT, UP, DOWN } from "react-swipeable";
import { arrayOf, bool, func, number, oneOf, shape, string } from "prop-types";

// Components
import Item from "src/components/Item";
import Fullscreen from "src/components/controls/Fullscreen";
import LeftNav from "src/components/controls/LeftNav";
import RightNav from "src/components/controls/RightNav";
import PlayPause from "src/components/controls/PlayPause";
import SwipeWrapper from "src/components/SwipeWrapper";
import TopNav from "src/components/controls/TopNav";
import BottomNav from "src/components/controls/BottomNav";
import Slide from "src/components/Slide";
import Thumbnail from "src/components/Thumbnail";
import BulletNav from "src/components/BulletNav";
import IndexIndicator from "src/components/IndexIndicator";
import Bullet from "src/components/Bullet";
import ThumbnailBar from "src/components/ThumbnailBar";
import { injectStyles } from "src/components/styleInjector";

// Custom Hooks
import { useGalleryNavigation } from "src/components/hooks/useGalleryNavigation";
import { useFullscreen } from "src/components/hooks/useFullscreen";
import { useAutoPlay } from "src/components/hooks/useAutoPlay";
import { useThumbnails } from "src/components/hooks/useThumbnails";

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
      <BottomNav onClick={onClick} disabled={disabled} />
    ),
    renderCustomControls = null,
    renderFullscreenButton = (onClick, isFullscreen) => (
      <Fullscreen onClick={onClick} isFullscreen={isFullscreen} />
    ),
    renderItem = null,
    renderLeftNav = (onClick, disabled) => (
      <LeftNav onClick={onClick} disabled={disabled} />
    ),
    renderPlayPauseButton = (onClick, isPlaying) => (
      <PlayPause onClick={onClick} isPlaying={isPlaying} />
    ),
    renderRightNav = (onClick, disabled) => (
      <RightNav onClick={onClick} disabled={disabled} />
    ),
    renderThumbInner = null,
    renderTopNav = (onClick, disabled) => (
      <TopNav onClick={onClick} disabled={disabled} />
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
    swipingThumbnailTransitionDuration = 0,
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
    getSlideStyle,
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

      const swipingTransition = {
        transition: `transform ${swipingThumbnailTransitionDuration}ms ease-out`,
      };

      setThumbsTranslate(newThumbsTranslate);
      setThumbsStyle(swipingTransition);
    },
    [
      isThumbnailVertical,
      thumbnailsWrapperHeight,
      thumbnailsWrapperWidth,
      thumbsSwipedTranslate,
      stopPropagation,
      swipingThumbnailTransitionDuration,
      swipingUpDown,
      swipingLeftRight,
      thumbnailsRef,
      setThumbsTranslate,
      setThumbsStyle,
    ]
  );

  const handleOnThumbnailSwiped = useCallback(() => {
    resetSwipingDirection();
    setIsSwipingThumbnail(true);
    setThumbsSwipedTranslate(thumbsTranslate);
    setThumbsStyle({ transition: `all ${slideDuration}ms ease-out` });
  }, [
    resetSwipingDirection,
    thumbsTranslate,
    slideDuration,
    setIsSwipingThumbnail,
    setThumbsSwipedTranslate,
    setThumbsStyle,
  ]);

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
          onImageError={handleError}
          original={item.original}
          originalAlt={item.originalAlt}
          originalHeight={item.originalHeight}
          originalWidth={item.originalWidth}
          originalTitle={item.originalTitle}
          sizes={item.sizes}
          loading={item.loading}
          srcSet={item.srcSet}
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
            className="image-gallery-thumbnail-image"
            src={item.thumbnail}
            height={item.thumbnailHeight}
            width={item.thumbnailWidth}
            alt={item.thumbnailAlt}
            title={item.thumbnailTitle}
            loading={item.thumbnailLoading}
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

  // ============= Computed Slide Style =============
  const computeSlideStyle = useCallback(
    (index) => {
      return getSlideStyle(index, { useTranslate3D, slideVertically });
    },
    [getSlideStyle, useTranslate3D, slideVertically]
  );

  // ============= Build Slide Items =============
  const slideItems = useMemo(() => {
    const slides = [];
    const thumbnails = [];
    const bullets = [];

    const getAlignmentClassName = (index) => {
      const leftClassName = "image-gallery-left";
      const centerClassName = "image-gallery-center";
      const rightClassName = "image-gallery-right";
      let alignment = "";

      switch (index) {
        case currentIndex - 1:
          alignment = ` ${leftClassName}`;
          break;
        case currentIndex:
          alignment = ` ${centerClassName}`;
          break;
        case currentIndex + 1:
          alignment = ` ${rightClassName}`;
          break;
        default:
          break;
      }

      if (totalSlides >= 3 && infinite) {
        if (index === 0 && currentIndex === totalSlides - 1) {
          alignment = ` ${rightClassName}`;
        } else if (index === totalSlides - 1 && currentIndex === 0) {
          alignment = ` ${leftClassName}`;
        }
      }

      return alignment;
    };

    items.forEach((item, index) => {
      const alignment = getAlignmentClassName(index);
      const originalClass = item.originalClass ? ` ${item.originalClass}` : "";
      const thumbnailClass = item.thumbnailClass
        ? ` ${item.thumbnailClass}`
        : "";
      const handleRenderItemFn =
        item.renderItem || renderItem || defaultRenderItem;
      const handleRenderThumbInnerFn =
        item.renderThumbInner || renderThumbInner || defaultRenderThumbInner;

      const showItem = !lazyLoad || alignment || lazyLoadedRef.current[index];
      if (showItem && lazyLoad && !lazyLoadedRef.current[index]) {
        lazyLoadedRef.current[index] = true;
      }

      const itemSlideStyle = computeSlideStyle(index);

      slides.push(
        <Slide
          key={`slide-${index}`}
          index={index}
          alignment={alignment}
          originalClass={originalClass}
          style={itemSlideStyle}
          onClick={onClick}
          onKeyUp={handleSlideKeyUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchStart={onTouchStart}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
        >
          {showItem ? (
            handleRenderItemFn(item)
          ) : (
            <div style={{ height: "100%" }} />
          )}
        </Slide>
      );

      if (showThumbnails && item.thumbnail) {
        thumbnails.push(
          <Thumbnail
            key={`thumbnail-${index}`}
            index={index}
            isActive={currentIndex === index}
            thumbnailClass={thumbnailClass}
            onMouseLeave={slideOnThumbnailOver ? onThumbnailMouseLeave : null}
            onMouseOver={(event) => handleThumbnailMouseOver(event, index)}
            onFocus={(event) => handleThumbnailMouseOver(event, index)}
            onKeyUp={(event) => handleThumbnailKeyUp(event, index)}
            onClick={(event) => handleThumbnailClick(event, index)}
          >
            {handleRenderThumbInnerFn(item)}
          </Thumbnail>
        );
      }

      if (showBullets) {
        bullets.push(
          <Bullet
            key={`bullet-${index}`}
            index={index}
            isActive={currentIndex === index}
            bulletClass={item.bulletClass}
            onClick={(event) => handleBulletClick(event, index)}
          />
        );
      }
    });

    return { slides, thumbnails, bullets };
  }, [
    items,
    currentIndex,
    totalSlides,
    infinite,
    lazyLoad,
    showThumbnails,
    showBullets,
    slideOnThumbnailOver,
    computeSlideStyle,
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

  // Initialize on mount
  useEffect(() => {
    if (useWindowKeyDown) {
      window.addEventListener("keydown", stableHandleKeyDown);
    } else {
      imageGalleryRef.current?.addEventListener("keydown", stableHandleKeyDown);
    }

    window.addEventListener("mousedown", handleMouseDown);
    initSlideWrapperResizeObserver(imageGallerySlideWrapperRef);
    initThumbnailResizeObserver(thumbnailsWrapperRef);

    // Add screen change events
    screenChangeEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleScreenChange);
    });

    return () => {
      // Cleanup
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", stableHandleKeyDown);

      screenChangeEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleScreenChange);
      });

      removeSlideWrapperResizeObserver();
      removeThumbnailsResizeObserver();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle useWindowKeyDown changes
  useEffect(() => {
    if (useWindowKeyDown) {
      imageGalleryRef.current?.removeEventListener(
        "keydown",
        stableHandleKeyDown
      );
      window.addEventListener("keydown", stableHandleKeyDown);
    } else {
      window.removeEventListener("keydown", stableHandleKeyDown);
      imageGalleryRef.current?.addEventListener("keydown", stableHandleKeyDown);
    }
  }, [useWindowKeyDown, stableHandleKeyDown]);

  // Handle thumbnail position changes
  useEffect(() => {
    removeSlideWrapperResizeObserver();
    removeThumbnailsResizeObserver();
    initSlideWrapperResizeObserver(imageGallerySlideWrapperRef);
    initThumbnailResizeObserver(thumbnailsWrapperRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailPosition]);

  // Handle showThumbnails changes
  useEffect(() => {
    if (showThumbnails) {
      initThumbnailResizeObserver(thumbnailsWrapperRef);
    } else {
      removeThumbnailsResizeObserver();
    }
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showThumbnails]);

  // Handle items changes - reset lazyLoaded
  useEffect(() => {
    if (lazyLoad) {
      lazyLoadedRef.current = [];
    }
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
            onSwiping={handleSwiping}
            onSwiped={handleOnSwiped}
          >
            <div className="image-gallery-slides">{slides}</div>
          </SwipeWrapper>
        </>
      ) : (
        <div className="image-gallery-slides">{slides}</div>
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
          totalItems={totalSlides}
          indexSeparator={indexSeparator}
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
    <div ref={imageGalleryRef} className={igClass} aria-live="polite">
      <div className={igContentClass}>
        {(thumbnailPosition === "bottom" || thumbnailPosition === "right") &&
          slideWrapper}
        {showThumbnails && thumbnails.length > 0 && (
          <ThumbnailBar
            thumbnails={thumbnails}
            thumbnailPosition={thumbnailPosition}
            thumbnailStyle={getThumbnailStyle()}
            thumbnailBarHeight={getThumbnailBarHeight(
              gallerySlideWrapperHeight
            )}
            isRTL={isRTL}
            disableThumbnailSwipe={disableThumbnailSwipe}
            onSwiping={handleThumbnailSwiping}
            onSwiped={handleOnThumbnailSwiped}
            thumbnailsWrapperRef={thumbnailsWrapperRef}
            thumbnailsRef={thumbnailsRef}
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
  flickThreshold: number,
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
  showNav: bool,
  autoPlay: bool,
  lazyLoad: bool,
  infinite: bool,
  showIndex: bool,
  showBullets: bool,
  showThumbnails: bool,
  showPlayButton: bool,
  showFullscreenButton: bool,
  disableThumbnailScroll: bool,
  disableKeyDown: bool,
  disableSwipe: bool,
  disableThumbnailSwipe: bool,
  useBrowserFullscreen: bool,
  onErrorImageURL: string,
  indexSeparator: string,
  thumbnailPosition: oneOf(["top", "bottom", "left", "right"]),
  startIndex: number,
  slideDuration: number,
  slideInterval: number,
  slideOnThumbnailOver: bool,
  swipeThreshold: number,
  swipingTransitionDuration: number,
  swipingThumbnailTransitionDuration: number,
  onSlide: func,
  onBeforeSlide: func,
  onScreenChange: func,
  onPause: func,
  onPlay: func,
  onClick: func,
  onImageLoad: func,
  onImageError: func,
  onTouchMove: func,
  onTouchEnd: func,
  onTouchStart: func,
  onMouseOver: func,
  onMouseLeave: func,
  onBulletClick: func,
  onThumbnailError: func,
  onThumbnailClick: func,
  renderCustomControls: func,
  renderLeftNav: func,
  renderRightNav: func,
  renderTopNav: func,
  renderBottomNav: func,
  renderPlayPauseButton: func,
  renderFullscreenButton: func,
  renderItem: func,
  renderThumbInner: func,
  stopPropagation: bool,
  additionalClass: string,
  useTranslate3D: bool,
  isRTL: bool,
  useWindowKeyDown: bool,
  slideVertically: bool,
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
  swipingThumbnailTransitionDuration: 0,
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
    <LeftNav onClick={onClick} disabled={disabled} />
  ),
  renderRightNav: (onClick, disabled) => (
    <RightNav onClick={onClick} disabled={disabled} />
  ),
  renderTopNav: (onClick, disabled) => (
    <TopNav onClick={onClick} disabled={disabled} />
  ),
  renderBottomNav: (onClick, disabled) => (
    <BottomNav onClick={onClick} disabled={disabled} />
  ),
  renderPlayPauseButton: (onClick, isPlaying) => (
    <PlayPause onClick={onClick} isPlaying={isPlaying} />
  ),
  renderFullscreenButton: (onClick, isFullscreen) => (
    <Fullscreen onClick={onClick} isFullscreen={isFullscreen} />
  ),
  useWindowKeyDown: true,
};

export default ImageGallery;
