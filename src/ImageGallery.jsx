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
    disableArrowKeys: bool,
    disableSwipe: bool,
    useBrowserFullscreen: bool,
    preventDefaultTouchmoveEvent: bool,
    onErrorImage: string,
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
    onErrorImage: '',
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
    disableArrowKeys: false,
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
        className="image-gallery-left-nav"
        disabled={disabled}
        onClick={onClick}
        aria-label="Previous Slide"
      />
    ),
    renderRightNav: (onClick, disabled) => (
      <button
        type="button"
        className="image-gallery-right-nav"
        disabled={disabled}
        onClick={onClick}
        aria-label="Next Slide"
      />
    ),
    renderPlayPauseButton: (onClick, isPlaying) => (
      <button
        type="button"
        className={
          `image-gallery-play-button${isPlaying ? ' active' : ''}`}
        onClick={onClick}
        aria-label="Play or Pause Slideshow"
      />
    ),
    renderFullscreenButton: (onClick, isFullscreen) => (
      <button
        type="button"
        className={
          `image-gallery-fullscreen-button${isFullscreen ? ' active' : ''}`}
        onClick={onClick}
        aria-label="Open Fullscreen"
      />
    ),
  };

  initResizeObserver = debounce((entries) => {
    if (!entries) return;
    entries.forEach(() => {
      this.handleResize();
    });
  }, 300);

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
    this.addScreenChangeEvent();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      items,
      lazyLoad,
      slideDuration,
      startIndex,
    } = this.props;
    const { currentIndex } = this.state;
    const itemsSizeChanged = prevProps.items.length !== items.length;
    const itemsChanged = !isEqual(prevProps.items, items);
    const startIndexUpdated = prevProps.startIndex !== startIndex;
    if (itemsSizeChanged) {
      this.handleResize();
    }
    if (prevState.currentIndex !== currentIndex) {
      this.slideThumbnailBar(prevState.currentIndex);
    }
    // if slideDuration changes, update slideToIndex throttle
    if (prevProps.slideDuration !== slideDuration) {
      this.slideToIndex = throttle(
        this.unthrottledSlideToIndex, slideDuration, { trailing: false });
    }
    if (lazyLoad && (!prevProps.lazyLoad || itemsChanged)) {
      this.lazyLoaded = [];
    }

    if (startIndexUpdated || itemsChanged) {
      this.setState({ currentIndex: startIndex });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);

    this.removeScreenChangeEvent();

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.resizeObserver && this.imageGallerySlideWrapper) {
      this.resizeObserver.unobserve(this.imageGallerySlideWrapper);
    }

    if (this.transitionTimer) {
      window.clearTimeout(this.transitionTimer);
    }

    if (this.initResizeObserver) {
      this.initResizeObserver();
    }
  }

  setModalFullscreen(state) {
    const { onScreenChange } = this.props;
    this.setState({ modalFullscreen: state });
    // manually call because browser does not support screenchange events
    if (onScreenChange) {
      onScreenChange(state);
    }
  }

  onSliding = () => {
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
  };

  getCurrentIndex = () => {
    const { currentIndex } = this.state;
    return currentIndex;
  };

  handleScreenChange = () => {
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
  };

  toggleFullScreen = () => {
    const { isFullscreen } = this.state;
    if (isFullscreen) {
      this.exitFullScreen();
    } else {
      this.fullScreen();
    }
  };

  togglePlay = () => {
    if (this.intervalId) {
      this.pause();
    } else {
      this.play();
    }
  };

  initGalleryResizing = (element) => {
    /*
      When image-gallery-slide-wrapper unmounts and mounts when thumbnail bar position is changed
      ref is called twice, once with null and another with the element.
      Make sure element is available before calling observe.
    */
    if (element) {
      this.imageGallerySlideWrapper = element;
      this.resizeObserver = new ResizeObserver(this.initResizeObserver);
      this.resizeObserver.observe(element);
    }
  };

  handleResize = () => {
    const { currentIndex } = this.state;
    if (this.imageGallery) {
      this.setState({ galleryWidth: this.imageGallery.offsetWidth });
    }

    if (this.imageGallerySlideWrapper) {
      this.setState({ gallerySlideWrapperHeight: this.imageGallerySlideWrapper.offsetHeight });
    }

    if (this.thumbnailsWrapper) {
      if (this.isThumbnailVertical()) {
        this.setState({ thumbnailsWrapperHeight: this.thumbnailsWrapper.offsetHeight });
      } else {
        this.setState({ thumbnailsWrapperWidth: this.thumbnailsWrapper.offsetWidth });
      }
    }

    // Adjust thumbnail container when thumbnail width or height is adjusted
    this.setThumbsTranslate(-this.getThumbsTranslate(currentIndex));
  };

  handleKeyDown = (event) => {
    if (this.props.disableArrowKeys) {
      return;
    }
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const ESC_KEY = 27;
    const key = parseInt(event.keyCode || event.which || 0);

    switch(key) {
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
        if (this.state.isFullscreen && !this.props.useBrowserFullscreen) {
          this.exitFullScreen();
        }
    }
  };

  handleImageError = (event) => {
    if (this.props.onErrorImage &&
        event.target.src.indexOf(this.props.onErrorImage) === -1) {
      event.target.src = this.props.onErrorImage;
    }
  };

  setScrollDirection(dir) {
    const { scrollingUpDown, scrollingLeftRight } = this.state;

    if (!scrollingUpDown && !scrollingLeftRight) {
      if (dir === LEFT || dir === RIGHT) {
        this.setState({ scrollingLeftRight: true });
      } else {
        this.setState({ scrollingUpDown: true });
      }
    }
  };

  handleOnSwiped = ({ event, dir, velocity }) => {
    if (this.props.disableSwipe) return;
    const { scrollingUpDown, scrollingLeftRight } = this.state;
    const { isRTL } = this.props;
    if (this.props.stopPropagation) event.stopPropagation();
    if (scrollingUpDown) {
      // user stopped scrollingUpDown
      this.setState({ scrollingUpDown: false });
    }

    if (scrollingLeftRight) {
      // user stopped scrollingLeftRight
      this.setState({ scrollingLeftRight: false });
    }

    if (!scrollingUpDown) { // don't swipe if user is scrolling
      const side = (dir === LEFT ? 1 : -1) * (isRTL ? -1 : 1); // if it is RTL the direction is reversed
      const isFlick = velocity > this.props.flickThreshold;
      this.handleOnSwipedTo(side, isFlick);
    }
  };

  handleOnSwipedTo(side, isFlick) {
    const { currentIndex, isTransitioning } = this.state;
    let slideTo = currentIndex;

    if ((this.sufficientSwipeOffset() || isFlick) && !isTransitioning) {
      slideTo += side;
    }

    if (side < 0) {
      if (!this.canSlideLeft()) {
        slideTo = currentIndex;
      }
    } else {
      if (!this.canSlideRight()) {
        slideTo = currentIndex;
      }
    }

    this.unthrottledSlideToIndex(slideTo);
  }

  sufficientSwipeOffset() {
    return Math.abs(this.state.offsetPercentage) > this.props.swipeThreshold;
  }

  handleSwiping = ({ event, absX, dir }) => {
    if (this.props.disableSwipe) return;
    const { galleryWidth, isTransitioning, scrollingUpDown, scrollingLeftRight } = this.state;
    const { swipingTransitionDuration } = this.props;
    this.setScrollDirection(dir);
    if (this.props.stopPropagation) event.stopPropagation();
    if (
      (this.props.preventDefaultTouchmoveEvent || scrollingLeftRight)
      && event.cancelable
    ) event.preventDefault();
    if (!isTransitioning && !scrollingUpDown) {
      const side = dir === RIGHT ? 1 : -1;

      let offsetPercentage = (absX / galleryWidth * 100);
      if (Math.abs(offsetPercentage) >= 100) {
        offsetPercentage = 100;
      }

      const swipingTransition = {
        transition: `transform ${swipingTransitionDuration}ms ease-out`
      };

      this.setState({
        offsetPercentage: side * offsetPercentage,
        style: swipingTransition,
      });
    } else {
      // don't move the slide
      this.setState({ offsetPercentage: 0 });
    }
  };

  canNavigate() {
    return this.props.items.length >= 2;
  }

  canSlideLeft() {
    return this.props.infinite ||
      (this.props.isRTL ? this.canSlideNext() : this.canSlidePrevious());
  }

  canSlideRight() {
    return this.props.infinite ||
      (this.props.isRTL ? this.canSlidePrevious() : this.canSlideNext());
  }

  canSlidePrevious() {
    return this.state.currentIndex > 0;
  }

  canSlideNext() {
    return this.state.currentIndex < this.props.items.length - 1;
  }

  slideThumbnailBar(previousIndex) {
    const { thumbsTranslate, currentIndex } = this.state;
    if (this.state.currentIndex === 0) {
      this.setThumbsTranslate(0);
    } else {
      let indexDifference = Math.abs(previousIndex - currentIndex);
      let scroll = this.getThumbsTranslate(indexDifference);
      if (scroll > 0) {
        if (previousIndex < currentIndex) {
          this.setThumbsTranslate(thumbsTranslate - scroll);
        } else if (previousIndex > currentIndex) {
          this.setThumbsTranslate(thumbsTranslate + scroll);
        }
      }
    }
  }

  setThumbsTranslate(thumbsTranslate) {
    this.setState({ thumbsTranslate });
  }

  getThumbsTranslate(indexDifference) {
    if (this.props.disableThumbnailScroll) {
      return 0;
    }

    const {thumbnailsWrapperWidth, thumbnailsWrapperHeight} = this.state;
    let totalScroll;

    if (this.thumbnails) {
      // total scroll required to see the last thumbnail
      if (this.isThumbnailVertical()) {
        if (this.thumbnails.scrollHeight <= thumbnailsWrapperHeight) {
          return 0;
        }
        totalScroll = this.thumbnails.scrollHeight - thumbnailsWrapperHeight;
      } else {
        if (this.thumbnails.scrollWidth <= thumbnailsWrapperWidth || thumbnailsWrapperWidth <= 0) {
          return 0;
        }
        totalScroll = this.thumbnails.scrollWidth - thumbnailsWrapperWidth;
      }

      let totalThumbnails = this.thumbnails.children.length;
      // scroll-x required per index change
      let perIndexScroll = totalScroll / (totalThumbnails - 1);

      return indexDifference * perIndexScroll;

    }
  }

  getAlignmentClassName(index) {
    /*
      Necessary for lazing loading
    */
    let { currentIndex } = this.state;
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
    }

    if (this.props.items.length >= 3 && this.props.infinite) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ` ${rightClassName}`;
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ` ${leftClassName}`;
      }
    }

    return alignment;
  }

  isGoingFromFirstToLast() {
    const {currentIndex, previousIndex} = this.state;
    const totalSlides = this.props.items.length - 1;
    return previousIndex === 0 && currentIndex === totalSlides;
  }

  isGoingFromLastToFirst() {
    const {currentIndex, previousIndex} = this.state;
    const totalSlides = this.props.items.length - 1;
    return previousIndex === totalSlides && currentIndex === 0;
  }

  getTranslateXForTwoSlide(index) {
    // For taking care of infinite swipe when there are only two slides
    const {currentIndex, offsetPercentage, previousIndex} = this.state;
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
      if (previousIndex === 0 && index === 0 &&
          offsetPercentage === 0 && this.direction === 'left') {
        translateX = 100;
      } else if (previousIndex === 1 && index === 1 &&
          offsetPercentage === 0 && this.direction === 'right') {
        translateX = -100;
      }
    } else {
      // keep the slide on the correct slide even when not a swipe
      if (currentIndex === 0 && index === 1 &&
          offsetPercentage === 0 && this.direction === 'left') {
        translateX = -100;
      } else if (currentIndex === 1 && index === 0 &&
          offsetPercentage === 0 && this.direction === 'right') {
        translateX = 100;
      }
    }

    return translateX;
  }

  getThumbnailBarHeight() {
    if (this.isThumbnailVertical()) {
      return {
        height: this.state.gallerySlideWrapperHeight
      };
    }
    return {};
  }

  shouldPushSlideOnInfiniteMode(index) {
    /*
      Push(show) slide if slide is the current slide, and the next slide
      OR
      The slide is going more than 1 slide left, or right, but not going from
      first to last and not going from last to first

      There is an edge case where if you go to the first or last slide, when they're
      not left, or right of each other they will try to catch up in the background
      so unless were going from first to last or vice versa we don't want the first
      or last slide to show up during our transition
    */
    return !this.slideIsTransitioning(index) ||
      (this.ignoreIsTransitioning() && !this.isFirstOrLastSlide(index));
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

  isFirstOrLastSlide(index) {
    const totalSlides = this.props.items.length - 1;
    const isLastSlide = index === totalSlides;
    const isFirstSlide = index === 0;
    return isLastSlide || isFirstSlide;
  }

  ignoreIsTransitioning() {
    /*
      Ignore isTransitioning because were not going to sibling slides
      e.g. center to left or center to right
    */
    const { previousIndex, currentIndex } = this.state;
    const totalSlides = this.props.items.length - 1;
    // we want to show the in between slides transition
    const slidingMoreThanOneSlideLeftOrRight = Math.abs(previousIndex - currentIndex) > 1;
    const notGoingFromFirstToLast = !(previousIndex === 0 && currentIndex === totalSlides);
    const notGoingFromLastToFirst = !(previousIndex === totalSlides && currentIndex === 0);

    return slidingMoreThanOneSlideLeftOrRight &&
      notGoingFromFirstToLast &&
      notGoingFromLastToFirst;
  }

  getSlideStyle(index) {
    const { currentIndex, offsetPercentage } = this.state;
    const { infinite, items, useTranslate3D, isRTL } = this.props;
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

    return {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate,
    };
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

  slideToIndex = (index, event) => {
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
        style: { transition: `all ${slideDuration}ms ease-out` },
      }, this.onSliding);
    }
  };

  slideLeft = () => {
    const { isRTL } = this.props;
    if (isRTL) {
      this.slideNext();
    } else {
      this.slidePrevious();
    }
  };

  slideRight = () => {
    const { isRTL } = this.props;
    if (isRTL) {
      this.slidePrevious();
    } else {
      this.slideNext();
    }
  };

  slidePrevious = (event) => {
    const { currentIndex } = this.state;
    this.slideToIndex(currentIndex - 1, event);
  };

  slideNext = (event) => {
    const { currentIndex } = this.state;
    this.slideToIndex(currentIndex + 1, event);
  };

  renderItem = (item) => {
    const { onImageError } = this.props;
    const { onImageLoad } = this.props;
    const handleImageError = onImageError || this.handleImageError;

    return (
      <div className="image-gallery-image">
        {
          item.imageSet ? (
            <picture
              onLoad={onImageLoad}
              onError={handleImageError}
            >
              {
                item.imageSet.map((source) => (
                  <source
                    key={source.media}
                    media={source.media}
                    srcSet={source.srcSet}
                    type={source.type}
                  />
                ))
              }
              <img
                alt={item.originalAlt}
                src={item.original}
              />
            </picture>
          ) : (
            <img
              src={item.original}
              alt={item.originalAlt}
              srcSet={item.srcSet}
              sizes={item.sizes}
              title={item.originalTitle}
              onLoad={onImageLoad}
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
  };

  renderThumbInner = (item) => {
    const { onThumbnailError } = this.props;
    const handleThumbnailError = onThumbnailError || this.handleImageError;

    return (
      <div className="image-gallery-thumbnail-inner">
        <img
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
  };

  onThumbnailClick = (event, index) => {
    const { onThumbnailClick } = this.props;
    this.slideToIndex(index, event);
    if (onThumbnailClick) {
      onThumbnailClick(event, index);
    }
  };

  onThumbnailMouseOver = (event, index) => {
    if (this.thumbnailMouseOverTimer) {
      window.clearTimeout(this.thumbnailMouseOverTimer);
      this.thumbnailMouseOverTimer = null;
    }
    this.thumbnailMouseOverTimer = window.setTimeout(() => {
      this.slideToIndex(index);
      this.pause();
    }, 300);
  };

  onThumbnailMouseLeave = () => {
    if (this.thumbnailMouseOverTimer) {
      const { autoPlay } = this.props;
      window.clearTimeout(this.thumbnailMouseOverTimer);
      this.thumbnailMouseOverTimer = null;
      if (autoPlay) {
        this.play();
      }
    }
  };

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
    const gallery = this.imageGallery;
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

  play(shouldCallOnPlay = true) {
    const { infinite, onPlay } = this.props;
    const { currentIndex } = this.state;
    if (!this.intervalId) {
      const { slideInterval, slideDuration } = this.props;
      this.setState({ isPlaying: true });
      this.intervalId = window.setInterval(() => {
        if (!infinite && !this.canSlideRight()) {
          this.pause();
        } else {
          this.slideToIndex(currentIndex + 1);
        }
      }, Math.max(slideInterval, slideDuration));
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

  render() {
    const {
      currentIndex,
      isFullscreen,
      modalFullscreen,
      isPlaying,
    } = this.state;

    const {
      infinite,
      slideOnThumbnailOver,
      isRTL,
      items,
      lazyLoad,
      thumbnailPosition,
      renderItem,
      renderThumbInner,
    } = this.props;

    const thumbnailStyle = this.getThumbnailStyle();
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
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          style={Object.assign(slideStyle, this.state.style)}
          onClick={this.props.onClick}
          onTouchMove={this.props.onTouchMove}
          onTouchEnd={this.props.onTouchEnd}
          onTouchStart={this.props.onTouchStart}
          onMouseOver={this.props.onMouseOver}
          onMouseLeave={this.props.onMouseLeave}
          role={this.props.onClick && 'button'}
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

      if (this.props.showThumbnails) {
        thumbnails.push(
          <a
            key={index}
            role='button'
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
            className={
              'image-gallery-thumbnail' +
              (currentIndex === index ? ' active' : '') +
              thumbnailClass
            }
            onMouseLeave={slideOnThumbnailOver ? this.onThumbnailMouseLeave : undefined}
            onMouseOver={event => slideOnThumbnailOver ? this.onThumbnailMouseOver(event, index) : undefined}
            onClick={event => this.onThumbnailClick(event, index)}
          >
            {handleRenderThumbInner(item)}
          </a>
        );
      }

      if (this.props.showBullets) {
        const bulletOnClick = event => {
          if(item.bulletOnClick){
            item.bulletOnClick({item, itemIndex: index, currentIndex});
          }
          return this.slideToIndex.call(this, index, event);
        };
        bullets.push(
          <button
            key={index}
            type='button'
            className={[
              'image-gallery-bullet',
              currentIndex === index ? 'active' : '',
              item.bulletClass || ''
            ].join(' ')}
            onClick={bulletOnClick}
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
          >
          </button>
        );
      }
    });

    const slideWrapper = (
      <div
        ref={this.initGalleryResizing}
        className={`image-gallery-slide-wrapper ${thumbnailPosition} ${isRTL ? 'image-gallery-rtl' : ''}`}
      >

        {this.props.renderCustomControls && this.props.renderCustomControls()}

        {
          this.props.showFullscreenButton &&
            this.props.renderFullscreenButton(this.toggleFullScreen, isFullscreen)
        }

        {
          this.props.showPlayButton &&
            this.props.renderPlayPauseButton(this.togglePlay, isPlaying)
        }

        {
          this.canNavigate() ?
            [
              this.props.showNav &&
                <span key='navigation'>
                  {this.props.renderLeftNav(this.slideLeft, !this.canSlideLeft())}
                  {this.props.renderRightNav(this.slideRight, !this.canSlideRight())}
                </span>,

                <Swipeable
                  className='image-gallery-swipe'
                  key='swipeable'
                  delta={0}
                  onSwiping={this.handleSwiping}
                  onSwiped={this.handleOnSwiped}
                >
                  <div className='image-gallery-slides'>
                    {slides}
                  </div>
              </Swipeable>
            ]
          :
            <div className='image-gallery-slides'>
              {slides}
            </div>
        }
        {
          this.props.showBullets &&
            <div className='image-gallery-bullets'>
              <div
                className='image-gallery-bullets-container'
                role='navigation'
                aria-label='Bullet Navigation'
              >
                {bullets}
              </div>
            </div>
        }
        {
          this.props.showIndex &&
            <div className='image-gallery-index'>
              <span className='image-gallery-index-current'>
                {this.state.currentIndex + 1}
              </span>
              <span className='image-gallery-index-separator'>
                {this.props.indexSeparator}
              </span>
              <span className='image-gallery-index-total'>
                {this.props.items.length}
              </span>
            </div>
        }
      </div>
    );

    const classNames = [
      'image-gallery',
      this.props.additionalClass,
      modalFullscreen ? 'fullscreen-modal' : '',
    ].filter(name => typeof name === 'string').join(' ');

    return (
      <div
        ref={i => this.imageGallery = i}
        className={classNames}
        aria-live='polite'
      >

        <div
          className={`image-gallery-content${isFullscreen ? ' fullscreen' : ''}`}
        >

          {
            (thumbnailPosition === 'bottom' || thumbnailPosition === 'right') &&
              slideWrapper
          }
          {
            this.props.showThumbnails &&
              <div
                className={`image-gallery-thumbnails-wrapper ${thumbnailPosition} ${!this.isThumbnailVertical() && isRTL ? 'thumbnails-wrapper-rtl' : ''}`}
                style={this.getThumbnailBarHeight()}
              >
                <div
                  className='image-gallery-thumbnails'
                  ref={i => this.thumbnailsWrapper = i}
                >
                  <div
                    ref={t => this.thumbnails = t}
                    className='image-gallery-thumbnails-container'
                    style={thumbnailStyle}
                    aria-label='Thumbnail Navigation'
                  >
                    {thumbnails}
                  </div>
                </div>
              </div>
          }
          {
            (thumbnailPosition === 'top' || thumbnailPosition === 'left') &&
              slideWrapper
          }

        </div>

      </div>
    );
  }

}
