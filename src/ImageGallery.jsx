import React from 'react';
import Swipeable from 'react-swipeable';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';

const screenChangeEvents = [
  'fullscreenchange',
  'msfullscreenchange',
  'mozfullscreenchange',
  'webkitfullscreenchange'
];

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

    if (props.lazyLoad) {
      this._lazyLoaded = [];
    }
  }

  static propTypes = {
    items: PropTypes.array.isRequired,
    showNav: PropTypes.bool,
    autoPlay: PropTypes.bool,
    lazyLoad: PropTypes.bool,
    infinite: PropTypes.bool,
    showIndex: PropTypes.bool,
    showBullets: PropTypes.bool,
    showThumbnails: PropTypes.bool,
    showPlayButton: PropTypes.bool,
    showFullscreenButton: PropTypes.bool,
    slideOnThumbnailHover: PropTypes.bool,
    disableThumbnailScroll: PropTypes.bool,
    disableArrowKeys: PropTypes.bool,
    disableSwipe: PropTypes.bool,
    useBrowserFullscreen: PropTypes.bool,
    defaultImage: PropTypes.string,
    indexSeparator: PropTypes.string,
    thumbnailPosition: PropTypes.string,
    startIndex: PropTypes.number,
    slideDuration: PropTypes.number,
    slideInterval: PropTypes.number,
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
    onThumbnailError: PropTypes.func,
    onThumbnailClick: PropTypes.func,
    renderCustomControls: PropTypes.func,
    renderLeftNav: PropTypes.func,
    renderRightNav: PropTypes.func,
    renderPlayPauseButton: PropTypes.func,
    renderFullscreenButton: PropTypes.func,
    renderItem: PropTypes.func
  };

  static defaultProps = {
    items: [],
    showNav: true,
    autoPlay: false,
    lazyLoad: false,
    infinite: true,
    showIndex: false,
    showBullets: false,
    showThumbnails: true,
    showPlayButton: true,
    showFullscreenButton: true,
    slideOnThumbnailHover: false,
    disableThumbnailScroll: false,
    disableArrowKeys: false,
    disableSwipe: false,
    useBrowserFullscreen: true,
    indexSeparator: ' / ',
    thumbnailPosition: 'bottom',
    startIndex: 0,
    slideDuration: 450,
    swipingTransitionDuration: 0,
    slideInterval: 3000,
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

    if (this.state.currentIndex >= nextProps.items.length) {
      this.slideToIndex(0);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.thumbnailPosition !== this.props.thumbnailPosition ||
        prevProps.showThumbnails !== this.props.showThumbnails ||
        prevState.thumbnailsWrapperHeight !== this.state.thumbnailsWrapperHeight ||
        prevState.thumbnailsWrapperWidth !== this.state.thumbnailsWrapperWidth) {
      this._handleResize();
    }

    if (prevState.currentIndex !== this.state.currentIndex) {
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex);
      }

      this._updateThumbnailTranslate(prevState);
    }

    if (prevProps.slideDuration !== this.props.slideDuration) {
      this.slideToIndex = throttle(this._unthrottledSlideToIndex,
                                   this.props.slideDuration,
                                   {trailing: false});
    }
  }

  componentWillMount() {
    // Used to update the throttle if slideDuration changes
    this._unthrottledSlideToIndex = this.slideToIndex.bind(this);
    this.slideToIndex = throttle(this._unthrottledSlideToIndex,
                                 this.props.slideDuration,
                                {trailing: false});

    this._handleResize = this._handleResize.bind(this);
    this._debounceResize = debounce(this._handleResize, 500);
    this._handleScreenChange = this._handleScreenChange.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._thumbnailDelay = 300;
  }

  componentDidMount() {
    this._handleResize();

    if (this.props.autoPlay) {
      this.play();
    }
    if (!this.props.disableArrowKeys) {
      window.addEventListener('keydown', this._handleKeyDown);
    }
    window.addEventListener('resize', this._debounceResize);
    this._onScreenChangeEvent();
  }

  componentWillUnmount() {
    if (!this.props.disableArrowKeys) {
      window.removeEventListener('keydown', this._handleKeyDown);
    }

    if (this._debounceResize) {
      window.removeEventListener('resize', this._debounceResize);
      this._debounceResize.cancel();
    }

    this._offScreenChangeEvent();

    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }

    if (this._resizeTimer) {
      window.clearTimeout(this._resizeTimer);
    }
  }

  play(callback = true) {
    if (!this._intervalId) {
      const {slideInterval, slideDuration} = this.props;
      this.setState({isPlaying: true});
      this._intervalId = window.setInterval(() => {
        if (!this.state.hovering) {
          if (!this.props.infinite && !this._canSlideRight()) {
            this.pause();
          } else {
            this.slideToIndex(this.state.currentIndex + 1);
          }
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

  slideToIndex(index, event) {
    const {currentIndex} = this.state;


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
      isFlick: false, // reset isFlick state after slide
      isTransitioning: currentIndex !== nextIndex,
      offsetPercentage: 0,
      style: {
        transition: `all ${this.props.slideDuration}ms ease-out`
      }
    }, this._onSliding);

  }

  _onSliding = () => {
    const { isTransitioning } = this.state;

    window.setTimeout(() => {
      if (isTransitioning) {
        this.setState({isTransitioning: !isTransitioning});
      }
    }, this.props.slideDuration);
  };

  getCurrentIndex() {
    return this.state.currentIndex;
  }

  _handleScreenChange() {
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
  }

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

  _toggleFullScreen() {
    if (this.state.isFullscreen) {
      this.exitFullScreen();
    } else {
      this.fullScreen();
    }
  }

  _togglePlay() {
    if (this._intervalId) {
      this.pause();
    } else {
      this.play();
    }
  }

  _handleResize() {
    // delay initial resize to get the accurate this._imageGallery height/width
    this._resizeTimer = window.setTimeout(() => {
      if (this._imageGallery) {
        this.setState({
          galleryWidth: this._imageGallery.offsetWidth
        });
      }

      // adjust thumbnail container when thumbnail width or height is adjusted
      this._setThumbsTranslate(
        -this._getThumbsTranslate(
          this.state.currentIndex > 0 ? 1 : 0) * this.state.currentIndex);

      if (this._imageGallerySlideWrapper) {
        this.setState({
          gallerySlideWrapperHeight: this._imageGallerySlideWrapper.offsetHeight
        });
      }

      if (this._thumbnailsWrapper) {
        if (this._isThumbnailHorizontal()) {
          this.setState({thumbnailsWrapperHeight: this._thumbnailsWrapper.offsetHeight});
        } else {
          this.setState({thumbnailsWrapperWidth: this._thumbnailsWrapper.offsetWidth});
        }
      }
    }, 500);
  }

  _isThumbnailHorizontal() {
    const { thumbnailPosition } = this.props;
    return thumbnailPosition === 'left' || thumbnailPosition === 'right';
  }

  _handleKeyDown(event) {
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
  }

  _handleMouseOverThumbnails(index) {
    if (this.props.slideOnThumbnailHover) {
      this.setState({hovering: true});
      if (this._thumbnailTimer) {
        window.clearTimeout(this._thumbnailTimer);
        this._thumbnailTimer = null;
      }
      this._thumbnailTimer = window.setTimeout(() => {
        this.slideToIndex(index);
      }, this._thumbnailDelay);
    }
  }

  _handleMouseLeaveThumbnails() {
    if (this._thumbnailTimer) {
      window.clearTimeout(this._thumbnailTimer);
      this._thumbnailTimer = null;
      if (this.props.autoPlay === true) {
        this.play(false);
      }
    }
    this.setState({hovering: false});
  }

  _handleImageError(event) {
    if (this.props.defaultImage &&
        event.target.src.indexOf(this.props.defaultImage) === -1) {
      event.target.src = this.props.defaultImage;
    }
  }

  _handleOnSwiped(ev, x, y, isFlick) {
    this.setState({isFlick: isFlick});
  }

  _sufficientSwipeOffset() {
    return Math.abs(this.state.offsetPercentage) > 30;
  }

  _shouldSlideOnSwipe() {
    return this._sufficientSwipeOffset() || this.state.isFlick;
  }

  _handleOnSwipedTo(index) {
    let slideTo = this.state.currentIndex;

    if (this._shouldSlideOnSwipe()) {
      slideTo += index;
    }

    if (index < 0) {
      if (!this._canSlideLeft()) {
        slideTo = this.state.currentIndex;
      }
    } else {
      if (!this._canSlideRight()) {
        slideTo = this.state.currentIndex;
      }
    }

    this._unthrottledSlideToIndex(slideTo);
  }

  _handleSwiping(index, _, delta) {
    const { swipingTransitionDuration } = this.props;
    const { galleryWidth, isTransitioning } = this.state;

    let offsetPercentage = index * (delta / galleryWidth * 100);
    if (Math.abs(offsetPercentage) >= 100) {
      offsetPercentage = index * 100;
    }

    const swipingTransition = {
      transition: `transform ${swipingTransitionDuration}ms ease-out`
    };

    if (!isTransitioning) {
      this.setState({
        offsetPercentage: offsetPercentage,
        style: swipingTransition,
      });
    }
  }

  _canNavigate() {
    return this.props.items.length >= 2;
  }

  _canSlideLeft() {
    return this.props.infinite || this.state.currentIndex > 0;
  }

  _canSlideRight() {
    return this.props.infinite ||
      this.state.currentIndex < this.props.items.length - 1;
  }

  _updateThumbnailTranslate(prevState) {
    if (this.state.currentIndex === 0) {
      this._setThumbsTranslate(0);
    } else {
      let indexDifference = Math.abs(
        prevState.currentIndex - this.state.currentIndex);
      let scroll = this._getThumbsTranslate(indexDifference);
      if (scroll > 0) {
        if (prevState.currentIndex < this.state.currentIndex) {
          this._setThumbsTranslate(
            this.state.thumbsTranslate - scroll);
        } else if (prevState.currentIndex > this.state.currentIndex) {
          this._setThumbsTranslate(
            this.state.thumbsTranslate + scroll);
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
        if (this._thumbnails.scrollWidth <= thumbnailsWrapperWidth) {
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
    const LEFT = 'left';
    const CENTER = 'center';
    const RIGHT = 'right';

    switch (index) {
      case (currentIndex - 1):
        alignment = ` ${LEFT}`;
        break;
      case (currentIndex):
        alignment = ` ${CENTER}`;
        break;
      case (currentIndex + 1):
        alignment = ` ${RIGHT}`;
        break;
    }

    if (this.props.items.length >= 3 && this.props.infinite) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ` ${RIGHT}`;
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ` ${LEFT}`;
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
    const { isTransitioning, previousIndex, currentIndex } = this.state;
    return isTransitioning &&
      !(index === previousIndex || index == currentIndex);
  }

  _ignoreIsTransitioning() {
    // Ignore isTransitioning because were not going to sibling slides
    // e.g. center to left or center to right
    const { previousIndex, currentIndex } = this.state;
    return Math.abs(previousIndex - currentIndex) > 1 &&
      !this._isGoingFromFirstToLast() &&
      !this._isGoingFromLastToFirst();
  }

  _getSlideStyle(index) {
    const {currentIndex, offsetPercentage} = this.state;
    const {infinite, items} = this.props;
    const baseTranslateX = -100 * currentIndex;
    const totalSlides = items.length - 1;

    // calculates where the other slides belong based on currentIndex
    let translateX = baseTranslateX + (index * 100) + offsetPercentage;

    if (infinite && items.length > 2) {
      if (currentIndex === 0 && index === totalSlides) {
        // make the last slide the slide before the first
        translateX = -100 + offsetPercentage;
      } else if (currentIndex === totalSlides && index === 0) {
        // make the first slide the slide after the last
        translateX = 100 + offsetPercentage;
      }
    }

    // Special case when there are only 2 items with infinite on
    if (infinite && items.length === 2) {
      translateX = this._getTranslateXForTwoSlide(index);
    }

    const translate = `translate(${translateX}%, 0)`;

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

    if (this._isThumbnailHorizontal()) {
      translate = `translate(0, ${this.state.thumbsTranslate}px)`;
    } else {
      translate = `translate(${this.state.thumbsTranslate}px, 0)`;
    }
    return {
      WebkitTransform: translate,
      MozTransform: translate,
      msTransform: translate,
      OTransform: translate,
      transform: translate
    };
  }

  _slideLeft(event) {
    this.slideToIndex(this.state.currentIndex - 1, event);
  }

  _slideRight(event) {
    this.slideToIndex(this.state.currentIndex + 1, event);
  }

  _renderItem(item) {
    const onImageError = this.props.onImageError || this._handleImageError;

    return (
      <div className='image-gallery-image'>
        <img
            src={item.original}
            alt={item.originalAlt}
            srcSet={item.srcSet}
            sizes={item.sizes}
            title={item.originalTitle}
            onLoad={this.props.onImageLoad}
            onError={onImageError.bind(this)}
        />
        {
          item.description &&
            <span className='image-gallery-description'>
              {item.description}
            </span>
        }
      </div>
    );
  }

  _renderThumbInner(item) {
    let onThumbnailError = this._handleImageError;
    if (this.props.onThumbnailError) {
      onThumbnailError = this.props.onThumbnailError;
    }

    return (
      <div>
        <img
          src={item.thumbnail}
          alt={item.thumbnailAlt}
          title={item.thumbnailTitle}
          onError={onThumbnailError.bind(this)}
        />
        <div className='image-gallery-thumbnail-label'>
          {item.thumbnailLabel}
        </div>
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

    const { infinite } = this.props;

    const thumbnailStyle = this._getThumbnailStyle();
    const thumbnailPosition = this.props.thumbnailPosition;

    const slideLeft = this._slideLeft.bind(this);
    const slideRight = this._slideRight.bind(this);

    let slides = [];
    let thumbnails = [];
    let bullets = [];

    this.props.items.map((item, index) => {
      const alignment = this._getAlignmentClassName(index);
      const originalClass = item.originalClass ?
        ` ${item.originalClass}` : '';
      const thumbnailClass = item.thumbnailClass ?
        ` ${item.thumbnailClass}` : '';

      const renderItem = item.renderItem ||
        this.props.renderItem || this._renderItem.bind(this);

      const renderThumbInner = item.renderThumbInner ||
        this.props.renderThumbInner || this._renderThumbInner.bind(this);

      const showItem = !this.props.lazyLoad || alignment || this._lazyLoaded[index];
      if (showItem && this.props.lazyLoad) {
        this._lazyLoaded[index] = true;
      }

      let slideStyle = this._getSlideStyle(index);
      const slide = (
        <div
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          style={Object.assign(slideStyle, this.state.style)}
          onClick={this.props.onClick}
          onTouchMove={this.props.onTouchMove}
          onTouchEnd={this.props.onTouchEnd}
          onTouchStart={this.props.onTouchStart}
        >
          {showItem ? renderItem(item) : <div style={{ height: '100%' }}></div>}
        </div>
      );

      if (infinite) {
        // don't add some slides while transitioning to avoid background transitions
        if (!this._slideIsTransitioning(index) || this._ignoreIsTransitioning()) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      if (this.props.showThumbnails) {
        thumbnails.push(
          <a
            onMouseOver={this._handleMouseOverThumbnails.bind(this, index)}
            onMouseLeave={this._handleMouseLeaveThumbnails.bind(this, index)}
            key={index}
            role='button'
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
            className={
              'image-gallery-thumbnail' +
              (currentIndex === index ? ' active' : '') +
              thumbnailClass
            }
            onClick={event => {
              this.slideToIndex.call(this, index, event);
              if (this.props.onThumbnailClick) {
                this.props.onThumbnailClick(event, index);
              }
            }}
          >
            {renderThumbInner(item)}
          </a>
        );
      }

      if (this.props.showBullets) {
        bullets.push(
          <button
            key={index}
            type='button'
            className={
              'image-gallery-bullet ' + (
                currentIndex === index ? 'active' : '')}

            onClick={event => this.slideToIndex.call(this, index, event)}
            aria-pressed={currentIndex === index ? 'true' : 'false'}
            aria-label={`Go to Slide ${index + 1}`}
          >
          </button>
        );
      }
    });

    const slideWrapper = (
      <div
        ref={i => this._imageGallerySlideWrapper = i}
        className={`image-gallery-slide-wrapper ${thumbnailPosition}`}
      >

        {this.props.renderCustomControls && this.props.renderCustomControls()}

        {
          this.props.showFullscreenButton &&
            this.props.renderFullscreenButton(this._toggleFullScreen.bind(this), isFullscreen)
        }

        {
          this.props.showPlayButton &&
            this.props.renderPlayPauseButton(this._togglePlay.bind(this), isPlaying)
        }

        {
          this._canNavigate() ?
            [
              this.props.showNav &&
                <span key='navigation'>
                  {this.props.renderLeftNav(slideLeft, !this._canSlideLeft())}
                  {this.props.renderRightNav(slideRight, !this._canSlideRight())}
                </span>,

                this.props.disableSwipe ?
                  <div className='image-gallery-slides' key='slides'>
                    {slides}
                  </div>
                :
                  <Swipeable
                    className='image-gallery-swipe'
                    key='swipeable'
                    delta={1}
                    onSwipingLeft={this._handleSwiping.bind(this, -1)}
                    onSwipingRight={this._handleSwiping.bind(this, 1)}
                    onSwiped={this._handleOnSwiped.bind(this)}
                    onSwipedLeft={this._handleOnSwipedTo.bind(this, 1)}
                    onSwipedRight={this._handleOnSwipedTo.bind(this, -1)}
                    onSwipedDown={this._handleOnSwipedTo.bind(this, 0)}
                    onSwipedUp={this._handleOnSwipedTo.bind(this, 0)}
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

    return (
      <div
        ref={i => this._imageGallery = i}
        className={
          `image-gallery${modalFullscreen ? ' fullscreen-modal' : ''}`}
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
                className={`image-gallery-thumbnails-wrapper ${thumbnailPosition}`}
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
