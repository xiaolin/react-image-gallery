import clsx from 'clsx';
import React from 'react';
import { Swipeable, LEFT, RIGHT } from 'react-swipeable';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import ResizeObserver from 'resize-observer-polyfill';
import {
  arrayOf,
  bool,
  func,
  number,
  shape,
  string,
} from 'prop-types';
import SVG from './SVG';

const screenChangeEvents = [
  'fullscreenchange',
  'MSFullscreenChange',
  'mozfullscreenchange',
  'webkitfullscreenchange',
];

const imageSetType = arrayOf(shape({
  srcSet: string,
  media: string,
}));

function isEnterOrSpaceKey(event) {
  const key = parseInt(event.keyCode || event.which || 0, 10);
  const ENTER_KEY_CODE = 66;
  const SPACEBAR_KEY_CODE = 62;
  return key === ENTER_KEY_CODE || key === SPACEBAR_KEY_CODE;
}

export default class ImageGallery extends React.Component {
  static propTypes = {
    flickThreshold: number,
    items: arrayOf(shape({
      bulletClass: string,
      bulletOnClick: func,
      description: string,
      original: string.isRequired,
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
    })).isRequired,
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
    useBrowserFullscreen: bool,
    preventDefaultTouchmoveEvent: bool,
    onErrorImageURL: string,
    indexSeparator: string,
    thumbnailPosition: string,
    startIndex: number,
    slideDuration: number,
    slideInterval: number,
    slideOnThumbnailOver: bool,
    swipeThreshold: number,
    swipingTransitionDuration: number,
    onSlide: func,
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
    onThumbnailError: func,
    onThumbnailClick: func,
    renderCustomControls: func,
    renderLeftNav: func,
    renderRightNav: func,
    renderPlayPauseButton: func,
    renderFullscreenButton: func,
    renderItem: func,
    renderThumbInner: func,
    stopPropagation: bool,
    additionalClass: string,
    useTranslate3D: bool,
    isRTL: bool,
  };

  static defaultProps = {
    onErrorImageURL: '',
    additionalClass: '',
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
    useTranslate3D: true,
    isRTL: false,
    useBrowserFullscreen: true,
    preventDefaultTouchmoveEvent: false,
    flickThreshold: 0.4,
    stopPropagation: false,
    indexSeparator: ' / ',
    thumbnailPosition: 'bottom',
    startIndex: 0,
    slideDuration: 450,
    swipingTransitionDuration: 0,
    onSlide: null,
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
    onThumbnailError: null,
    onThumbnailClick: null,
    renderCustomControls: null,
    renderThumbInner: null,
    renderItem: null,
    slideInterval: 3000,
    slideOnThumbnailOver: false,
    swipeThreshold: 30,
    renderLeftNav: (onClick, disabled) => (
      <button
        type="button"
        className="image-gallery-icon image-gallery-left-nav"
        disabled={disabled}
        onClick={onClick}
        aria-label="Previous Slide"
      >
        <SVG icon="left" viewBox="6 0 12 24" />
      </button>
    ),
    renderRightNav: (onClick, disabled) => (
      <button
        type="button"
        className="image-gallery-icon image-gallery-right-nav"
        disabled={disabled}
        onClick={onClick}
        aria-label="Next Slide"
      >
        <SVG icon="right" viewBox="6 0 12 24" />
      </button>
    ),
    renderPlayPauseButton: (onClick, isPlaying) => (
      <button
        type="button"
        className="image-gallery-icon image-gallery-play-button"
        onClick={onClick}
        aria-label="Play or Pause Slideshow"
      >
        <SVG strokeWidth={2} icon={isPlaying ? 'pause' : 'play'} />
      </button>
    ),
    renderFullscreenButton: (onClick, isFullscreen) => (
      <button
        type="button"
        className="image-gallery-icon image-gallery-fullscreen-button"
        onClick={onClick}
        aria-label="Open Fullscreen"
      >
        <SVG strokeWidth={2} icon={isFullscreen ? 'minimize' : 'maximize'} />
      </button>
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: props.startIndex,
      thumbsTranslate: 0,
      offsetPercentage: 0,
      galleryWidth: 0,
      thumbnailsWrapperWidth: 0,
      thumbnailsWrapperHeight: 0,
      isFullscreen: false,
      isPlaying: false,
    };
    this.loadedImages = {};
    this.imageGallery = React.createRef();
    this.thumbnailsWrapper = React.createRef();
    this.thumbnails = React.createRef();
    this.imageGallerySlideWrapper = React.createRef();

    // bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleOnSwiped = this.handleOnSwiped.bind(this);
    this.handleScreenChange = this.handleScreenChange.bind(this);
    this.handleSwiping = this.handleSwiping.bind(this);
    this.onThumbnailMouseLeave = this.onThumbnailMouseLeave.bind(this);
    this.pauseOrPlay = this.pauseOrPlay.bind(this);
    this.renderThumbInner = this.renderThumbInner.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.slideLeft = this.slideLeft.bind(this);
    this.slideRight = this.slideRight.bind(this);
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
    this.togglePlay = this.togglePlay.bind(this);

    // Used to update the throttle if slideDuration changes
    this.unthrottledSlideToIndex = this.slideToIndex;
    this.slideToIndex = throttle(
      this.unthrottledSlideToIndex, props.slideDuration, { trailing: false },
    );

    if (props.lazyLoad) {
      this.lazyLoaded = [];
    }
  }

  componentDidMount() {
    const { autoPlay } = this.props;
    if (autoPlay) {
      this.play();
    }
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mousedown', this.handleMouseDown);
    this.initResizeObserver(this.imageGallerySlideWrapper);
    this.addScreenChangeEvent();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      items,
      lazyLoad,
      slideDuration,
      startIndex,
      thumbnailPosition,
    } = this.props;
    const { currentIndex } = this.state;
    const itemsSizeChanged = prevProps.items.length !== items.length;
    const itemsChanged = !isEqual(prevProps.items, items);
    const startIndexUpdated = prevProps.startIndex !== startIndex;
    const thumbnailsPositionChanged = prevProps.thumbnailPosition !== thumbnailPosition;

    if (thumbnailsPositionChanged) {
      // re-initialize resizeObserver because slides was unmounted and mounted again
      this.removeResizeObserver();
      this.initResizeObserver(this.imageGallerySlideWrapper);
    }

    if (itemsSizeChanged) {
      this.handleResize();
    }
    if (prevState.currentIndex !== currentIndex) {
      this.slideThumbnailBar(prevState.currentIndex);
    }
    // if slideDuration changes, update slideToIndex throttle
    if (prevProps.slideDuration !== slideDuration) {
      this.slideToIndex = throttle(
        this.unthrottledSlideToIndex, slideDuration, { trailing: false },
      );
    }
    if (lazyLoad && (!prevProps.lazyLoad || itemsChanged)) {
      this.lazyLoaded = [];
    }

    if (startIndexUpdated || itemsChanged) {
      // TODO: this should be fix/removed if all it is doing
      // is resetting the gallery currentIndext state
      this.setState({ currentIndex: startIndex });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mousedown', this.handleMouseDown);
    this.removeScreenChangeEvent();
    this.removeResizeObserver();
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.transitionTimer) {
      window.clearTimeout(this.transitionTimer);
    }
  }

  onSliding() {
    const { currentIndex, isTransitioning } = this.state;
    const { onSlide, slideDuration } = this.props;
    this.transitionTimer = window.setTimeout(() => {
      if (isTransitioning) {
        this.setState({ isTransitioning: !isTransitioning });
        if (onSlide) {
          onSlide(currentIndex);
        }
      }
    }, slideDuration + 50);
  }

  onThumbnailClick(event, index) {
    const { onThumbnailClick } = this.props;
    this.slideToIndex(index, event);
    if (onThumbnailClick) {
      onThumbnailClick(event, index);
    }
  }

  onThumbnailMouseOver(event, index) {
    if (this.thumbnailMouseOverTimer) {
      window.clearTimeout(this.thumbnailMouseOverTimer);
      this.thumbnailMouseOverTimer = null;
    }
    this.thumbnailMouseOverTimer = window.setTimeout(() => {
      this.slideToIndex(index);
      this.pause();
    }, 300);
  }

  onThumbnailMouseLeave() {
    if (this.thumbnailMouseOverTimer) {
      const { autoPlay } = this.props;
      window.clearTimeout(this.thumbnailMouseOverTimer);
      this.thumbnailMouseOverTimer = null;
      if (autoPlay) {
        this.play();
      }
    }
  }

  setScrollDirection(dir) {
    const { scrollingUpDown, scrollingLeftRight } = this.state;

    if (!scrollingUpDown && !scrollingLeftRight) {
      if (dir === LEFT || dir === RIGHT) {
        this.setState({ scrollingLeftRight: true });
      } else {
        this.setState({ scrollingUpDown: true });
      }
    }
  }

  setThumbsTranslate(thumbsTranslate) {
    this.setState({ thumbsTranslate });
  }

  setModalFullscreen(state) {
    const { onScreenChange } = this.props;
    this.setState({ modalFullscreen: state });
    // manually call because browser does not support screenchange events
    if (onScreenChange) {
      onScreenChange(state);
    }
  }

  getThumbsTranslate(indexDifference) {
    const { disableThumbnailScroll, items } = this.props;
    const { thumbnailsWrapperWidth, thumbnailsWrapperHeight } = this.state;
    let totalScroll;
    const thumbElement = this.thumbnails && this.thumbnails.current;

    if (disableThumbnailScroll) return 0;

    if (thumbElement) {
      // total scroll required to see the last thumbnail
      if (this.isThumbnailVertical()) {
        if (thumbElement.scrollHeight <= thumbnailsWrapperHeight) {
          return 0;
        }
        totalScroll = thumbElement.scrollHeight - thumbnailsWrapperHeight;
      } else {
        if (thumbElement.scrollWidth <= thumbnailsWrapperWidth || thumbnailsWrapperWidth <= 0) {
          return 0;
        }
        totalScroll = thumbElement.scrollWidth - thumbnailsWrapperWidth;
      }
      // scroll-x required per index change
      const perIndexScroll = totalScroll / (items.length - 1);
      return indexDifference * perIndexScroll;
    }
    return 0;
  }

  getAlignmentClassName(index) {
    // Necessary for lazing loading
    const { currentIndex } = this.state;
    const { infinite, items } = this.props;
    let alignment = '';
    const leftClassName = 'left';
    const centerClassName = 'center';
    const rightClassName = 'right';

    switch (index) {
      case (currentIndex - 1):
        alignment = ` ${leftClassName}`;
        break;
      case (currentIndex):
        alignment = ` ${centerClassName}`;
        break;
      case (currentIndex + 1):
        alignment = ` ${rightClassName}`;
        break;
      default:
        break;
    }

    if (items.length >= 3 && infinite) {
      if (index === 0 && currentIndex === items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ` ${rightClassName}`;
      } else if (index === items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ` ${leftClassName}`;
      }
    }

    return alignment;
  }

  getTranslateXForTwoSlide(index) {
    // For taking care of infinite swipe when there are only two slides
    const { currentIndex, offsetPercentage, previousIndex } = this.state;
    const baseTranslateX = -100 * currentIndex;
    let translateX = baseTranslateX + (index * 100) + offsetPercentage;

    // keep track of user swiping direction
    if (offsetPercentage > 0) {
      this.direction = 'left';
    } else if (offsetPercentage < 0) {
      this.direction = 'right';
    }

    // when swiping make sure the slides are on the correct side
    if (currentIndex === 0 && index === 1 && offsetPercentage > 0) {
      translateX = -100 + offsetPercentage;
    } else if (currentIndex === 1 && index === 0 && offsetPercentage < 0) {
      translateX = 100 + offsetPercentage;
    }

    if (currentIndex !== previousIndex) {
      // when swiped move the slide to the correct side
      if (previousIndex === 0 && index === 0 && offsetPercentage === 0 && this.direction === 'left') {
        translateX = 100;
      } else if (previousIndex === 1 && index === 1 && offsetPercentage === 0 && this.direction === 'right') {
        translateX = -100;
      }
    } else {
      // keep the slide on the correct slide even when not a swipe
      if (currentIndex === 0 && index === 1 && offsetPercentage === 0 && this.direction === 'left') {
        translateX = -100;
      }
      if (currentIndex === 1 && index === 0 && offsetPercentage === 0 && this.direction === 'right') {
        translateX = 100;
      }
    }

    return translateX;
  }

  getThumbnailBarHeight() {
    if (this.isThumbnailVertical()) {
      const { gallerySlideWrapperHeight } = this.state;
      return { height: gallerySlideWrapperHeight };
    }
    return {};
  }

  getSlideStyle(index) {
    const { currentIndex, offsetPercentage, slideStyle } = this.state;
    const {
      infinite,
      items,
      useTranslate3D,
      isRTL,
    } = this.props;
    const baseTranslateX = -100 * currentIndex;
    const totalSlides = items.length - 1;

    // calculates where the other slides belong based on currentIndex
    // if it is RTL the base line should be reversed
    let translateX = (baseTranslateX + (index * 100)) * (isRTL ? -1 : 1) + offsetPercentage;

    if (infinite && items.length > 2) {
      if (currentIndex === 0 && index === totalSlides) {
        // make the last slide the slide before the first
        // if it is RTL the base line should be reversed
        translateX = -100 * (isRTL ? -1 : 1) + offsetPercentage;
      } else if (currentIndex === totalSlides && index === 0) {
        // make the first slide the slide after the last
        // if it is RTL the base line should be reversed
        translateX = 100 * (isRTL ? -1 : 1) + offsetPercentage;
      }
    }

    // Special case when there are only 2 items with infinite on
    if (infinite && items.length === 2) {
      translateX = this.getTranslateXForTwoSlide(index);
    }

    let translate = `translate(${translateX}%, 0)`;

    if (useTranslate3D) {
      translate = `translate3d(${translateX}%, 0, 0)`;
    }

    return Object.assign({}, {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate,
    }, slideStyle);
  }

  getCurrentIndex() {
    const { currentIndex } = this.state;
    return currentIndex;
  }

  getThumbnailStyle() {
    let translate;
    const { useTranslate3D, isRTL } = this.props;
    const { thumbsTranslate } = this.state;
    const verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

    if (this.isThumbnailVertical()) {
      translate = `translate(0, ${thumbsTranslate}px)`;
      if (useTranslate3D) {
        translate = `translate3d(0, ${thumbsTranslate}px, 0)`;
      }
    } else {
      translate = `translate(${verticalTranslateValue}px, 0)`;
      if (useTranslate3D) {
        translate = `translate3d(${verticalTranslateValue}px, 0, 0)`;
      }
    }
    return {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate,
    };
  }

  getSlideItems(items) {
    const { currentIndex } = this.state;
    const {
      infinite,
      slideOnThumbnailOver,
      onClick,
      lazyLoad,
      onTouchMove,
      onTouchEnd,
      onTouchStart,
      onMouseOver,
      onMouseLeave,
      renderItem,
      renderThumbInner,
      showThumbnails,
      showBullets,
    } = this.props;

    const slides = [];
    const thumbnails = [];
    const bullets = [];

    items.forEach((item, index) => {
      const alignment = this.getAlignmentClassName(index);
      const originalClass = item.originalClass ? ` ${item.originalClass}` : '';
      const thumbnailClass = item.thumbnailClass ? ` ${item.thumbnailClass}` : '';
      const handleRenderItem = item.renderItem || renderItem || this.renderItem;
      const handleRenderThumbInner = item.renderThumbInner
        || renderThumbInner || this.renderThumbInner;

      const showItem = !lazyLoad || alignment || this.lazyLoaded[index];
      if (showItem && lazyLoad && !this.lazyLoaded[index]) {
        this.lazyLoaded[index] = true;
      }

      const slideStyle = this.getSlideStyle(index);

      const slide = (
        <div
          key={`slide-${item.original}`}
          tabIndex="-1"
          className={`image-gallery-slide ${alignment} ${originalClass}`}
          style={slideStyle}
          onClick={onClick}
          onKeyUp={this.handleSlideKeyUp}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchStart={onTouchStart}
          onMouseOver={onMouseOver}
          onFocus={onMouseOver}
          onMouseLeave={onMouseLeave}
          role="button"
        >
          {showItem ? handleRenderItem(item) : <div style={{ height: '100%' }} />}
        </div>
      );

      if (infinite) {
        // don't add some slides while transitioning to avoid background transitions
        if (this.shouldPushSlideOnInfiniteMode(index)) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      if (showThumbnails) {
        const igThumbnailClass = clsx(
          'image-gallery-thumbnail',
          thumbnailClass,
          { active: currentIndex === index },
        );
        thumbnails.push(
          <button
            key={`thumbnail-${item.original}`}
            type="button"
            tabIndex="0"
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
            className={igThumbnailClass}
            onMouseLeave={slideOnThumbnailOver ? this.onThumbnailMouseLeave : null}
            onMouseOver={event => this.handleThumbnailMouseOver(event, index)}
            onFocus={event => this.handleThumbnailMouseOver(event, index)}
            onKeyUp={event => this.handleThumbnailKeyUp(event, index)}
            onClick={event => this.onThumbnailClick(event, index)}
          >
            {handleRenderThumbInner(item)}
          </button>,
        );
      }

      if (showBullets) {
        // generate bullet elements and store them in array
        const bulletOnClick = (event) => {
          if (item.bulletOnClick) {
            item.bulletOnClick({ item, itemIndex: index, currentIndex });
          }
          return this.slideToIndex.call(this, index, event);
        };
        const igBulletClass = clsx(
          'image-gallery-bullet',
          item.bulletClass,
          { active: currentIndex === index },
        );
        bullets.push(
          <button
            type="button"
            key={`bullet-${item.original}`}
            className={igBulletClass}
            onClick={bulletOnClick}
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
          />,
        );
      }
    });

    return {
      slides,
      thumbnails,
      bullets,
    };
  }

  ignoreIsTransitioning() {
    /*
      Ignore isTransitioning because were not going to sibling slides
      e.g. center to left or center to right
    */
    const { items } = this.props;
    const { previousIndex, currentIndex } = this.state;
    const totalSlides = items.length - 1;
    // we want to show the in between slides transition
    const slidingMoreThanOneSlideLeftOrRight = Math.abs(previousIndex - currentIndex) > 1;
    const notGoingFromFirstToLast = !(previousIndex === 0 && currentIndex === totalSlides);
    const notGoingFromLastToFirst = !(previousIndex === totalSlides && currentIndex === 0);

    return slidingMoreThanOneSlideLeftOrRight
      && notGoingFromFirstToLast
      && notGoingFromLastToFirst;
  }

  isFirstOrLastSlide(index) {
    const { items } = this.props;
    const totalSlides = items.length - 1;
    const isLastSlide = index === totalSlides;
    const isFirstSlide = index === 0;
    return isLastSlide || isFirstSlide;
  }


  slideIsTransitioning(index) {
    /*
    returns true if the gallery is transitioning and the index is not the
    previous or currentIndex
    */
    const { isTransitioning, previousIndex, currentIndex } = this.state;
    const indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
    return isTransitioning && indexIsNotPreviousOrNextSlide;
  }

  shouldPushSlideOnInfiniteMode(index) {
    /*
      Push (show) slide if slide is the current slide and the next slide
      OR
      The slide is going more than one slide left or right, but not going from
      first to last and not going from last to first

      Edge case:
      If you go to the first or last slide, when they're
      not left, or right of each other they will try to catch up in the background
      so unless were going from first to last or vice versa we don't want the first
      or last slide to show up during the transition
    */
    return !this.slideIsTransitioning(index)
      || (this.ignoreIsTransitioning() && !this.isFirstOrLastSlide(index));
  }

  slideThumbnailBar(previousIndex) {
    const { thumbsTranslate, currentIndex } = this.state;
    if (currentIndex === 0) {
      this.setThumbsTranslate(0);
    } else {
      const indexDifference = Math.abs(previousIndex - currentIndex);
      const scroll = this.getThumbsTranslate(indexDifference);
      if (scroll > 0) {
        if (previousIndex < currentIndex) {
          this.setThumbsTranslate(thumbsTranslate - scroll);
        } else if (previousIndex > currentIndex) {
          this.setThumbsTranslate(thumbsTranslate + scroll);
        }
      }
    }
  }

  canSlide() {
    const { items } = this.props;
    return items.length >= 2;
  }

  canSlideLeft() {
    const { infinite, isRTL } = this.props;
    return infinite || (isRTL ? this.canSlideNext() : this.canSlidePrevious());
  }

  canSlideRight() {
    const { infinite, isRTL } = this.props;
    return infinite || (isRTL ? this.canSlidePrevious() : this.canSlideNext());
  }

  canSlidePrevious() {
    const { currentIndex } = this.state;
    return currentIndex > 0;
  }

  canSlideNext() {
    const { currentIndex } = this.state;
    const { items } = this.props;
    return currentIndex < items.length - 1;
  }

  handleSwiping({ event, absX, dir }) {
    const { preventDefaultTouchmoveEvent, disableSwipe, stopPropagation } = this.props;
    const {
      galleryWidth,
      isTransitioning,
      scrollingUpDown,
      scrollingLeftRight,
    } = this.state;

    if (disableSwipe) return;
    const { swipingTransitionDuration } = this.props;
    this.setScrollDirection(dir);
    if (stopPropagation) event.stopPropagation();
    if ((preventDefaultTouchmoveEvent || scrollingLeftRight) && event.cancelable) {
      event.preventDefault();
    }
    if (!isTransitioning && !scrollingUpDown) {
      const side = dir === RIGHT ? 1 : -1;

      let offsetPercentage = (absX / galleryWidth * 100);
      if (Math.abs(offsetPercentage) >= 100) {
        offsetPercentage = 100;
      }

      const swipingTransition = {
        transition: `transform ${swipingTransitionDuration}ms ease-out`,
      };

      this.setState({
        offsetPercentage: side * offsetPercentage,
        slideStyle: swipingTransition,
      });
    } else {
      // don't move the slide
      this.setState({ offsetPercentage: 0 });
    }
  }

  sufficientSwipe() {
    const { offsetPercentage } = this.state;
    const { swipeThreshold } = this.props;
    return Math.abs(offsetPercentage) > swipeThreshold;
  }

  handleOnSwiped({ event, dir, velocity }) {
    const { disableSwipe, stopPropagation, flickThreshold } = this.props;
    const { scrollingUpDown, scrollingLeftRight } = this.state;

    if (disableSwipe) return;

    const { isRTL } = this.props;
    if (stopPropagation) event.stopPropagation();
    if (scrollingUpDown) {
      // user stopped scrollingUpDown
      this.setState({ scrollingUpDown: false });
    }

    if (scrollingLeftRight) {
      // user stopped scrollingLeftRight
      this.setState({ scrollingLeftRight: false });
    }

    if (!scrollingUpDown) { // don't swipe if user is scrolling
      // if it is RTL the direction is reversed
      const swipeDirection = (dir === LEFT ? 1 : -1) * (isRTL ? -1 : 1);
      const isFlick = velocity > flickThreshold;
      this.handleOnSwipedTo(swipeDirection, isFlick);
    }
  }

  handleOnSwipedTo(swipeDirection, isFlick) {
    const { currentIndex, isTransitioning } = this.state;
    let slideTo = currentIndex;

    if ((this.sufficientSwipe() || isFlick) && !isTransitioning) {
      // slideto the next/prev slide
      slideTo += swipeDirection;
    }

    // If we can't swipe left or right, stay in the current index (noop)
    if ((swipeDirection === -1 && !this.canSlideLeft())
        || (swipeDirection === 1 && !this.canSlideRight())) {
      slideTo = currentIndex;
    }

    this.unthrottledSlideToIndex(slideTo);
  }

  handleMouseDown() {
    // keep track of mouse vs keyboard usage for a11y
    this.imageGallery.current.classList.add('image-gallery-using-mouse');
  }

  handleKeyDown(event) {
    const { disableKeyDown, useBrowserFullscreen } = this.props;
    const { isFullscreen } = this.state;
    // keep track of mouse vs keyboard usage for a11y
    this.imageGallery.current.classList.remove('image-gallery-using-mouse');

    if (disableKeyDown) return;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const ESC_KEY = 27;
    const key = parseInt(event.keyCode || event.which || 0, 10);

    switch (key) {
      case LEFT_ARROW:
        if (this.canSlideLeft() && !this.intervalId) {
          this.slideLeft();
        }
        break;
      case RIGHT_ARROW:
        if (this.canSlideRight() && !this.intervalId) {
          this.slideRight();
        }
        break;
      case ESC_KEY:
        if (isFullscreen && !useBrowserFullscreen) {
          this.exitFullScreen();
        }
        break;
      default:
        break;
    }
  }

  handleImageError(event) {
    const { onErrorImageURL } = this.props;
    if (onErrorImageURL && event.target.src.indexOf(onErrorImageURL) === -1) {
      /* eslint-disable no-param-reassign */
      event.target.src = onErrorImageURL;
      /* eslint-enable no-param-reassign */
    }
  }

  removeResizeObserver() {
    if (this.resizeObserver
        && this.imageGallerySlideWrapper && this.imageGallerySlideWrapper.current) {
      this.resizeObserver.unobserve(this.imageGallerySlideWrapper.current);
    }
  }

  handleResize() {
    const { currentIndex } = this.state;
    if (this.imageGallery && this.imageGallery.current) {
      this.setState({ galleryWidth: this.imageGallery.current.offsetWidth });
    }

    if (this.imageGallerySlideWrapper && this.imageGallerySlideWrapper.current) {
      this.setState({
        gallerySlideWrapperHeight: this.imageGallerySlideWrapper.current.offsetHeight,
      });
    }

    if (this.thumbnailsWrapper && this.thumbnailsWrapper.current) {
      if (this.isThumbnailVertical()) {
        this.setState({ thumbnailsWrapperHeight: this.thumbnailsWrapper.current.offsetHeight });
      } else {
        this.setState({ thumbnailsWrapperWidth: this.thumbnailsWrapper.current.offsetWidth });
      }
    }

    // Adjust thumbnail container when thumbnail width or height is adjusted
    this.setThumbsTranslate(-this.getThumbsTranslate(currentIndex));
  }

  initResizeObserver(element) {
    this.resizeObserver = new ResizeObserver(debounce((entries) => {
      if (!entries) return;
      entries.forEach(() => {
        this.handleResize();
      });
    }, 300));
    this.resizeObserver.observe(element.current);
  }

  toggleFullScreen() {
    const { isFullscreen } = this.state;
    if (isFullscreen) {
      this.exitFullScreen();
    } else {
      this.fullScreen();
    }
  }

  togglePlay() {
    if (this.intervalId) {
      this.pause();
    } else {
      this.play();
    }
  }


  handleScreenChange() {
    /*
      handles screen change events that the browser triggers e.g. esc key
    */
    const { onScreenChange } = this.props;
    const fullScreenElement = document.fullscreenElement
      || document.msFullscreenElement
      || document.mozFullScreenElement
      || document.webkitFullscreenElement;

    if (onScreenChange) onScreenChange(fullScreenElement);
    this.setState({ isFullscreen: !!fullScreenElement });
  }

  slideToIndex(index, event) {
    const { currentIndex, isTransitioning } = this.state;
    const { items, slideDuration } = this.props;

    if (!isTransitioning) {
      if (event) {
        if (this.intervalId) {
          // user triggered event while ImageGallery is playing, reset interval
          this.pause(false);
          this.play(false);
        }
      }

      const slideCount = items.length - 1;
      let nextIndex = index;
      if (index < 0) {
        nextIndex = slideCount;
      } else if (index > slideCount) {
        nextIndex = 0;
      }

      this.setState({
        previousIndex: currentIndex,
        currentIndex: nextIndex,
        isTransitioning: nextIndex !== currentIndex,
        offsetPercentage: 0,
        slideStyle: { transition: `all ${slideDuration}ms ease-out` },
      }, this.onSliding);
    }
  }

  slideLeft() {
    const { isRTL } = this.props;
    if (isRTL) {
      this.slideNext();
    } else {
      this.slidePrevious();
    }
  }

  slideRight() {
    const { isRTL } = this.props;
    if (isRTL) {
      this.slidePrevious();
    } else {
      this.slideNext();
    }
  }

  slidePrevious(event) {
    const { currentIndex } = this.state;
    this.slideToIndex(currentIndex - 1, event);
  }

  slideNext(event) {
    const { currentIndex } = this.state;
    this.slideToIndex(currentIndex + 1, event);
  }

  handleThumbnailMouseOver(event, index) {
    const { slideOnThumbnailOver } = this.props;
    if (slideOnThumbnailOver) this.onThumbnailMouseOver(event, index);
  }

  handleThumbnailKeyUp(event, index) {
    // a11y support ^_^
    if (isEnterOrSpaceKey(event)) this.onThumbnailClick(event, index);
  }

  handleSlideKeyUp(event) {
    // a11y support ^_^
    if (isEnterOrSpaceKey(event)) {
      const { onClick } = this.props;
      onClick(event);
    }
  }

  isThumbnailVertical() {
    const { thumbnailPosition } = this.props;
    return thumbnailPosition === 'left' || thumbnailPosition === 'right';
  }

  addScreenChangeEvent() {
    screenChangeEvents.forEach((eventName) => {
      document.addEventListener(eventName, this.handleScreenChange);
    });
  }

  removeScreenChangeEvent() {
    screenChangeEvents.forEach((eventName) => {
      document.removeEventListener(eventName, this.handleScreenChange);
    });
  }

  fullScreen() {
    const { useBrowserFullscreen } = this.props;
    const gallery = this.imageGallery.current;
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
        // fallback to fullscreen modal for unsupported browsers
        this.setModalFullscreen(true);
      }
    } else {
      this.setModalFullscreen(true);
    }
    this.setState({ isFullscreen: true });
  }

  exitFullScreen() {
    const { isFullscreen } = this.state;
    const { useBrowserFullscreen } = this.props;
    if (isFullscreen) {
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
          // fallback to fullscreen modal for unsupported browsers
          this.setModalFullscreen(false);
        }
      } else {
        this.setModalFullscreen(false);
      }
      this.setState({ isFullscreen: false });
    }
  }

  pauseOrPlay() {
    const { infinite } = this.props;
    const { currentIndex } = this.state;
    if (!infinite && !this.canSlideRight()) {
      this.pause();
    } else {
      this.slideToIndex(currentIndex + 1);
    }
  }

  play(shouldCallOnPlay = true) {
    const {
      onPlay,
      slideInterval,
      slideDuration,
    } = this.props;
    const { currentIndex } = this.state;
    if (!this.intervalId) {
      this.setState({ isPlaying: true });
      this.intervalId = window.setInterval(
        this.pauseOrPlay,
        Math.max(slideInterval, slideDuration),
      );
      if (onPlay && shouldCallOnPlay) {
        onPlay(currentIndex);
      }
    }
  }

  pause(shouldCallOnPause = true) {
    const { onPause } = this.props;
    const { currentIndex } = this.state;
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this.setState({ isPlaying: false });
      if (onPause && shouldCallOnPause) {
        onPause(currentIndex);
      }
    }
  }

  isImageLoaded(item) {
    /*
      Keep track of images loaded so that onImageLoad prop is not
      called multiple times when re-render the images
    */
    const imageExists = this.loadedImages[item.original];
    if (imageExists) {
      return true;
    }
    // add image as loaded
    this.loadedImages[item.original] = true;
    return false;
  }

  renderItem(item) {
    const { onImageError, onImageLoad } = this.props;
    const handleImageError = onImageError || this.handleImageError;

    return (
      <div>
        {
          item.imageSet ? (
            <picture
              onLoad={!this.isImageLoaded(item) ? onImageLoad : null}
              onError={handleImageError}
            >
              {
                item.imageSet.map(source => (
                  <source
                    key={source.media}
                    media={source.media}
                    srcSet={source.srcSet}
                    type={source.type}
                  />
                ))
              }
              <img
                className="image-gallery-image"
                alt={item.originalAlt}
                src={item.original}
              />
            </picture>
          ) : (
            <img
              className="image-gallery-image"
              src={item.original}
              alt={item.originalAlt}
              srcSet={item.srcSet}
              sizes={item.sizes}
              title={item.originalTitle}
              onLoad={!this.isImageLoaded(item) ? onImageLoad : null}
              onError={handleImageError}
            />
          )
        }

        {
          item.description && (
            <span className="image-gallery-description">
              {item.description}
            </span>
          )
        }
      </div>
    );
  }

  renderThumbInner(item) {
    const { onThumbnailError } = this.props;
    const handleThumbnailError = onThumbnailError || this.handleImageError;

    return (
      <div className="image-gallery-thumbnail-inner">
        <img
          className="image-gallery-thumbnail-image"
          src={item.thumbnail}
          alt={item.thumbnailAlt}
          title={item.thumbnailTitle}
          onError={handleThumbnailError}
        />
        {
          item.thumbnailLabel && (
            <div className="image-gallery-thumbnail-label">
              {item.thumbnailLabel}
            </div>
          )
        }
      </div>
    );
  }

  render() {
    const {
      currentIndex,
      isFullscreen,
      modalFullscreen,
      isPlaying,
    } = this.state;

    const {
      additionalClass,
      indexSeparator, // deprecate soon, and allow custom render
      isRTL,
      items,
      thumbnailPosition,
      renderFullscreenButton,
      renderCustomControls,
      renderLeftNav,
      renderRightNav,
      showBullets,
      showFullscreenButton,
      showIndex,
      showThumbnails,
      showNav,
      showPlayButton,
      renderPlayPauseButton,
    } = this.props;

    const thumbnailStyle = this.getThumbnailStyle();
    const { slides, thumbnails, bullets } = this.getSlideItems(items);
    const slideWrapperClass = clsx(
      'image-gallery-slide-wrapper',
      thumbnailPosition,
      { 'image-gallery-rtl': isRTL },
    );

    const slideWrapper = (
      <div ref={this.imageGallerySlideWrapper} className={slideWrapperClass}>
        {renderCustomControls && renderCustomControls()}
        {
          this.canSlide() ? (
            <React.Fragment>
              {
                showNav && (
                  <span key="navigation">
                    {renderLeftNav(this.slideLeft, !this.canSlideLeft())}
                    {renderRightNav(this.slideRight, !this.canSlideRight())}
                  </span>
                )
              }
              <Swipeable
                className="image-gallery-swipe"
                key="swipeable"
                delta={0}
                onSwiping={this.handleSwiping}
                onSwiped={this.handleOnSwiped}
              >
                <div className="image-gallery-slides">
                  {slides}
                </div>
              </Swipeable>
            </React.Fragment>
          ) : (
            <div className="image-gallery-slides">
              {slides}
            </div>
          )
        }
        {showPlayButton && renderPlayPauseButton(this.togglePlay, isPlaying)}
        {
          showBullets && (
            <div className="image-gallery-bullets">
              <div
                className="image-gallery-bullets-container"
                role="navigation"
                aria-label="Bullet Navigation"
              >
                {bullets}
              </div>
            </div>
          )
        }
        {showFullscreenButton && renderFullscreenButton(this.toggleFullScreen, isFullscreen)}
        {
          showIndex && (
            <div className="image-gallery-index">
              <span className="image-gallery-index-current">
                {currentIndex + 1}
              </span>
              <span className="image-gallery-index-separator">
                {indexSeparator}
              </span>
              <span className="image-gallery-index-total">
                {items.length}
              </span>
            </div>
          )
        }
      </div>
    );

    const igClass = clsx('image-gallery', additionalClass, { 'fullscreen-modal': modalFullscreen });
    const igContentClass = clsx('image-gallery-content', thumbnailPosition, { fullscreen: isFullscreen });
    const thumbnailWrapperClass = clsx(
      'image-gallery-thumbnails-wrapper',
      thumbnailPosition,
      { 'thumbnails-wrapper-rtl': !this.isThumbnailVertical() && isRTL },
    );
    return (
      <div
        ref={this.imageGallery}
        className={igClass}
        aria-live="polite"
      >
        <div className={igContentClass}>
          {(thumbnailPosition === 'bottom' || thumbnailPosition === 'right') && slideWrapper}
          {
            showThumbnails && (
              <div
                className={thumbnailWrapperClass}
                style={this.getThumbnailBarHeight()}
              >
                <div
                  className="image-gallery-thumbnails"
                  ref={this.thumbnailsWrapper}
                >
                  <div
                    ref={this.thumbnails}
                    className="image-gallery-thumbnails-container"
                    style={thumbnailStyle}
                    aria-label="Thumbnail Navigation"
                  >
                    {thumbnails}
                  </div>
                </div>
              </div>
            )
          }
          {(thumbnailPosition === 'top' || thumbnailPosition === 'left') && slideWrapper}
        </div>

      </div>
    );
  }
}
