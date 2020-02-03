'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSwipeable = require('react-swipeable');

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.debounce');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.isequal');

var _lodash6 = _interopRequireDefault(_lodash5);

var _resizeObserverPolyfill = require('resize-observer-polyfill');

var _resizeObserverPolyfill2 = _interopRequireDefault(_resizeObserverPolyfill);

var _propTypes = require('prop-types');

var _wheelZoom = require('./wheel-zoom');

var _wheelZoom2 = _interopRequireDefault(_wheelZoom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var screenChangeEvents = ['fullscreenchange', 'MSFullscreenChange', 'mozfullscreenchange', 'webkitfullscreenchange'];

var imageSetType = (0, _propTypes.arrayOf)((0, _propTypes.shape)({
  srcSet: _propTypes.string,
  media: _propTypes.string
}));

function isEnterOrSpaceKey(event) {
  var key = parseInt(event.keyCode || event.which || 0, 10);
  var ENTER_KEY_CODE = 66;
  var SPACEBAR_KEY_CODE = 62;
  return key === ENTER_KEY_CODE || key === SPACEBAR_KEY_CODE;
}

// window.JcWheelZoom = JcWheelZoom;
window.jcWheelZoom;

var ImageGallery = function (_React$Component) {
  _inherits(ImageGallery, _React$Component);

  function ImageGallery(props) {
    _classCallCheck(this, ImageGallery);

    var _this = _possibleConstructorReturn(this, (ImageGallery.__proto__ || Object.getPrototypeOf(ImageGallery)).call(this, props));

    _this.state = {
      currentIndex: props.startIndex,
      thumbsTranslate: 0,
      offsetPercentage: 0,
      galleryWidth: 0,
      thumbnailsWrapperWidth: 0,
      thumbnailsWrapperHeight: 0,
      isFullscreen: false,
      isPlaying: false,
      initZoom: 1
    };
    _this.imageGallery = _react2.default.createRef();
    _this.thumbnailsWrapper = _react2.default.createRef();
    _this.thumbnails = _react2.default.createRef();
    _this.imageGallerySlideWrapper = _react2.default.createRef();

    // bindings
    _this.handleKeyDown = _this.handleKeyDown.bind(_this);
    _this.handleMouseDown = _this.handleMouseDown.bind(_this);
    _this.handleOnSwiped = _this.handleOnSwiped.bind(_this);
    _this.handleScreenChange = _this.handleScreenChange.bind(_this);
    _this.handleSwiping = _this.handleSwiping.bind(_this);
    _this.onThumbnailMouseLeave = _this.onThumbnailMouseLeave.bind(_this);
    _this.pauseOrPlay = _this.pauseOrPlay.bind(_this);
    _this.renderThumbInner = _this.renderThumbInner.bind(_this);
    _this.renderItem = _this.renderItem.bind(_this);
    _this.slideLeft = _this.slideLeft.bind(_this);
    _this.slideRight = _this.slideRight.bind(_this);
    _this.toggleFullScreen = _this.toggleFullScreen.bind(_this);
    _this.togglePlay = _this.togglePlay.bind(_this);

    // Used to update the throttle if slideDuration changes
    _this.unthrottledSlideToIndex = _this.slideToIndex;
    _this.slideToIndex = (0, _lodash2.default)(_this.unthrottledSlideToIndex, props.slideDuration, { trailing: false });

    if (props.lazyLoad) {
      _this.lazyLoaded = [];
    }
    return _this;
  }

  _createClass(ImageGallery, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var autoPlay = this.props.autoPlay;

      if (autoPlay) {
        this.play();
      }
      // document.querySelector('body').addEventListener("mousewheel", this.preventScrollHandler);
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('mousedown', this.handleMouseDown);
      this.initResizeObserver(this.imageGallerySlideWrapper);
      this.addScreenChangeEvent();
      setTimeout(function () {
        window.jcWheelZoom = _wheelZoom2.default.create('.image-gallery-slides .center img', {
          maxScale: 10
        });
      }, 0);

      window.addEventListener('resize', function () {
        if (jcWheelZoom) {
          window.jcWheelZoom.prepare();
        }
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var _props = this.props,
          items = _props.items,
          lazyLoad = _props.lazyLoad,
          slideDuration = _props.slideDuration,
          startIndex = _props.startIndex,
          thumbnailPosition = _props.thumbnailPosition;
      var currentIndex = this.state.currentIndex;

      var itemsSizeChanged = prevProps.items.length !== items.length;
      var itemsChanged = !(0, _lodash6.default)(prevProps.items, items);
      var startIndexUpdated = prevProps.startIndex !== startIndex;
      var thumbnailsPositionChanged = prevProps.thumbnailPosition !== thumbnailPosition;

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
        this.slideToIndex = (0, _lodash2.default)(this.unthrottledSlideToIndex, slideDuration, { trailing: false });
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
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
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
  }, {
    key: 'onSliding',
    value: function onSliding() {
      var _this2 = this;

      var _state = this.state,
          currentIndex = _state.currentIndex,
          isTransitioning = _state.isTransitioning;
      var _props2 = this.props,
          onSlide = _props2.onSlide,
          slideDuration = _props2.slideDuration;

      window.jcWheelZoom = _wheelZoom2.default.create('.image-gallery-slides .center img', {
        maxScale: 10
      });
      this.transitionTimer = window.setTimeout(function () {
        if (isTransitioning) {
          _this2.setState({ isTransitioning: !isTransitioning });
          if (onSlide) {
            onSlide(currentIndex);
          }
        }
      }, slideDuration + 50);
    }
  }, {
    key: 'onThumbnailClick',
    value: function onThumbnailClick(event, index) {
      var onThumbnailClick = this.props.onThumbnailClick;

      this.slideToIndex(index, event);
      if (onThumbnailClick) {
        onThumbnailClick(event, index);
      }
    }
  }, {
    key: 'onThumbnailMouseOver',
    value: function onThumbnailMouseOver(event, index) {
      var _this3 = this;

      if (this.thumbnailMouseOverTimer) {
        window.clearTimeout(this.thumbnailMouseOverTimer);
        this.thumbnailMouseOverTimer = null;
      }
      this.thumbnailMouseOverTimer = window.setTimeout(function () {
        _this3.slideToIndex(index);
        _this3.pause();
      }, 300);
    }
  }, {
    key: 'onThumbnailMouseLeave',
    value: function onThumbnailMouseLeave() {
      if (this.thumbnailMouseOverTimer) {
        var autoPlay = this.props.autoPlay;

        window.clearTimeout(this.thumbnailMouseOverTimer);
        this.thumbnailMouseOverTimer = null;
        if (autoPlay) {
          this.play();
        }
      }
    }
  }, {
    key: 'setScrollDirection',
    value: function setScrollDirection(dir) {
      var _state2 = this.state,
          scrollingUpDown = _state2.scrollingUpDown,
          scrollingLeftRight = _state2.scrollingLeftRight;


      if (!scrollingUpDown && !scrollingLeftRight) {
        if (dir === _reactSwipeable.LEFT || dir === _reactSwipeable.RIGHT) {
          this.setState({ scrollingLeftRight: true });
        } else {
          this.setState({ scrollingUpDown: true });
        }
      }
    }
  }, {
    key: 'setThumbsTranslate',
    value: function setThumbsTranslate(thumbsTranslate) {
      this.setState({ thumbsTranslate: thumbsTranslate });
    }
  }, {
    key: 'setModalFullscreen',
    value: function setModalFullscreen(state) {
      var onScreenChange = this.props.onScreenChange;

      this.setState({ modalFullscreen: state });
      // manually call because browser does not support screenchange events
      if (onScreenChange) {
        onScreenChange(state);
      }
    }
  }, {
    key: 'getThumbsTranslate',
    value: function getThumbsTranslate(indexDifference) {
      var _props3 = this.props,
          disableThumbnailScroll = _props3.disableThumbnailScroll,
          items = _props3.items;
      var _state3 = this.state,
          thumbnailsWrapperWidth = _state3.thumbnailsWrapperWidth,
          thumbnailsWrapperHeight = _state3.thumbnailsWrapperHeight;

      var totalScroll = void 0;
      var thumbElement = this.thumbnails && this.thumbnails.current;

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
        var perIndexScroll = totalScroll / (items.length - 1);
        return indexDifference * perIndexScroll;
      }
      return 0;
    }
  }, {
    key: 'getAlignmentClassName',
    value: function getAlignmentClassName(index) {
      // Necessary for lazing loading
      var currentIndex = this.state.currentIndex;
      var _props4 = this.props,
          infinite = _props4.infinite,
          items = _props4.items;

      var alignment = '';
      var leftClassName = 'left';
      var centerClassName = 'center';
      var rightClassName = 'right';

      switch (index) {
        case currentIndex - 1:
          alignment = ' ' + leftClassName;
          break;
        case currentIndex:
          alignment = ' ' + centerClassName;
          break;
        case currentIndex + 1:
          alignment = ' ' + rightClassName;
          break;
        default:
          break;
      }

      if (items.length >= 3 && infinite) {
        if (index === 0 && currentIndex === items.length - 1) {
          // set first slide as right slide if were sliding right from last slide
          alignment = ' ' + rightClassName;
        } else if (index === items.length - 1 && currentIndex === 0) {
          // set last slide as left slide if were sliding left from first slide
          alignment = ' ' + leftClassName;
        }
      }

      return alignment;
    }
  }, {
    key: 'getTranslateXForTwoSlide',
    value: function getTranslateXForTwoSlide(index) {
      // For taking care of infinite swipe when there are only two slides
      var _state4 = this.state,
          currentIndex = _state4.currentIndex,
          offsetPercentage = _state4.offsetPercentage,
          previousIndex = _state4.previousIndex;

      var baseTranslateX = -100 * currentIndex;
      var translateX = baseTranslateX + index * 100 + offsetPercentage;

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
  }, {
    key: 'getThumbnailBarHeight',
    value: function getThumbnailBarHeight() {
      if (this.isThumbnailVertical()) {
        var gallerySlideWrapperHeight = this.state.gallerySlideWrapperHeight;

        return { height: gallerySlideWrapperHeight };
      }
      return {};
    }
  }, {
    key: 'getSlideStyle',
    value: function getSlideStyle(index) {
      var _state5 = this.state,
          currentIndex = _state5.currentIndex,
          offsetPercentage = _state5.offsetPercentage,
          slideStyle = _state5.slideStyle;
      var _props5 = this.props,
          infinite = _props5.infinite,
          items = _props5.items,
          useTranslate3D = _props5.useTranslate3D,
          isRTL = _props5.isRTL;

      var baseTranslateX = -100 * currentIndex;
      var totalSlides = items.length - 1;

      // calculates where the other slides belong based on currentIndex
      // if it is RTL the base line should be reversed
      var translateX = (baseTranslateX + index * 100) * (isRTL ? -1 : 1) + offsetPercentage;

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

      var translate = 'translate(' + translateX + '%, 0)';

      if (useTranslate3D) {
        translate = 'translate3d(' + translateX + '%, 0, 0)';
      }

      return _extends({}, {
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        transform: translate
      }, slideStyle);
    }
  }, {
    key: 'getCurrentIndex',
    value: function getCurrentIndex() {
      var currentIndex = this.state.currentIndex;

      return currentIndex;
    }
  }, {
    key: 'getThumbnailStyle',
    value: function getThumbnailStyle() {
      var translate = void 0;
      var _props6 = this.props,
          useTranslate3D = _props6.useTranslate3D,
          isRTL = _props6.isRTL;
      var thumbsTranslate = this.state.thumbsTranslate;

      var verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

      if (this.isThumbnailVertical()) {
        translate = 'translate(0, ' + thumbsTranslate + 'px)';
        if (useTranslate3D) {
          translate = 'translate3d(0, ' + thumbsTranslate + 'px, 0)';
        }
      } else {
        translate = 'translate(' + verticalTranslateValue + 'px, 0)';
        if (useTranslate3D) {
          translate = 'translate3d(' + verticalTranslateValue + 'px, 0, 0)';
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
  }, {
    key: 'ignoreIsTransitioning',
    value: function ignoreIsTransitioning() {
      /*
        Ignore isTransitioning because were not going to sibling slides
        e.g. center to left or center to right
      */
      var items = this.props.items;
      var _state6 = this.state,
          previousIndex = _state6.previousIndex,
          currentIndex = _state6.currentIndex;

      var totalSlides = items.length - 1;
      // we want to show the in between slides transition
      var slidingMoreThanOneSlideLeftOrRight = Math.abs(previousIndex - currentIndex) > 1;
      var notGoingFromFirstToLast = !(previousIndex === 0 && currentIndex === totalSlides);
      var notGoingFromLastToFirst = !(previousIndex === totalSlides && currentIndex === 0);

      return slidingMoreThanOneSlideLeftOrRight && notGoingFromFirstToLast && notGoingFromLastToFirst;
    }
  }, {
    key: 'isFirstOrLastSlide',
    value: function isFirstOrLastSlide(index) {
      var items = this.props.items;

      var totalSlides = items.length - 1;
      var isLastSlide = index === totalSlides;
      var isFirstSlide = index === 0;
      return isLastSlide || isFirstSlide;
    }
  }, {
    key: 'slideIsTransitioning',
    value: function slideIsTransitioning(index) {
      /*
      returns true if the gallery is transitioning and the index is not the
      previous or currentIndex
      */
      var _state7 = this.state,
          isTransitioning = _state7.isTransitioning,
          previousIndex = _state7.previousIndex,
          currentIndex = _state7.currentIndex;

      var indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
      return isTransitioning && indexIsNotPreviousOrNextSlide;
    }
  }, {
    key: 'shouldPushSlideOnInfiniteMode',
    value: function shouldPushSlideOnInfiniteMode(index) {
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
      return !this.slideIsTransitioning(index) || this.ignoreIsTransitioning() && !this.isFirstOrLastSlide(index);
    }
  }, {
    key: 'slideThumbnailBar',
    value: function slideThumbnailBar(previousIndex) {
      var _state8 = this.state,
          thumbsTranslate = _state8.thumbsTranslate,
          currentIndex = _state8.currentIndex;

      if (currentIndex === 0) {
        this.setThumbsTranslate(0);
      } else {
        var indexDifference = Math.abs(previousIndex - currentIndex);
        var scroll = this.getThumbsTranslate(indexDifference);
        if (scroll > 0) {
          if (previousIndex < currentIndex) {
            this.setThumbsTranslate(thumbsTranslate - scroll);
          } else if (previousIndex > currentIndex) {
            this.setThumbsTranslate(thumbsTranslate + scroll);
          }
        }
      }
    }
  }, {
    key: 'canSlide',
    value: function canSlide() {
      var items = this.props.items;

      return items.length >= 2;
    }
  }, {
    key: 'canSlideLeft',
    value: function canSlideLeft() {
      var _props7 = this.props,
          infinite = _props7.infinite,
          isRTL = _props7.isRTL;

      return infinite || (isRTL ? this.canSlideNext() : this.canSlidePrevious());
    }
  }, {
    key: 'canSlideRight',
    value: function canSlideRight() {
      var _props8 = this.props,
          infinite = _props8.infinite,
          isRTL = _props8.isRTL;

      return infinite || (isRTL ? this.canSlidePrevious() : this.canSlideNext());
    }
  }, {
    key: 'canSlidePrevious',
    value: function canSlidePrevious() {
      var currentIndex = this.state.currentIndex;

      return currentIndex > 0;
    }
  }, {
    key: 'canSlideNext',
    value: function canSlideNext() {
      var currentIndex = this.state.currentIndex;
      var items = this.props.items;

      return currentIndex < items.length - 1;
    }
  }, {
    key: 'handleSwiping',
    value: function handleSwiping(_ref) {
      var event = _ref.event,
          absX = _ref.absX,
          dir = _ref.dir;
      var _props9 = this.props,
          preventDefaultTouchmoveEvent = _props9.preventDefaultTouchmoveEvent,
          disableSwipe = _props9.disableSwipe,
          stopPropagation = _props9.stopPropagation;
      var _state9 = this.state,
          galleryWidth = _state9.galleryWidth,
          isTransitioning = _state9.isTransitioning,
          scrollingUpDown = _state9.scrollingUpDown,
          scrollingLeftRight = _state9.scrollingLeftRight;


      if (disableSwipe) return;
      var swipingTransitionDuration = this.props.swipingTransitionDuration;

      this.setScrollDirection(dir);
      if (stopPropagation) event.stopPropagation();
      if ((preventDefaultTouchmoveEvent || scrollingLeftRight) && event.cancelable) {
        event.preventDefault();
      }
      if (!isTransitioning && !scrollingUpDown) {
        var side = dir === _reactSwipeable.RIGHT ? 1 : -1;

        var offsetPercentage = absX / galleryWidth * 100;
        if (Math.abs(offsetPercentage) >= 100) {
          offsetPercentage = 100;
        }

        var swipingTransition = {
          transition: 'transform ' + swipingTransitionDuration + 'ms ease-out'
        };

        this.setState({
          offsetPercentage: side * offsetPercentage,
          slideStyle: swipingTransition
        });
      } else {
        // don't move the slide
        this.setState({ offsetPercentage: 0 });
      }
    }
  }, {
    key: 'sufficientSwipe',
    value: function sufficientSwipe() {
      var offsetPercentage = this.state.offsetPercentage;
      var swipeThreshold = this.props.swipeThreshold;

      return Math.abs(offsetPercentage) > swipeThreshold;
    }
  }, {
    key: 'handleOnSwiped',
    value: function handleOnSwiped(_ref2) {
      var event = _ref2.event,
          dir = _ref2.dir,
          velocity = _ref2.velocity;
      var _props10 = this.props,
          disableSwipe = _props10.disableSwipe,
          stopPropagation = _props10.stopPropagation,
          flickThreshold = _props10.flickThreshold;
      var _state10 = this.state,
          scrollingUpDown = _state10.scrollingUpDown,
          scrollingLeftRight = _state10.scrollingLeftRight;


      if (disableSwipe) return;

      var isRTL = this.props.isRTL;

      if (stopPropagation) event.stopPropagation();
      if (scrollingUpDown) {
        // user stopped scrollingUpDown
        this.setState({ scrollingUpDown: false });
      }

      if (scrollingLeftRight) {
        // user stopped scrollingLeftRight
        this.setState({ scrollingLeftRight: false });
      }

      if (!scrollingUpDown) {
        // don't swipe if user is scrolling
        // if it is RTL the direction is reversed
        var swipeDirection = (dir === _reactSwipeable.LEFT ? 1 : -1) * (isRTL ? -1 : 1);
        var isFlick = velocity > flickThreshold;
        this.handleOnSwipedTo(swipeDirection, isFlick);
      }
    }
  }, {
    key: 'handleOnSwipedTo',
    value: function handleOnSwipedTo(swipeDirection, isFlick) {
      var _state11 = this.state,
          currentIndex = _state11.currentIndex,
          isTransitioning = _state11.isTransitioning;

      var slideTo = currentIndex;

      if ((this.sufficientSwipe() || isFlick) && !isTransitioning) {
        // slideto the next/prev slide
        slideTo += swipeDirection;
      }

      // If we can't swipe left or right, stay in the current index (noop)
      if (swipeDirection === -1 && !this.canSlideLeft() || swipeDirection === 1 && !this.canSlideRight()) {
        slideTo = currentIndex;
      }

      this.unthrottledSlideToIndex(slideTo);
    }
  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown() {
      // keep track of mouse vs keyboard usage for a11y
      this.imageGallery.current.classList.add('image-gallery-using-mouse');
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(event) {
      var _props11 = this.props,
          disableArrowKeys = _props11.disableArrowKeys,
          useBrowserFullscreen = _props11.useBrowserFullscreen;
      var isFullscreen = this.state.isFullscreen;
      // keep track of mouse vs keyboard usage for a11y

      this.imageGallery.current.classList.remove('image-gallery-using-mouse');

      if (disableArrowKeys) return;
      var LEFT_ARROW = 37;
      var RIGHT_ARROW = 39;
      var ESC_KEY = 27;
      var key = parseInt(event.keyCode || event.which || 0, 10);

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
  }, {
    key: 'handleImageError',
    value: function handleImageError(event) {
      var onErrorImageURL = this.props.onErrorImageURL;

      if (onErrorImageURL && event.target.src.indexOf(onErrorImageURL) === -1) {
        /* eslint-disable no-param-reassign */
        event.target.src = onErrorImageURL;
        /* eslint-enable no-param-reassign */
      }
    }
  }, {
    key: 'removeResizeObserver',
    value: function removeResizeObserver() {
      if (this.resizeObserver && this.imageGallerySlideWrapper && this.imageGallerySlideWrapper.current) {
        this.resizeObserver.unobserve(this.imageGallerySlideWrapper.current);
      }
    }
  }, {
    key: 'handleResize',
    value: function handleResize() {
      var currentIndex = this.state.currentIndex;

      if (this.imageGallery && this.imageGallery.current) {
        this.setState({ galleryWidth: this.imageGallery.current.offsetWidth });
      }

      if (this.imageGallerySlideWrapper && this.imageGallerySlideWrapper.current) {
        this.setState({
          gallerySlideWrapperHeight: this.imageGallerySlideWrapper.current.offsetHeight
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
  }, {
    key: 'initResizeObserver',
    value: function initResizeObserver(element) {
      var _this4 = this;

      this.resizeObserver = new _resizeObserverPolyfill2.default((0, _lodash4.default)(function (entries) {
        if (!entries) return;
        entries.forEach(function () {
          _this4.handleResize();
        });
      }, 300));
      this.resizeObserver.observe(element.current);
    }
  }, {
    key: 'toggleFullScreen',
    value: function toggleFullScreen() {
      var isFullscreen = this.state.isFullscreen;

      if (isFullscreen) {
        this.exitFullScreen();
      } else {
        this.fullScreen();
      }
    }
  }, {
    key: 'togglePlay',
    value: function togglePlay() {
      if (this.intervalId) {
        this.pause();
      } else {
        this.play();
      }
    }
  }, {
    key: 'handleScreenChange',
    value: function handleScreenChange() {
      /*
        handles screen change events that the browser triggers e.g. esc key
      */
      var onScreenChange = this.props.onScreenChange;

      var fullScreenElement = document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

      if (onScreenChange) onScreenChange(fullScreenElement);
      this.setState({ isFullscreen: !!fullScreenElement });
    }
  }, {
    key: 'slideToIndex',
    value: function slideToIndex(index, event) {
      var _state12 = this.state,
          currentIndex = _state12.currentIndex,
          isTransitioning = _state12.isTransitioning;
      var _props12 = this.props,
          items = _props12.items,
          slideDuration = _props12.slideDuration;


      if (window.jcWheelZoom) {
        window.jcWheelZoom.resetZoom();
      }

      if (!isTransitioning) {
        if (event) {
          if (this.intervalId) {
            // user triggered event while ImageGallery is playing, reset interval
            this.pause(false);
            this.play(false);
          }
        }

        var slideCount = items.length - 1;
        var nextIndex = index;
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
          slideStyle: { transition: 'all ' + slideDuration + 'ms ease-out' }
        }, this.onSliding);
      }
    }
  }, {
    key: 'slideLeft',
    value: function slideLeft() {
      var isRTL = this.props.isRTL;

      if (isRTL) {
        this.slideNext();
      } else {
        this.slidePrevious();
      }
    }
  }, {
    key: 'slideRight',
    value: function slideRight() {
      var isRTL = this.props.isRTL;

      if (isRTL) {
        this.slidePrevious();
      } else {
        this.slideNext();
      }
    }
  }, {
    key: 'slidePrevious',
    value: function slidePrevious(event) {
      var currentIndex = this.state.currentIndex;

      this.slideToIndex(currentIndex - 1, event);
    }
  }, {
    key: 'slideNext',
    value: function slideNext(event) {
      var currentIndex = this.state.currentIndex;

      this.slideToIndex(currentIndex + 1, event);
    }
  }, {
    key: 'handleThumbnailMouseOver',
    value: function handleThumbnailMouseOver(event, index) {
      var slideOnThumbnailOver = this.props.slideOnThumbnailOver;

      if (slideOnThumbnailOver) this.onThumbnailMouseOver(event, index);
    }
  }, {
    key: 'handleThumbnailKeyUp',
    value: function handleThumbnailKeyUp(event, index) {
      // a11y support ^_^
      if (isEnterOrSpaceKey(event)) this.onThumbnailClick(event, index);
    }
  }, {
    key: 'handleSlideKeyUp',
    value: function handleSlideKeyUp(event) {
      // a11y support ^_^
      if (isEnterOrSpaceKey(event)) {
        var onClick = this.props.onClick;

        onClick(event);
      }
    }
  }, {
    key: 'isThumbnailVertical',
    value: function isThumbnailVertical() {
      var thumbnailPosition = this.props.thumbnailPosition;

      return thumbnailPosition === 'left' || thumbnailPosition === 'right';
    }
  }, {
    key: 'addScreenChangeEvent',
    value: function addScreenChangeEvent() {
      var _this5 = this;

      screenChangeEvents.forEach(function (eventName) {
        document.addEventListener(eventName, _this5.handleScreenChange);
      });
    }
  }, {
    key: 'removeScreenChangeEvent',
    value: function removeScreenChangeEvent() {
      var _this6 = this;

      screenChangeEvents.forEach(function (eventName) {
        document.removeEventListener(eventName, _this6.handleScreenChange);
      });
    }
  }, {
    key: 'fullScreen',
    value: function fullScreen() {
      var useBrowserFullscreen = this.props.useBrowserFullscreen;

      var gallery = this.imageGallery.current;
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
  }, {
    key: 'exitFullScreen',
    value: function exitFullScreen() {
      var isFullscreen = this.state.isFullscreen;
      var useBrowserFullscreen = this.props.useBrowserFullscreen;

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
  }, {
    key: 'pauseOrPlay',
    value: function pauseOrPlay() {
      var infinite = this.props.infinite;
      var currentIndex = this.state.currentIndex;

      if (!infinite && !this.canSlideRight()) {
        this.pause();
      } else {
        this.slideToIndex(currentIndex + 1);
      }
    }
  }, {
    key: 'play',
    value: function play() {
      var shouldCallOnPlay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var _props13 = this.props,
          onPlay = _props13.onPlay,
          slideInterval = _props13.slideInterval,
          slideDuration = _props13.slideDuration;
      var currentIndex = this.state.currentIndex;

      if (!this.intervalId) {
        this.setState({ isPlaying: true });
        this.intervalId = window.setInterval(this.pauseOrPlay, Math.max(slideInterval, slideDuration));
        if (onPlay && shouldCallOnPlay) {
          onPlay(currentIndex);
        }
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      var shouldCallOnPause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var onPause = this.props.onPause;
      var currentIndex = this.state.currentIndex;

      if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
        this.setState({ isPlaying: false });
        if (onPause && shouldCallOnPause) {
          onPause(currentIndex);
        }
      }
    }
  }, {
    key: 'renderItem',
    value: function renderItem(item) {
      var _props14 = this.props,
          onImageError = _props14.onImageError,
          onImageLoad = _props14.onImageLoad,
          showZoomControls = _props14.showZoomControls;

      var handleImageError = onImageError || this.handleImageError;

      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-image'
          // onMouseMove={this.zoomMouseMoveHandler}
          // onMouseMove={this.zoomMouseMoveHandler}
          , onScroll: this.preventScrollHandler,
          onWheel: this.preventScrollHandler,
          onTouchMove: this.preventScrollHandler,
          onTouchEnd: this.preventScrollHandler
        },
        item.imageSet ? _react2.default.createElement(
          'picture',
          {
            onLoad: onImageLoad,
            onError: handleImageError
          },
          item.imageSet.map(function (source) {
            return _react2.default.createElement('source', {
              key: source.media,
              media: source.media,
              srcSet: source.srcSet,
              type: source.type
            });
          }),
          _react2.default.createElement(
            'div',
            { style: {
                height: "600px", width: "100%", overflow: 'hidden', position: 'relative', cursor: 'move' } },
            _react2.default.createElement('img', {
              alt: item.originalAlt,
              src: item.original
            })
          )
        ) : _react2.default.createElement(
          'div',
          { style: {
              height: "600px", width: "100%", overflow: 'hidden', position: 'relative', cursor: 'move' } },
          _react2.default.createElement('img', {
            src: item.original,
            alt: item.originalAlt,
            srcSet: item.srcSet,
            sizes: item.sizes,
            title: item.originalTitle,
            onLoad: onImageLoad,
            onError: handleImageError
          })
        ),
        item.description && _react2.default.createElement(
          'span',
          { className: 'image-gallery-description' },
          item.description
        )
      );
    }
  }, {
    key: 'renderThumbInner',
    value: function renderThumbInner(item) {
      var onThumbnailError = this.props.onThumbnailError;

      var handleThumbnailError = onThumbnailError || this.handleImageError;

      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-thumbnail-inner' },
        _react2.default.createElement('img', {
          src: item.thumbnail,
          alt: item.thumbnailAlt,
          title: item.thumbnailTitle,
          onError: handleThumbnailError
        }),
        item.thumbnailLabel && _react2.default.createElement(
          'div',
          { className: 'image-gallery-thumbnail-label' },
          item.thumbnailLabel
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      var _state13 = this.state,
          currentIndex = _state13.currentIndex,
          isFullscreen = _state13.isFullscreen,
          modalFullscreen = _state13.modalFullscreen,
          isPlaying = _state13.isPlaying;
      var _props15 = this.props,
          additionalClass = _props15.additionalClass,
          infinite = _props15.infinite,
          slideOnThumbnailOver = _props15.slideOnThumbnailOver,
          indexSeparator = _props15.indexSeparator,
          onClick = _props15.onClick,
          isRTL = _props15.isRTL,
          items = _props15.items,
          lazyLoad = _props15.lazyLoad,
          thumbnailPosition = _props15.thumbnailPosition,
          onTouchMove = _props15.onTouchMove,
          onTouchEnd = _props15.onTouchEnd,
          onTouchStart = _props15.onTouchStart,
          onMouseOver = _props15.onMouseOver,
          onMouseLeave = _props15.onMouseLeave,
          renderFullscreenButton = _props15.renderFullscreenButton,
          renderItem = _props15.renderItem,
          renderThumbInner = _props15.renderThumbInner,
          renderCustomControls = _props15.renderCustomControls,
          renderLeftNav = _props15.renderLeftNav,
          renderRightNav = _props15.renderRightNav,
          showBullets = _props15.showBullets,
          showFullscreenButton = _props15.showFullscreenButton,
          showIndex = _props15.showIndex,
          showThumbnails = _props15.showThumbnails,
          showNav = _props15.showNav,
          showPlayButton = _props15.showPlayButton,
          showZoomControls = _props15.showZoomControls,
          renderPlayPauseButton = _props15.renderPlayPauseButton,
          renderZoomControlButton = _props15.renderZoomControlButton;


      var thumbnailStyle = this.getThumbnailStyle();
      var slides = [];
      var thumbnails = [];
      var bullets = [];

      items.forEach(function (item, index) {
        var alignment = _this7.getAlignmentClassName(index);
        var originalClass = item.originalClass ? ' ' + item.originalClass : '';
        var thumbnailClass = item.thumbnailClass ? ' ' + item.thumbnailClass : '';
        var handleRenderItem = item.renderItem || renderItem || _this7.renderItem;
        var handleRenderThumbInner = item.renderThumbInner || renderThumbInner || _this7.renderThumbInner;

        var showItem = !lazyLoad || alignment || _this7.lazyLoaded[index];
        if (showItem && lazyLoad && !_this7.lazyLoaded[index]) {
          _this7.lazyLoaded[index] = true;
        }

        var slideStyle = _this7.getSlideStyle(index);

        var slide = _react2.default.createElement(
          'div',
          {
            key: 'slide-' + item.original,
            tabIndex: '-1',
            className: 'image-gallery-slide ' + alignment + ' ' + originalClass,
            style: slideStyle,
            onClick: onClick,
            onKeyUp: _this7.handleSlideKeyUp,
            onTouchMove: onTouchMove,
            onTouchEnd: onTouchEnd,
            onTouchStart: onTouchStart,
            onMouseOver: onMouseOver,
            onFocus: onMouseOver,
            onMouseLeave: onMouseLeave,
            role: 'button'
          },
          showItem ? handleRenderItem(item) : _react2.default.createElement('div', { style: { height: '100%' } })
        );

        if (infinite) {
          // don't add some slides while transitioning to avoid background transitions
          if (_this7.shouldPushSlideOnInfiniteMode(index)) {
            slides.push(slide);
          }
        } else {
          slides.push(slide);
        }

        if (showThumbnails) {
          thumbnails.push(_react2.default.createElement(
            'button',
            {
              key: 'thumbnail-' + item.original,
              type: 'button',
              tabIndex: '0',
              'aria-pressed': currentIndex === index ? 'true' : 'false',
              'aria-label': 'Go to Slide ' + (index + 1),
              className: 'image-gallery-thumbnail ' + thumbnailClass + ' ' + (currentIndex === index ? 'active' : ''),
              onMouseLeave: slideOnThumbnailOver ? _this7.onThumbnailMouseLeave : null,
              onMouseOver: function onMouseOver(event) {
                return _this7.handleThumbnailMouseOver(event, index);
              },
              onFocus: function onFocus(event) {
                return _this7.handleThumbnailMouseOver(event, index);
              },
              onKeyUp: function onKeyUp(event) {
                return _this7.handleThumbnailKeyUp(event, index);
              },
              onClick: function onClick(event) {
                return _this7.onThumbnailClick(event, index);
              }
            },
            handleRenderThumbInner(item)
          ));
        }

        if (showBullets) {
          // generate bullet elements and store them in array
          var bulletOnClick = function bulletOnClick(event) {
            if (item.bulletOnClick) {
              item.bulletOnClick({ item: item, itemIndex: index, currentIndex: currentIndex });
            }
            return _this7.slideToIndex.call(_this7, index, event);
          };
          bullets.push(_react2.default.createElement('button', {
            type: 'button',
            key: 'bullet-' + item.original,
            className: ['image-gallery-bullet', currentIndex === index ? 'active' : '', item.bulletClass || ''].join(' '),
            onClick: bulletOnClick,
            'aria-pressed': currentIndex === index ? 'true' : 'false',
            'aria-label': 'Go to Slide ' + (index + 1)
          }));
        }
      });

      var slideWrapper = _react2.default.createElement(
        'div',
        {
          ref: this.imageGallerySlideWrapper,
          className: 'image-gallery-slide-wrapper ' + thumbnailPosition + ' ' + (isRTL ? 'image-gallery-rtl' : '')
        },
        renderCustomControls && renderCustomControls(),
        this.canSlide() ? _react2.default.createElement(
          _react2.default.Fragment,
          null,
          showNav && _react2.default.createElement(
            'span',
            { key: 'navigation' },
            renderLeftNav(this.slideLeft, !this.canSlideLeft()),
            renderRightNav(this.slideRight, !this.canSlideRight())
          ),
          _react2.default.createElement(
            _reactSwipeable.Swipeable,
            {
              className: 'image-gallery-swipe',
              key: 'swipeable',
              delta: 0,
              onSwiping: this.handleSwiping,
              onSwiped: this.handleOnSwiped
            },
            _react2.default.createElement(
              'div',
              { className: 'image-gallery-slides' },
              slides
            )
          )
        ) : _react2.default.createElement(
          'div',
          { className: 'image-gallery-slides' },
          slides
        ),
        showPlayButton && renderPlayPauseButton(this.togglePlay, isPlaying),
        showBullets && _react2.default.createElement(
          'div',
          { className: 'image-gallery-bullets' },
          _react2.default.createElement(
            'div',
            {
              className: 'image-gallery-bullets-container',
              role: 'navigation',
              'aria-label': 'Bullet Navigation'
            },
            bullets
          )
        ),
        showZoomControls && renderZoomControlButton.call(this.buttonZoomHandler),
        showFullscreenButton && renderFullscreenButton(this.toggleFullScreen, isFullscreen),
        showIndex && _react2.default.createElement(
          'div',
          { className: 'image-gallery-index' },
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-current' },
            currentIndex + 1
          ),
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-separator' },
            indexSeparator
          ),
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-total' },
            items.length
          )
        )
      );

      var classNames = ['image-gallery', additionalClass, modalFullscreen ? 'fullscreen-modal' : ''].filter(function (name) {
        return typeof name === 'string';
      }).join(' ');

      return _react2.default.createElement(
        'div',
        {
          ref: this.imageGallery,
          className: classNames,
          'aria-live': 'polite'
        },
        _react2.default.createElement(
          'div',
          { className: 'image-gallery-content' + (isFullscreen ? ' fullscreen' : '') },
          (thumbnailPosition === 'bottom' || thumbnailPosition === 'right') && slideWrapper,
          showThumbnails && _react2.default.createElement(
            'div',
            {
              className: 'image-gallery-thumbnails-wrapper ' + thumbnailPosition + ' ' + (!this.isThumbnailVertical() && isRTL ? 'thumbnails-wrapper-rtl' : ''),
              style: this.getThumbnailBarHeight()
            },
            _react2.default.createElement(
              'div',
              {
                className: 'image-gallery-thumbnails',
                ref: this.thumbnailsWrapper
              },
              _react2.default.createElement(
                'div',
                {
                  ref: this.thumbnails,
                  className: 'image-gallery-thumbnails-container',
                  style: thumbnailStyle,
                  'aria-label': 'Thumbnail Navigation'
                },
                thumbnails
              )
            )
          ),
          (thumbnailPosition === 'top' || thumbnailPosition === 'left') && slideWrapper
        )
      );
    }
  }]);

  return ImageGallery;
}(_react2.default.Component);

ImageGallery.propTypes = {
  flickThreshold: _propTypes.number,
  items: (0, _propTypes.arrayOf)((0, _propTypes.shape)({
    bulletClass: _propTypes.string,
    bulletOnClick: _propTypes.func,
    description: _propTypes.string,
    original: _propTypes.string.isRequired,
    originalAlt: _propTypes.string,
    originalTitle: _propTypes.string,
    thumbnail: _propTypes.string,
    thumbnailAlt: _propTypes.string,
    thumbnailLabel: _propTypes.string,
    thumbnailTitle: _propTypes.string,
    originalClass: _propTypes.string,
    thumbnailClass: _propTypes.string,
    renderItem: _propTypes.func,
    renderThumbInner: _propTypes.func,
    imageSet: imageSetType,
    srcSet: _propTypes.string,
    sizes: _propTypes.string
  })).isRequired,
  showNav: _propTypes.bool,
  autoPlay: _propTypes.bool,
  lazyLoad: _propTypes.bool,
  infinite: _propTypes.bool,
  showIndex: _propTypes.bool,
  showBullets: _propTypes.bool,
  showThumbnails: _propTypes.bool,
  showPlayButton: _propTypes.bool,
  showFullscreenButton: _propTypes.bool,
  showZoomControls: _propTypes.bool,
  disableThumbnailScroll: _propTypes.bool,
  disableArrowKeys: _propTypes.bool,
  disableSwipe: _propTypes.bool,
  useBrowserFullscreen: _propTypes.bool,
  preventDefaultTouchmoveEvent: _propTypes.bool,
  onErrorImageURL: _propTypes.string,
  indexSeparator: _propTypes.string,
  thumbnailPosition: _propTypes.string,
  startIndex: _propTypes.number,
  slideDuration: _propTypes.number,
  slideInterval: _propTypes.number,
  slideOnThumbnailOver: _propTypes.bool,
  swipeThreshold: _propTypes.number,
  swipingTransitionDuration: _propTypes.number,
  onSlide: _propTypes.func,
  onScreenChange: _propTypes.func,
  onPause: _propTypes.func,
  onPlay: _propTypes.func,
  onClick: _propTypes.func,
  onImageLoad: _propTypes.func,
  onImageError: _propTypes.func,
  onTouchMove: _propTypes.func,
  onTouchEnd: _propTypes.func,
  onTouchStart: _propTypes.func,
  onMouseOver: _propTypes.func,
  onMouseLeave: _propTypes.func,
  onThumbnailError: _propTypes.func,
  onThumbnailClick: _propTypes.func,
  renderCustomControls: _propTypes.func,
  renderLeftNav: _propTypes.func,
  renderRightNav: _propTypes.func,
  renderPlayPauseButton: _propTypes.func,
  renderFullscreenButton: _propTypes.func,
  renderZoomControlButton: _propTypes.func,
  renderItem: _propTypes.func,
  renderThumbInner: _propTypes.func,
  stopPropagation: _propTypes.bool,
  additionalClass: _propTypes.string,
  useTranslate3D: _propTypes.bool,
  isRTL: _propTypes.bool
};
ImageGallery.defaultProps = {
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
  showZoomControls: true,
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
  renderLeftNav: function renderLeftNav(onClick, disabled) {
    return _react2.default.createElement('button', {
      type: 'button',
      className: 'image-gallery-left-nav',
      disabled: disabled,
      onClick: onClick,
      'aria-label': 'Previous Slide'
    });
  },
  renderRightNav: function renderRightNav(onClick, disabled) {
    return _react2.default.createElement('button', {
      type: 'button',
      className: 'image-gallery-right-nav',
      disabled: disabled,
      onClick: onClick,
      'aria-label': 'Next Slide'
    });
  },
  renderPlayPauseButton: function renderPlayPauseButton(onClick, isPlaying) {
    return _react2.default.createElement('button', {
      type: 'button',
      className: 'image-gallery-play-button' + (isPlaying ? ' active' : ''),
      onClick: onClick,
      'aria-label': 'Play or Pause Slideshow'
    });
  },
  renderZoomControlButton: function renderZoomControlButton(zoomHandler) {
    return _react2.default.createElement(
      'div',
      { className: 'image-gallery-zoom-controls' },
      _react2.default.createElement('button', {
        className: 'image-gallery-zoom-in',
        type: 'button',
        'aria-label': 'Zoom In',
        onClick: function onClick(e) {
          window.jcWheelZoom.zoomUp();
          // zoomHandler(true);
        }
      }),
      _react2.default.createElement('button', {
        className: 'image-gallery-zoom-out',
        type: 'button',
        'aria-label': 'Zoom Out',
        onClick: function onClick(e) {
          window.jcWheelZoom.zoomDown();
          // zoomHandler(false);
        }
      })
    );
  },
  renderFullscreenButton: function renderFullscreenButton(onClick, isFullscreen) {
    return _react2.default.createElement('button', {
      type: 'button',
      className: 'image-gallery-fullscreen-button' + (isFullscreen ? ' active' : ''),
      onClick: onClick,
      'aria-label': 'Open Fullscreen'
    });
  }
};
exports.default = ImageGallery;