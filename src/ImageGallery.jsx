import React from 'react';
import Swipeable from 'react-swipeable';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import ResizeObserver from 'resize-observer-polyfill';
import PropTypes from 'prop-types';

const screenChangeEvents = [
  'fullscreenchange',
  'MSFullscreenChange',
  'mozfullscreenchange',
  'webkitfullscreenchange'
];

const Constants = Object.freeze({
  LEFT: ' left',
  CENTER: ' center',
  RIGHT: ' right',
});

export default class ImageGallery extends React.Component {

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
      isPlaying: false
    };

    // Used to update the throttle if slideDuration changes
    this._unthrottledSlideToIndex = this.slideToIndex;
    this.slideToIndex = throttle(this._unthrottledSlideToIndex,
                                 props.slideDuration,
                                {trailing: false});

    if (props.lazyLoad) {
      this._lazyLoaded = [];
    }
  }

  static propTypes = {
    flickThreshold: PropTypes.number,
    items: PropTypes.array.isRequired,
    showNav: PropTypes.bool,
    autoPlay: PropTypes.bool,
    lazyLoad: PropTypes.bool,
    lazyLoadNext: PropTypes.bool,
    showIndex: PropTypes.bool,
    showBullets: PropTypes.bool,
    showThumbnails: PropTypes.bool,
    showPlayButton: PropTypes.bool,
    showFullscreenButton: PropTypes.bool,
    disableThumbnailScroll: PropTypes.bool,
    disableArrowKeys: PropTypes.bool,
    disableSwipe: PropTypes.bool,
    useBrowserFullscreen: PropTypes.bool,
    preventDefaultTouchmoveEvent: PropTypes.bool,
    defaultImage: PropTypes.string,
    indexSeparator: PropTypes.string,
    thumbnailPosition: PropTypes.string,
    startIndex: PropTypes.number,
    slideDuration: PropTypes.number,
    slideInterval: PropTypes.number,
    swipeThreshold: PropTypes.number,
    swipingTransitionDuration: PropTypes.number,
    onSlide: PropTypes.func,
    onScreenChange: PropTypes.func,
    onPause: PropTypes.func,
    onPlay: PropTypes.func,
    onClick: PropTypes.func,
    onImageLoad: PropTypes.func,
    onImageError: PropTypes.func,
    onTouchMove: PropTypes.func,
    onTouchEnd: PropTypes.func,
    onTouchStart: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onImageGalleryReady: PropTypes.func,
    onItemsGalleryChange: PropTypes.func,
    onThumbnailError: PropTypes.func,
    onThumbnailClick: PropTypes.func,
    renderCustomControls: PropTypes.func,
    renderLeftNav: PropTypes.func,
    renderRightNav: PropTypes.func,
    renderPlayPauseButton: PropTypes.func,
    renderFullscreenButton: PropTypes.func,
    renderItem: PropTypes.func,
    stopPropagation: PropTypes.bool,
    additionalClass: PropTypes.string,
    useTranslate3D: PropTypes.bool,
    isRTL: PropTypes.bool,
    disableNavigation: PropTypes.bool
  };

  static defaultProps = {
    items: [],
    showNav: true,
    autoPlay: false,
    lazyLoad: false,
    lazyLoadNext: true,
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
    slideInterval: 3000,
    swipeThreshold: 30,
    renderLeftNav: (onClick, disabled) => {
      return (
        <button
          type='button'
          className='image-gallery-left-nav'
          disabled={disabled}
          onClick={onClick}
          aria-label='Previous Slide'
        />
      );
    },
    renderRightNav: (onClick, disabled) => {
      return (
        <button
          type='button'
          className='image-gallery-right-nav'
          disabled={disabled}
          onClick={onClick}
          aria-label='Next Slide'
        />
      );
    },
    renderPlayPauseButton: (onClick, isPlaying) => {
      return (
        <button
          type='button'
          className={
            `image-gallery-play-button${isPlaying ? ' active' : ''}`}
          onClick={onClick}
          aria-label='Play or Pause Slideshow'
        />
      );
    },
    renderFullscreenButton: (onClick, isFullscreen) => {
      return (
        <button
          type='button'
          className={
            `image-gallery-fullscreen-button${isFullscreen ? ' active' : ''}`}
          onClick={onClick}
          aria-label='Open Fullscreen'
        />
      );
    },
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.disableArrowKeys !== nextProps.disableArrowKeys) {
      if (nextProps.disableArrowKeys) {
        window.removeEventListener('keydown', this._handleKeyDown);
      } else {
        window.addEventListener('keydown', this._handleKeyDown);
      }
    }

    if (nextProps.lazyLoad &&
      (!this.props.lazyLoad || this.props.items !== nextProps.items)) {
      this._lazyLoaded = [];
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const itemsChanged = prevProps.items.length !== this.props.items.length;
    if (itemsChanged) {
        const prevCoverPhoto = prevProps.items[prevProps.startIndex] || {};
        const newCoverPhoto = this.props.items[this.props.startIndex] || {};
        const coverPhotoChanged = prevCoverPhoto.id !== newCoverPhoto.id;

        if (coverPhotoChanged && this.props.onItemsGalleryChange) {
            // call the callback function
            this.props.onItemsGalleryChange();
        }
        //if index has changed go to the startIndex (transition is not visible)
        const indexChange = this.props.startIndex !== prevState.currentIndex;
        if(indexChange) {
            this.setState({
                currentIndex: this.props.startIndex,
                style: {
                    transition: 'all 0ms ease'
                }
            });
        }
        this._handleResize();
    }
    if (prevState.currentIndex !== this.state.currentIndex) {
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex);
      }

      this._updateThumbnailTranslate(prevState.currentIndex);
    }

    if (prevProps.slideDuration !== this.props.slideDuration) {
      this.slideToIndex = throttle(this._unthrottledSlideToIndex,
                                   this.props.slideDuration,
                                   {trailing: false});
    }
  }

  componentDidMount() {
    if (this.props.autoPlay) {
      this.play();
    }
    if (!this.props.disableArrowKeys) {
      window.addEventListener('keydown', this._handleKeyDown);
    }
    this._onScreenChangeEvent();
  }

  componentWillUnmount() {
    if (!this.props.disableArrowKeys) {
      window.removeEventListener('keydown', this._handleKeyDown);
    }

    this._offScreenChangeEvent();

    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }

    if(this.resizeObserver && this._imageGallerySlideWrapper) {
      this.resizeObserver.unobserve(this._imageGallerySlideWrapper);
    }

    if (this._transitionTimer) {
      window.clearTimeout(this._transitionTimer);
    }

    if (this._createResizeObserver) {
      this._createResizeObserver();
    }
  }

  play(callback = true) {
    if (!this._intervalId) {
      const {slideInterval, slideDuration} = this.props;
      this.setState({isPlaying: true});
      this._intervalId = window.setInterval(() => {
        if (!this.state.hovering) {
          this.slideToIndex(this.state.currentIndex + 1);
        }
      }, Math.max(slideInterval, slideDuration));

      if (this.props.onPlay && callback) {
        this.props.onPlay(this.state.currentIndex);
      }
    }

  }

  pause(callback = true) {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.setState({isPlaying: false});

      if (this.props.onPause && callback) {
        this.props.onPause(this.state.currentIndex);
      }
    }
  }

  setModalFullscreen(state) {
      this.setState({modalFullscreen: state});
      // manually call because browser does not support screenchange events
      if (this.props.onScreenChange) {
        this.props.onScreenChange(state);
      }
  }

  fullScreen() {
    const gallery = this._imageGallery;

    if (this.props.useBrowserFullscreen) {
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

    this.setState({isFullscreen: true});

  }

  exitFullScreen() {
    if (this.state.isFullscreen) {
      if (this.props.useBrowserFullscreen) {
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

      this.setState({isFullscreen: false});

    }
  }

  slideToIndex = (index, event) => {
    const {currentIndex, isTransitioning} = this.state;

    if (!isTransitioning) {
      if (event) {
        if (this._intervalId) {
          // user triggered event while ImageGallery is playing, reset interval
          this.pause(false);
          this.play(false);
        }
      }

      let slideCount = this.props.items.length - 1;
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
        style: {
          transition: `all ${this.props.slideDuration}ms ease`
        }
      }, this._onSliding);
    }
  };

  _onSliding = () => {
    const { isTransitioning } = this.state;
    this._transitionTimer = window.setTimeout(() => {
      if (isTransitioning) {
        this.setState({isTransitioning: !isTransitioning});
      }
    }, this.props.slideDuration + 50);
  };

  getCurrentIndex() {
    return this.state.currentIndex;
  }

  _handleScreenChange = () => {
    /*
      handles screen change events that the browser triggers e.g. esc key
    */
    const fullScreenElement = document.fullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;

    if (this.props.onScreenChange) {
      this.props.onScreenChange(fullScreenElement);
    }

    this.setState({isFullscreen: !!fullScreenElement});
  };

  _onScreenChangeEvent() {
    screenChangeEvents.map(eventName => {
      document.addEventListener(eventName, this._handleScreenChange);
    });
  }

  _offScreenChangeEvent() {
    screenChangeEvents.map(eventName => {
      document.removeEventListener(eventName, this._handleScreenChange);
    });
  }

  _toggleFullScreen = () => {
    if (this.state.isFullscreen) {
      this.exitFullScreen();
    } else {
      this.fullScreen();
    }
  };

  _togglePlay = () => {
    if (this._intervalId) {
      this.pause();
    } else {
      this.play();
    }
  };

  _initGalleryResizing = (element) => {
    /*
      When image-gallery-slide-wrapper unmounts and mounts when thumbnail bar position is changed
      ref is called twice, once with null and another with the element.
      Make sure element is available before calling observe.
    */
    if (element) {
      this._imageGallerySlideWrapper = element;
      this.resizeObserver = new ResizeObserver(this._createResizeObserver);
      this.resizeObserver.observe(element);
    }
  };

  _createResizeObserver = debounce((entries) => {
    if (!entries) return;
    entries.forEach(() => {
      this._handleResize();
    });
  }, 300);

  _handleResize = () => {
    const { currentIndex } = this.state;

    const previousGalleryWidth = this.state.galleryWidth;
    if (this._imageGallery && this._imageGallery.offsetWidth > 0) {
      this.setState({
        galleryWidth: this._imageGallery.offsetWidth
      });
      if (this.props.onImageGalleryReady && this._imageGallery.offsetWidth > 0 && previousGalleryWidth === 0) {
        this.props.onImageGalleryReady();
      }
    }

    if (this._imageGallerySlideWrapper) {
      this.setState({
        gallerySlideWrapperHeight: this._imageGallerySlideWrapper.offsetHeight
      });
    }

    if (this._thumbnailsWrapper && this._thumbnailsWrapper.offsetHeight != 0 && this._thumbnailsWrapper.offsetWidth != 0) {
      if (this._isThumbnailHorizontal()) {
          this.setState({thumbnailsWrapperHeight: this._thumbnailsWrapper.offsetHeight});
      } else {
            this.setState({thumbnailsWrapperWidth: this._thumbnailsWrapper.offsetWidth});
      }
      // Adjust thumbnail container when thumbnail width or height is adjusted
      this._setThumbsTranslate(-this._getThumbsTranslate(currentIndex));
    }
  };

  _isThumbnailHorizontal() {
    const { thumbnailPosition } = this.props;
    return thumbnailPosition === 'left' || thumbnailPosition === 'right';
  }

  _handleKeyDown = (event) => {
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const ESC_KEY = 27;
    const key = parseInt(event.keyCode || event.which || 0);

    switch(key) {
      case LEFT_ARROW:
        if (this._canSlideLeft() && !this._intervalId) {
          this._slideLeft();
        }
        break;
      case RIGHT_ARROW:
        if (this._canSlideRight() && !this._intervalId) {
          this._slideRight();
        }
        break;
      case ESC_KEY:
        if (this.state.isFullscreen && !this.props.useBrowserFullscreen) {
          this.exitFullScreen();
        }
    }
  };

  _handleImageError = (event) => {
    if (this.props.defaultImage &&
        event.target.src.indexOf(this.props.defaultImage) === -1) {
      event.target.src = this.props.defaultImage;
    }
  };

  _setScrollDirection(deltaX, deltaY) {
    const { scrollingUpDown, scrollingLeftRight } = this.state;
    const x = Math.abs(deltaX);
    const y = Math.abs(deltaY);

    // If y > x the user is scrolling up and down
    if (y > x && !scrollingUpDown && !scrollingLeftRight) {
      this.setState({ scrollingUpDown: true });
    } else if (!scrollingLeftRight && !scrollingUpDown) {
      this.setState({ scrollingLeftRight: true });
    }
  };

  _handleOnSwiped = (e, deltaX, deltaY, isFlick) => {
    const { scrollingUpDown, scrollingLeftRight } = this.state;
    const { isRTL } = this.props;
    if (scrollingUpDown) {
      // user stopped scrollingUpDown
      this.setState({ scrollingUpDown: false });
    }

    if (scrollingLeftRight) {
      // user stopped scrollingLeftRight
      this.setState({ scrollingLeftRight: false });
    }

    if (!scrollingUpDown) { // don't swipe if user is scrolling
      const side = (deltaX > 0 ? 1 : -1) * (isRTL ? -1 : 1);//if it is RTL the direction is reversed
      this._handleOnSwipedTo(side, isFlick);
    }
  };

  _handleOnSwipedTo(side, isFlick) {
    const { currentIndex, isTransitioning } = this.state;
    let slideTo = currentIndex;

    if ((this._sufficientSwipeOffset() || isFlick) && !isTransitioning) {
      slideTo += side;
    }

    if (side < 0) {
      if (!this._canSlideLeft()) {
        slideTo = currentIndex;
      }
    } else {
      if (!this._canSlideRight()) {
        slideTo = currentIndex;
      }
    }

    this._unthrottledSlideToIndex(slideTo);
  }

  _sufficientSwipeOffset() {
    return Math.abs(this.state.offsetPercentage) > this.props.swipeThreshold;
  }

  _handleSwiping = (e, deltaX, deltaY, delta) => {
    const { galleryWidth, isTransitioning, scrollingUpDown } = this.state;
    const { swipingTransitionDuration } = this.props;
    this._setScrollDirection(deltaX, deltaY);
    if (!isTransitioning && !scrollingUpDown) {
      const side = deltaX < 0 ? 1 : -1;

      let offsetPercentage = (delta / galleryWidth * 100);
      if (Math.abs(offsetPercentage) >= 100) {
        offsetPercentage = 100;
      }

      const swipingTransition = {
        transition: `all ${swipingTransitionDuration}ms ease`
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

  _canNavigate() {
    return (this.props.items.length >= 2 && !this.props.disableNavigation);
  }

  _canSlideLeft() {
    return this.props.isRTL ? this._canSlideNext() : this._canSlidePrevious();
  }

  _canSlideRight() {
    return this.props.isRTL ? this._canSlidePrevious() : this._canSlideNext();
  }

  _canSlidePrevious() {
    return this.state.currentIndex > 0;
  }

  _canSlideNext() {
    return this.state.currentIndex < this.props.items.length - 1;
  }

  _updateThumbnailTranslate(previousIndex) {
    const { thumbsTranslate, currentIndex } = this.state;
    if (this.state.currentIndex === 0) {
      this._setThumbsTranslate(0);
    } else {
      let indexDifference = Math.abs(previousIndex - currentIndex);
      let scroll = this._getThumbsTranslate(indexDifference);
      if (scroll > 0) {
        if (previousIndex < currentIndex) {
          this._setThumbsTranslate(thumbsTranslate - scroll);
        } else if (previousIndex > currentIndex) {
          this._setThumbsTranslate(thumbsTranslate + scroll);
        }
      }
    }
  }

  _setThumbsTranslate(thumbsTranslate) {
    this.setState({thumbsTranslate});
  }

  _getThumbsTranslate(indexDifference) {
    if (this.props.disableThumbnailScroll) {
      return 0;
    }

    const {thumbnailsWrapperWidth, thumbnailsWrapperHeight} = this.state;
    let totalScroll;

    if (this._thumbnails) {
      // total scroll required to see the last thumbnail
      if (this._isThumbnailHorizontal()) {
        if (this._thumbnails.scrollHeight <= thumbnailsWrapperHeight) {
          return 0;
        }
        totalScroll = this._thumbnails.scrollHeight - thumbnailsWrapperHeight;
      } else {
        if (this._thumbnails.scrollWidth <= thumbnailsWrapperWidth || thumbnailsWrapperWidth <= 0) {
          return 0;
        }
        totalScroll = this._thumbnails.scrollWidth - thumbnailsWrapperWidth;
      }

      let totalThumbnails = this._thumbnails.children.length;
      // scroll-x required per index change
      let perIndexScroll = totalScroll / (totalThumbnails - 1);

      return indexDifference * perIndexScroll;

    }
  }

  _getAlignmentClassName(index) {
    // LEFT, and RIGHT alignments are necessary for lazyLoad
    let {currentIndex} = this.state;
    let alignment = '';

    switch (index) {
      case (currentIndex - 1):
        alignment = Constants.LEFT;
        break;
      case (currentIndex):
        alignment = Constants.CENTER;
        break;
      case (currentIndex + 1):
        alignment = Constants.RIGHT;
        break;
    }

    if (this.props.items.length >= 3) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = Constants.RIGHT;
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = Constants.LEFT;
      }
    }

    return alignment;
  }

  _isGoingFromFirstToLast() {
    const {currentIndex, previousIndex} = this.state;
    const totalSlides = this.props.items.length - 1;
    return previousIndex === 0 && currentIndex === totalSlides;
  }

  _isGoingFromLastToFirst() {
    const {currentIndex, previousIndex} = this.state;
    const totalSlides = this.props.items.length - 1;
    return previousIndex === totalSlides && currentIndex === 0;
  }

  _getTranslateXForTwoSlide(index) {
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

  _getThumbnailBarHeight() {
    if (this._isThumbnailHorizontal()) {
      return {
        height: this.state.gallerySlideWrapperHeight
      };
    }
    return {};
  }

  _slideIsTransitioning(index) {
    /*
    returns true if the gallery is transitioning and the index is not the
    previous or currentIndex
    */
    const { isTransitioning, previousIndex, currentIndex } = this.state;
    const indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
    return isTransitioning && indexIsNotPreviousOrNextSlide;
  }

  _isFirstOrLastSlide(index) {
    const totalSlides = this.props.items.length - 1;
    const isLastSlide = index === totalSlides;
    const isFirstSlide = index === 0;
    return isLastSlide || isFirstSlide;
  }

  _ignoreIsTransitioning() {
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

  _getSlideStyle() {
    return {
        Width: this.state.galleryWidth
    };
  }

  _getSlidesStyle() {
      const { currentIndex, offsetPercentage } = this.state;
      const { useTranslate3D } = this.props;

      // let translateX = currentIndex * -100 + offsetPercentage;
      let translateX = currentIndex * -100;

      if (!this._canSlideLeft() && offsetPercentage > 0) {
          translateX += (offsetPercentage / 3);
      }
      else if (!this._canSlideRight() && offsetPercentage < 0) {
          translateX += (offsetPercentage / 3);
      }
      else {
          translateX += offsetPercentage;
      }
      // console.log(translateX, offsetPercentage);

      let translate = `translate(${translateX * this.state.galleryWidth }px, 0)`;

      if (useTranslate3D) {
        translate = `translate3d(${(translateX / 100) * this.state.galleryWidth}px, 0, 0)`;
      }

      return {
          WebkitTransform: translate,
          MozTransform: translate,
          msTransform: translate,
          OTransform: translate,
          transform: translate,
      };
  }

  _getThumbnailStyle() {
    let translate;
    const { useTranslate3D, isRTL } = this.props;
    const { thumbsTranslate } = this.state;
    const verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

    if (this._isThumbnailHorizontal()) {
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
      transform: translate
    };
  }

  _slideLeft = (event) => {
    this.props.isRTL ? this._slideNext(event) : this.ـslidePrevious(event);
  };

  _slideRight = (event) => {
    this.props.isRTL ? this.ـslidePrevious(event) : this._slideNext(event);
  };

  ـslidePrevious = (event) => {
    this.slideToIndex(this.state.currentIndex - 1, event);
  };

  _slideNext = (event) => {
    this.slideToIndex(this.state.currentIndex + 1, event);
  };

  _renderItem = (item) => {
    const onImageError = this.props.onImageError || this._handleImageError;

    return (
      <div className='image-gallery-image'>
        {
          item.imageSet ?
            <picture
              onLoad={this.props.onImageLoad}
              onError={onImageError}
            >
              {
                item.imageSet.map((source, index) => (
                  <source
                    key={index}
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
          :
            <img
              src={item.original}
              alt={item.originalAlt}
              srcSet={item.srcSet}
              sizes={item.sizes}
              title={item.originalTitle}
              onLoad={this.props.onImageLoad}
              onError={onImageError}
            />
        }

        {
          item.description &&
            <span className='image-gallery-description'>
              {item.description}
            </span>
        }
      </div>
    );
  };

  _renderThumbInner = (item) => {
    let onThumbnailError = this.props.onThumbnailError || this._handleImageError;

    return (
      <div className='image-gallery-thumbnail-inner'>
        <img
          src={item.thumbnail}
          alt={item.thumbnailAlt}
          title={item.thumbnailTitle}
          onError={onThumbnailError}
        />
        {item.thumbnailLabel &&
          <div className='image-gallery-thumbnail-label'>
            {item.thumbnailLabel}
          </div>
        }
      </div>
    );
  };

  _onThumbnailClick = (event, index) => {
    this.slideToIndex(index, event);
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(event, index);
    }
  };

  _shouldShowItem = (alignment, index) => {
    const showNext = this.props.lazyLoadNext && alignment;
    const showMain = !this.props.lazyLoadNext && (alignment === Constants.CENTER);

    const showItem =
        !this.props.lazyLoad ||
        showNext ||
        showMain ||
        this._lazyLoaded[index];

    return showItem;
  };

  render() {
    const {
      currentIndex,
      isFullscreen,
      modalFullscreen,
      isPlaying,
      scrollingLeftRight,
    } = this.state;

    const {
      preventDefaultTouchmoveEvent,
      isRTL,
    } = this.props;

    const thumbnailStyle = this._getThumbnailStyle();
    const thumbnailPosition = this.props.thumbnailPosition;

    const slideLeft = this._slideLeft;
    const slideRight = this._slideRight;

    let slides = [];
    let thumbnails = [];
    let bullets = [];

    this.props.items.forEach((item, index) => {
      const alignment = this._getAlignmentClassName(index);
      const originalClass = item.originalClass ?
        ` ${item.originalClass}` : '';
      const thumbnailClass = item.thumbnailClass ?
        ` ${item.thumbnailClass}` : '';

      const renderItem = item.renderItem ||
        this.props.renderItem || this._renderItem;

      const renderThumbInner = item.renderThumbInner ||
        this.props.renderThumbInner || this._renderThumbInner;


      const showItem = this._shouldShowItem(alignment, index);
      if (showItem && this.props.lazyLoad && !this._lazyLoaded[index]) {
        this._lazyLoaded[index] = true;
      }

      const slide = (
        <div
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          style={{'width': this.state.galleryWidth}}
          onClick={this.props.onClick}
          onTouchMove={this.props.onTouchMove}
          onTouchEnd={this.props.onTouchEnd}
          onTouchStart={this.props.onTouchStart}
          onMouseOver={this.props.onMouseOver}
          onMouseLeave={this.props.onMouseLeave}
          role={this.props.onClick && 'button'}
        >
          {showItem ? renderItem(item) : <div style={{ height: '100%' }}></div>}
        </div>
      );

      slides.push(slide);
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
            onClick={event => this._onThumbnailClick(event, index)}
          >
            {renderThumbInner(item)}
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
        ref={this._initGalleryResizing}
        className={`image-gallery-slide-wrapper ${thumbnailPosition} ${isRTL ? 'image-gallery-rtl' : ''}`}
      >

        {this.props.renderCustomControls && this.props.renderCustomControls()}

        {
          this.props.showFullscreenButton &&
            this.props.renderFullscreenButton(this._toggleFullScreen, isFullscreen)
        }

        {
          this.props.showPlayButton &&
            this.props.renderPlayPauseButton(this._togglePlay, isPlaying)
        }

        {
          this._canNavigate() ?
            [
              this.props.showNav &&
                <span key='navigation'>
                  {this.props.renderLeftNav(slideLeft, !this._canSlideLeft())}
                  {this.props.renderRightNav(slideRight, !this._canSlideRight())}
                </span>,

                <Swipeable
                  className='image-gallery-swipe'
                  disabled={this.props.disableSwipe}
                  key='swipeable'
                  delta={0}
                  flickThreshold={this.props.flickThreshold}
                  onSwiping={this._handleSwiping}
                  onSwiped={this._handleOnSwiped}
                  stopPropagation={this.props.stopPropagation}
                  preventDefaultTouchmoveEvent={preventDefaultTouchmoveEvent || scrollingLeftRight}
                >
                  <div
                      className='image-gallery-slides'
                      style={Object.assign(this._getSlidesStyle(), this.state.style)}
                  >
                    {slides}
                  </div>
              </Swipeable>
            ]
          :
            <div
                className='image-gallery-slides'
                style={this._getSlidesStyle()}
            >
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
        ref={i => this._imageGallery = i}
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
                className={`image-gallery-thumbnails-wrapper ${thumbnailPosition} ${!this._isThumbnailHorizontal() && isRTL ? 'thumbnails-wrapper-rtl' : ''}`}
                style={this._getThumbnailBarHeight()}
              >
                <div
                  className='image-gallery-thumbnails'
                  ref={i => this._thumbnailsWrapper = i}
                >
                  <div
                    ref={t => this._thumbnails = t}
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
