'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSwipeable = require('react-swipeable');

var _reactSwipeable2 = _interopRequireDefault(_reactSwipeable);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.debounce');

var _lodash4 = _interopRequireDefault(_lodash3);

var _resizeObserverPolyfill = require('resize-observer-polyfill');

var _resizeObserverPolyfill2 = _interopRequireDefault(_resizeObserverPolyfill);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var screenChangeEvents = ['fullscreenchange', 'MSFullscreenChange', 'mozfullscreenchange', 'webkitfullscreenchange'];

var Constants = Object.freeze({
  LEFT: ' left',
  CENTER: ' center',
  RIGHT: ' right'
});

var ImageGallery = function (_React$Component) {
  _inherits(ImageGallery, _React$Component);

  function ImageGallery(props) {
    _classCallCheck(this, ImageGallery);

    var _this = _possibleConstructorReturn(this, (ImageGallery.__proto__ || Object.getPrototypeOf(ImageGallery)).call(this, props));

    _this.slideToIndex = function (index, event) {
      var _this$state = _this.state,
          currentIndex = _this$state.currentIndex,
          isTransitioning = _this$state.isTransitioning;


      if (!isTransitioning) {
        if (event) {
          if (_this._intervalId) {
            // user triggered event while ImageGallery is playing, reset interval
            _this.pause(false);
            _this.play(false);
          }
        }

        var slideCount = _this.props.items.length - 1;
        var nextIndex = index;

        if (index < 0) {
          nextIndex = slideCount;
        } else if (index > slideCount) {
          nextIndex = 0;
        }

        _this.setState({
          previousIndex: currentIndex,
          currentIndex: nextIndex,
          isTransitioning: nextIndex !== currentIndex,
          offsetPercentage: 0,
          style: {
            transition: 'all ' + _this.props.slideDuration + 'ms ease'
          }
        }, _this._onSliding);
      }
    };

    _this._onSliding = function () {
      var isTransitioning = _this.state.isTransitioning;

      _this._transitionTimer = window.setTimeout(function () {
        if (isTransitioning) {
          _this.setState({ isTransitioning: !isTransitioning });
        }
      }, _this.props.slideDuration + 50);
    };

    _this._handleScreenChange = function () {
      /*
        handles screen change events that the browser triggers e.g. esc key
      */
      var fullScreenElement = document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

      if (_this.props.onScreenChange) {
        _this.props.onScreenChange(fullScreenElement);
      }

      _this.setState({ isFullscreen: !!fullScreenElement });
    };

    _this._toggleFullScreen = function () {
      if (_this.state.isFullscreen) {
        _this.exitFullScreen();
      } else {
        _this.fullScreen();
      }
    };

    _this._togglePlay = function () {
      if (_this._intervalId) {
        _this.pause();
      } else {
        _this.play();
      }
    };

    _this._initGalleryResizing = function (element) {
      /*
        When image-gallery-slide-wrapper unmounts and mounts when thumbnail bar position is changed
        ref is called twice, once with null and another with the element.
        Make sure element is available before calling observe.
      */
      if (element) {
        _this._imageGallerySlideWrapper = element;
        _this.resizeObserver = new _resizeObserverPolyfill2.default(_this._createResizeObserver);
        _this.resizeObserver.observe(element);
      }
    };

    _this._createResizeObserver = (0, _lodash4.default)(function (entries) {
      if (!entries) return;
      entries.forEach(function () {
        _this._handleResize();
      });
    }, 300);

    _this._handleResize = function () {
      var currentIndex = _this.state.currentIndex;


      var previousGalleryWidth = _this.state.galleryWidth;
      if (_this._imageGallery && _this._imageGallery.offsetWidth > 0) {
        _this.setState({
          galleryWidth: _this._imageGallery.offsetWidth
        });
        if (_this.props.onImageGalleryReady && _this._imageGallery.offsetWidth > 0 && previousGalleryWidth === 0) {
          _this.props.onImageGalleryReady();
        }
      }

      if (_this._imageGallerySlideWrapper) {
        _this.setState({
          gallerySlideWrapperHeight: _this._imageGallerySlideWrapper.offsetHeight
        });
      }

      if (_this._thumbnailsWrapper && _this._thumbnailsWrapper.offsetHeight != 0 && _this._thumbnailsWrapper.offsetWidth != 0) {
        if (_this._isThumbnailHorizontal()) {
          _this.setState({ thumbnailsWrapperHeight: _this._thumbnailsWrapper.offsetHeight });
        } else {
          _this.setState({ thumbnailsWrapperWidth: _this._thumbnailsWrapper.offsetWidth });
        }
        // Adjust thumbnail container when thumbnail width or height is adjusted
        _this._setThumbsTranslate(-_this._getThumbsTranslate(currentIndex));
      }
    };

    _this._handleKeyDown = function (event) {
      var LEFT_ARROW = 37;
      var RIGHT_ARROW = 39;
      var ESC_KEY = 27;
      var key = parseInt(event.keyCode || event.which || 0);

      switch (key) {
        case LEFT_ARROW:
          if (_this._canSlideLeft() && !_this._intervalId) {
            _this._slideLeft();
          }
          break;
        case RIGHT_ARROW:
          if (_this._canSlideRight() && !_this._intervalId) {
            _this._slideRight();
          }
          break;
        case ESC_KEY:
          if (_this.state.isFullscreen && !_this.props.useBrowserFullscreen) {
            _this.exitFullScreen();
          }
      }
    };

    _this._handleImageError = function (event) {
      if (_this.props.defaultImage && event.target.src.indexOf(_this.props.defaultImage) === -1) {
        event.target.src = _this.props.defaultImage;
      }
    };

    _this._handleOnSwiped = function (e, deltaX, deltaY, isFlick) {
      var _this$state2 = _this.state,
          scrollingUpDown = _this$state2.scrollingUpDown,
          scrollingLeftRight = _this$state2.scrollingLeftRight;
      var isRTL = _this.props.isRTL;

      if (scrollingUpDown) {
        // user stopped scrollingUpDown
        _this.setState({ scrollingUpDown: false });
      }

      if (scrollingLeftRight) {
        // user stopped scrollingLeftRight
        _this.setState({ scrollingLeftRight: false });
      }

      if (!scrollingUpDown) {
        // don't swipe if user is scrolling
        var side = (deltaX > 0 ? 1 : -1) * (isRTL ? -1 : 1); //if it is RTL the direction is reversed
        _this._handleOnSwipedTo(side, isFlick);
      }
    };

    _this._handleSwiping = function (e, deltaX, deltaY, delta) {
      var _this$state3 = _this.state,
          galleryWidth = _this$state3.galleryWidth,
          isTransitioning = _this$state3.isTransitioning,
          scrollingUpDown = _this$state3.scrollingUpDown;
      var swipingTransitionDuration = _this.props.swipingTransitionDuration;

      _this._setScrollDirection(deltaX, deltaY);
      if (!isTransitioning && !scrollingUpDown) {
        var side = deltaX < 0 ? 1 : -1;

        var offsetPercentage = delta / galleryWidth * 100;
        if (Math.abs(offsetPercentage) >= 100) {
          offsetPercentage = 100;
        }

        var swipingTransition = {
          transition: 'all ' + swipingTransitionDuration + 'ms ease'
        };

        _this.setState({
          offsetPercentage: side * offsetPercentage,
          style: swipingTransition
        });
      } else {
        // don't move the slide
        _this.setState({ offsetPercentage: 0 });
      }
    };

    _this._slideLeft = function (event) {
      _this.props.isRTL ? _this._slideNext(event) : _this.ـslidePrevious(event);
    };

    _this._slideRight = function (event) {
      _this.props.isRTL ? _this.ـslidePrevious(event) : _this._slideNext(event);
    };

    _this.ـslidePrevious = function (event) {
      _this.slideToIndex(_this.state.currentIndex - 1, event);
    };

    _this._slideNext = function (event) {
      _this.slideToIndex(_this.state.currentIndex + 1, event);
    };

    _this._renderItem = function (item) {
      var onImageError = _this.props.onImageError || _this._handleImageError;

      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-image' },
        item.imageSet ? _react2.default.createElement(
          'picture',
          {
            onLoad: _this.props.onImageLoad,
            onError: onImageError
          },
          item.imageSet.map(function (source, index) {
            return _react2.default.createElement('source', {
              key: index,
              media: source.media,
              srcSet: source.srcSet,
              type: source.type
            });
          }),
          _react2.default.createElement('img', {
            alt: item.originalAlt,
            src: item.original
          })
        ) : _react2.default.createElement('img', {
          src: item.original,
          alt: item.originalAlt,
          srcSet: item.srcSet,
          sizes: item.sizes,
          title: item.originalTitle,
          onLoad: _this.props.onImageLoad,
          onError: onImageError
        }),
        item.description && _react2.default.createElement(
          'span',
          { className: 'image-gallery-description' },
          item.description
        )
      );
    };

    _this._renderThumbInner = function (item) {
      var onThumbnailError = _this.props.onThumbnailError || _this._handleImageError;

      return _react2.default.createElement(
        'div',
        { className: 'image-gallery-thumbnail-inner' },
        _react2.default.createElement('img', {
          src: item.thumbnail,
          alt: item.thumbnailAlt,
          title: item.thumbnailTitle,
          onError: onThumbnailError
        }),
        item.thumbnailLabel && _react2.default.createElement(
          'div',
          { className: 'image-gallery-thumbnail-label' },
          item.thumbnailLabel
        )
      );
    };

    _this._onThumbnailClick = function (event, index) {
      _this.slideToIndex(index, event);
      if (_this.props.onThumbnailClick) {
        _this.props.onThumbnailClick(event, index);
      }
    };

    _this._shouldShowItem = function (alignment, index) {
      var showNext = _this.props.lazyLoadNext && alignment;
      var showMain = !_this.props.lazyLoadNext && alignment === Constants.CENTER;

      var showItem = !_this.props.lazyLoad || showNext || showMain || _this._lazyLoaded[index];

      return showItem;
    };

    _this.state = {
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
    _this._unthrottledSlideToIndex = _this.slideToIndex;
    _this.slideToIndex = (0, _lodash2.default)(_this._unthrottledSlideToIndex, props.slideDuration, { trailing: false });

    if (props.lazyLoad) {
      _this._lazyLoaded = [];
    }
    return _this;
  }

  _createClass(ImageGallery, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.disableArrowKeys !== nextProps.disableArrowKeys) {
        if (nextProps.disableArrowKeys) {
          window.removeEventListener('keydown', this._handleKeyDown);
        } else {
          window.addEventListener('keydown', this._handleKeyDown);
        }
      }

      if (nextProps.lazyLoad && (!this.props.lazyLoad || this.props.items !== nextProps.items)) {
        this._lazyLoaded = [];
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var itemsChanged = prevProps.items.length !== this.props.items.length;
      if (itemsChanged) {
        var prevCoverPhoto = prevProps.items[prevProps.startIndex] || {};
        var newCoverPhoto = this.props.items[this.props.startIndex] || {};
        var coverPhotoChanged = prevCoverPhoto.id !== newCoverPhoto.id;

        if (coverPhotoChanged && this.props.onItemsGalleryChange) {
          // call the callback function
          this.props.onItemsGalleryChange();
        }
        //if index has changed go to the startIndex (transition is not visible)
        var indexChange = this.props.startIndex !== prevState.currentIndex;
        if (indexChange) {
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
        this.slideToIndex = (0, _lodash2.default)(this._unthrottledSlideToIndex, this.props.slideDuration, { trailing: false });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.autoPlay) {
        this.play();
      }
      if (!this.props.disableArrowKeys) {
        window.addEventListener('keydown', this._handleKeyDown);
      }
      this._onScreenChangeEvent();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (!this.props.disableArrowKeys) {
        window.removeEventListener('keydown', this._handleKeyDown);
      }

      this._offScreenChangeEvent();

      if (this._intervalId) {
        window.clearInterval(this._intervalId);
        this._intervalId = null;
      }

      if (this.resizeObserver && this._imageGallerySlideWrapper) {
        this.resizeObserver.unobserve(this._imageGallerySlideWrapper);
      }

      if (this._transitionTimer) {
        window.clearTimeout(this._transitionTimer);
      }

      if (this._createResizeObserver) {
        this._createResizeObserver();
      }
    }
  }, {
    key: 'play',
    value: function play() {
      var _this2 = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (!this._intervalId) {
        var _props = this.props,
            slideInterval = _props.slideInterval,
            slideDuration = _props.slideDuration;

        this.setState({ isPlaying: true });
        this._intervalId = window.setInterval(function () {
          if (!_this2.state.hovering) {
            _this2.slideToIndex(_this2.state.currentIndex + 1);
          }
        }, Math.max(slideInterval, slideDuration));

        if (this.props.onPlay && callback) {
          this.props.onPlay(this.state.currentIndex);
        }
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (this._intervalId) {
        window.clearInterval(this._intervalId);
        this._intervalId = null;
        this.setState({ isPlaying: false });

        if (this.props.onPause && callback) {
          this.props.onPause(this.state.currentIndex);
        }
      }
    }
  }, {
    key: 'setModalFullscreen',
    value: function setModalFullscreen(state) {
      this.setState({ modalFullscreen: state });
      // manually call because browser does not support screenchange events
      if (this.props.onScreenChange) {
        this.props.onScreenChange(state);
      }
    }
  }, {
    key: 'fullScreen',
    value: function fullScreen() {
      var gallery = this._imageGallery;

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

      this.setState({ isFullscreen: true });
    }
  }, {
    key: 'exitFullScreen',
    value: function exitFullScreen() {
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

        this.setState({ isFullscreen: false });
      }
    }
  }, {
    key: 'getCurrentIndex',
    value: function getCurrentIndex() {
      return this.state.currentIndex;
    }
  }, {
    key: '_onScreenChangeEvent',
    value: function _onScreenChangeEvent() {
      var _this3 = this;

      screenChangeEvents.map(function (eventName) {
        document.addEventListener(eventName, _this3._handleScreenChange);
      });
    }
  }, {
    key: '_offScreenChangeEvent',
    value: function _offScreenChangeEvent() {
      var _this4 = this;

      screenChangeEvents.map(function (eventName) {
        document.removeEventListener(eventName, _this4._handleScreenChange);
      });
    }
  }, {
    key: '_isThumbnailHorizontal',
    value: function _isThumbnailHorizontal() {
      var thumbnailPosition = this.props.thumbnailPosition;

      return thumbnailPosition === 'left' || thumbnailPosition === 'right';
    }
  }, {
    key: '_setScrollDirection',
    value: function _setScrollDirection(deltaX, deltaY) {
      var _state = this.state,
          scrollingUpDown = _state.scrollingUpDown,
          scrollingLeftRight = _state.scrollingLeftRight;

      var x = Math.abs(deltaX);
      var y = Math.abs(deltaY);

      // If y > x the user is scrolling up and down
      if (y > x && !scrollingUpDown && !scrollingLeftRight) {
        this.setState({ scrollingUpDown: true });
      } else if (!scrollingLeftRight && !scrollingUpDown) {
        this.setState({ scrollingLeftRight: true });
      }
    }
  }, {
    key: '_handleOnSwipedTo',
    value: function _handleOnSwipedTo(side, isFlick) {
      var _state2 = this.state,
          currentIndex = _state2.currentIndex,
          isTransitioning = _state2.isTransitioning;

      var slideTo = currentIndex;

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
  }, {
    key: '_sufficientSwipeOffset',
    value: function _sufficientSwipeOffset() {
      return Math.abs(this.state.offsetPercentage) > this.props.swipeThreshold;
    }
  }, {
    key: '_canNavigate',
    value: function _canNavigate() {
      return this.props.items.length >= 2 && !this.props.disableNavigation;
    }
  }, {
    key: '_canSlideLeft',
    value: function _canSlideLeft() {
      return this.props.isRTL ? this._canSlideNext() : this._canSlidePrevious();
    }
  }, {
    key: '_canSlideRight',
    value: function _canSlideRight() {
      return this.props.isRTL ? this._canSlidePrevious() : this._canSlideNext();
    }
  }, {
    key: '_canSlidePrevious',
    value: function _canSlidePrevious() {
      return this.state.currentIndex > 0;
    }
  }, {
    key: '_canSlideNext',
    value: function _canSlideNext() {
      return this.state.currentIndex < this.props.items.length - 1;
    }
  }, {
    key: '_updateThumbnailTranslate',
    value: function _updateThumbnailTranslate(previousIndex) {
      var _state3 = this.state,
          thumbsTranslate = _state3.thumbsTranslate,
          currentIndex = _state3.currentIndex;

      if (this.state.currentIndex === 0) {
        this._setThumbsTranslate(0);
      } else {
        var indexDifference = Math.abs(previousIndex - currentIndex);
        var scroll = this._getThumbsTranslate(indexDifference);
        if (scroll > 0) {
          if (previousIndex < currentIndex) {
            this._setThumbsTranslate(thumbsTranslate - scroll);
          } else if (previousIndex > currentIndex) {
            this._setThumbsTranslate(thumbsTranslate + scroll);
          }
        }
      }
    }
  }, {
    key: '_setThumbsTranslate',
    value: function _setThumbsTranslate(thumbsTranslate) {
      this.setState({ thumbsTranslate: thumbsTranslate });
    }
  }, {
    key: '_getThumbsTranslate',
    value: function _getThumbsTranslate(indexDifference) {
      if (this.props.disableThumbnailScroll) {
        return 0;
      }

      var _state4 = this.state,
          thumbnailsWrapperWidth = _state4.thumbnailsWrapperWidth,
          thumbnailsWrapperHeight = _state4.thumbnailsWrapperHeight;

      var totalScroll = void 0;

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

        var totalThumbnails = this._thumbnails.children.length;
        // scroll-x required per index change
        var perIndexScroll = totalScroll / (totalThumbnails - 1);

        return indexDifference * perIndexScroll;
      }
    }
  }, {
    key: '_getAlignmentClassName',
    value: function _getAlignmentClassName(index) {
      // LEFT, and RIGHT alignments are necessary for lazyLoad
      var currentIndex = this.state.currentIndex;

      var alignment = '';

      switch (index) {
        case currentIndex - 1:
          alignment = Constants.LEFT;
          break;
        case currentIndex:
          alignment = Constants.CENTER;
          break;
        case currentIndex + 1:
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
  }, {
    key: '_isGoingFromFirstToLast',
    value: function _isGoingFromFirstToLast() {
      var _state5 = this.state,
          currentIndex = _state5.currentIndex,
          previousIndex = _state5.previousIndex;

      var totalSlides = this.props.items.length - 1;
      return previousIndex === 0 && currentIndex === totalSlides;
    }
  }, {
    key: '_isGoingFromLastToFirst',
    value: function _isGoingFromLastToFirst() {
      var _state6 = this.state,
          currentIndex = _state6.currentIndex,
          previousIndex = _state6.previousIndex;

      var totalSlides = this.props.items.length - 1;
      return previousIndex === totalSlides && currentIndex === 0;
    }
  }, {
    key: '_getTranslateXForTwoSlide',
    value: function _getTranslateXForTwoSlide(index) {
      // For taking care of infinite swipe when there are only two slides
      var _state7 = this.state,
          currentIndex = _state7.currentIndex,
          offsetPercentage = _state7.offsetPercentage,
          previousIndex = _state7.previousIndex;

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
        } else if (currentIndex === 1 && index === 0 && offsetPercentage === 0 && this.direction === 'right') {
          translateX = 100;
        }
      }

      return translateX;
    }
  }, {
    key: '_getThumbnailBarHeight',
    value: function _getThumbnailBarHeight() {
      if (this._isThumbnailHorizontal()) {
        return {
          height: this.state.gallerySlideWrapperHeight
        };
      }
      return {};
    }
  }, {
    key: '_slideIsTransitioning',
    value: function _slideIsTransitioning(index) {
      /*
      returns true if the gallery is transitioning and the index is not the
      previous or currentIndex
      */
      var _state8 = this.state,
          isTransitioning = _state8.isTransitioning,
          previousIndex = _state8.previousIndex,
          currentIndex = _state8.currentIndex;

      var indexIsNotPreviousOrNextSlide = !(index === previousIndex || index === currentIndex);
      return isTransitioning && indexIsNotPreviousOrNextSlide;
    }
  }, {
    key: '_isFirstOrLastSlide',
    value: function _isFirstOrLastSlide(index) {
      var totalSlides = this.props.items.length - 1;
      var isLastSlide = index === totalSlides;
      var isFirstSlide = index === 0;
      return isLastSlide || isFirstSlide;
    }
  }, {
    key: '_ignoreIsTransitioning',
    value: function _ignoreIsTransitioning() {
      /*
        Ignore isTransitioning because were not going to sibling slides
        e.g. center to left or center to right
      */
      var _state9 = this.state,
          previousIndex = _state9.previousIndex,
          currentIndex = _state9.currentIndex;

      var totalSlides = this.props.items.length - 1;
      // we want to show the in between slides transition
      var slidingMoreThanOneSlideLeftOrRight = Math.abs(previousIndex - currentIndex) > 1;
      var notGoingFromFirstToLast = !(previousIndex === 0 && currentIndex === totalSlides);
      var notGoingFromLastToFirst = !(previousIndex === totalSlides && currentIndex === 0);

      return slidingMoreThanOneSlideLeftOrRight && notGoingFromFirstToLast && notGoingFromLastToFirst;
    }
  }, {
    key: '_getSlideStyle',
    value: function _getSlideStyle() {
      return {
        Width: this.state.galleryWidth
      };
    }
  }, {
    key: '_getSlidesStyle',
    value: function _getSlidesStyle() {
      var _state10 = this.state,
          currentIndex = _state10.currentIndex,
          offsetPercentage = _state10.offsetPercentage;
      var useTranslate3D = this.props.useTranslate3D;

      // let translateX = currentIndex * -100 + offsetPercentage;

      var translateX = currentIndex * -100;

      if (!this._canSlideLeft() && offsetPercentage > 0) {
        translateX += offsetPercentage / 3;
      } else if (!this._canSlideRight() && offsetPercentage < 0) {
        translateX += offsetPercentage / 3;
      } else {
        translateX += offsetPercentage;
      }
      // console.log(translateX, offsetPercentage);

      var translate = 'translate(' + translateX * this.state.galleryWidth + 'px, 0)';

      if (useTranslate3D) {
        translate = 'translate3d(' + translateX / 100 * this.state.galleryWidth + 'px, 0, 0)';
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
    key: '_getThumbnailStyle',
    value: function _getThumbnailStyle() {
      var translate = void 0;
      var _props2 = this.props,
          useTranslate3D = _props2.useTranslate3D,
          isRTL = _props2.isRTL;
      var thumbsTranslate = this.state.thumbsTranslate;

      var verticalTranslateValue = isRTL ? thumbsTranslate * -1 : thumbsTranslate;

      if (this._isThumbnailHorizontal()) {
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
    key: 'render',
    value: function render() {
      var _this5 = this;

      var _state11 = this.state,
          currentIndex = _state11.currentIndex,
          isFullscreen = _state11.isFullscreen,
          modalFullscreen = _state11.modalFullscreen,
          isPlaying = _state11.isPlaying,
          scrollingLeftRight = _state11.scrollingLeftRight;
      var _props3 = this.props,
          preventDefaultTouchmoveEvent = _props3.preventDefaultTouchmoveEvent,
          isRTL = _props3.isRTL;


      var thumbnailStyle = this._getThumbnailStyle();
      var thumbnailPosition = this.props.thumbnailPosition;

      var slideLeft = this._slideLeft;
      var slideRight = this._slideRight;

      var slides = [];
      var thumbnails = [];
      var bullets = [];

      this.props.items.forEach(function (item, index) {
        var alignment = _this5._getAlignmentClassName(index);
        var originalClass = item.originalClass ? ' ' + item.originalClass : '';
        var thumbnailClass = item.thumbnailClass ? ' ' + item.thumbnailClass : '';

        var renderItem = item.renderItem || _this5.props.renderItem || _this5._renderItem;

        var renderThumbInner = item.renderThumbInner || _this5.props.renderThumbInner || _this5._renderThumbInner;

        var showItem = _this5._shouldShowItem(alignment, index);
        if (showItem && _this5.props.lazyLoad && !_this5._lazyLoaded[index]) {
          _this5._lazyLoaded[index] = true;
        }

        var slide = _react2.default.createElement(
          'div',
          {
            key: index,
            className: 'image-gallery-slide' + alignment + originalClass,
            style: { 'width': _this5.state.galleryWidth },
            onClick: _this5.props.onClick,
            onTouchMove: _this5.props.onTouchMove,
            onTouchEnd: _this5.props.onTouchEnd,
            onTouchStart: _this5.props.onTouchStart,
            onMouseOver: _this5.props.onMouseOver,
            onMouseLeave: _this5.props.onMouseLeave,
            role: _this5.props.onClick && 'button'
          },
          showItem ? renderItem(item) : _react2.default.createElement('div', { style: { height: '100%' } })
        );

        slides.push(slide);
        if (_this5.props.showThumbnails) {
          thumbnails.push(_react2.default.createElement(
            'a',
            {
              key: index,
              role: 'button',
              'aria-pressed': currentIndex === index ? 'true' : 'false',
              'aria-label': 'Go to Slide ' + (index + 1),
              className: 'image-gallery-thumbnail' + (currentIndex === index ? ' active' : '') + thumbnailClass,
              onClick: function onClick(event) {
                return _this5._onThumbnailClick(event, index);
              }
            },
            renderThumbInner(item)
          ));
        }

        if (_this5.props.showBullets) {
          var bulletOnClick = function bulletOnClick(event) {
            if (item.bulletOnClick) {
              item.bulletOnClick({ item: item, itemIndex: index, currentIndex: currentIndex });
            }
            return _this5.slideToIndex.call(_this5, index, event);
          };
          bullets.push(_react2.default.createElement('button', {
            key: index,
            type: 'button',
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
          ref: this._initGalleryResizing,
          className: 'image-gallery-slide-wrapper ' + thumbnailPosition + ' ' + (isRTL ? 'image-gallery-rtl' : '')
        },
        this.props.renderCustomControls && this.props.renderCustomControls(),
        this.props.showFullscreenButton && this.props.renderFullscreenButton(this._toggleFullScreen, isFullscreen),
        this.props.showPlayButton && this.props.renderPlayPauseButton(this._togglePlay, isPlaying),
        this._canNavigate() ? [this.props.showNav && _react2.default.createElement(
          'span',
          { key: 'navigation' },
          this.props.renderLeftNav(slideLeft, !this._canSlideLeft()),
          this.props.renderRightNav(slideRight, !this._canSlideRight())
        ), _react2.default.createElement(
          _reactSwipeable2.default,
          {
            className: 'image-gallery-swipe',
            disabled: this.props.disableSwipe,
            key: 'swipeable',
            delta: 0,
            flickThreshold: this.props.flickThreshold,
            onSwiping: this._handleSwiping,
            onSwiped: this._handleOnSwiped,
            stopPropagation: this.props.stopPropagation,
            preventDefaultTouchmoveEvent: preventDefaultTouchmoveEvent || scrollingLeftRight
          },
          _react2.default.createElement(
            'div',
            {
              className: 'image-gallery-slides',
              style: _extends(this._getSlidesStyle(), this.state.style)
            },
            slides
          )
        )] : _react2.default.createElement(
          'div',
          {
            className: 'image-gallery-slides',
            style: this._getSlidesStyle()
          },
          slides
        ),
        this.props.showBullets && _react2.default.createElement(
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
        this.props.showIndex && _react2.default.createElement(
          'div',
          { className: 'image-gallery-index' },
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-current' },
            this.state.currentIndex + 1
          ),
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-separator' },
            this.props.indexSeparator
          ),
          _react2.default.createElement(
            'span',
            { className: 'image-gallery-index-total' },
            this.props.items.length
          )
        )
      );

      var classNames = ['image-gallery', this.props.additionalClass, modalFullscreen ? 'fullscreen-modal' : ''].filter(function (name) {
        return typeof name === 'string';
      }).join(' ');

      return _react2.default.createElement(
        'div',
        {
          ref: function ref(i) {
            return _this5._imageGallery = i;
          },
          className: classNames,
          'aria-live': 'polite'
        },
        _react2.default.createElement(
          'div',
          {
            className: 'image-gallery-content' + (isFullscreen ? ' fullscreen' : '')
          },
          (thumbnailPosition === 'bottom' || thumbnailPosition === 'right') && slideWrapper,
          this.props.showThumbnails && _react2.default.createElement(
            'div',
            {
              className: 'image-gallery-thumbnails-wrapper ' + thumbnailPosition + ' ' + (!this._isThumbnailHorizontal() && isRTL ? 'thumbnails-wrapper-rtl' : ''),
              style: this._getThumbnailBarHeight()
            },
            _react2.default.createElement(
              'div',
              {
                className: 'image-gallery-thumbnails',
                ref: function ref(i) {
                  return _this5._thumbnailsWrapper = i;
                }
              },
              _react2.default.createElement(
                'div',
                {
                  ref: function ref(t) {
                    return _this5._thumbnails = t;
                  },
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
  flickThreshold: _propTypes2.default.number,
  items: _propTypes2.default.array.isRequired,
  showNav: _propTypes2.default.bool,
  autoPlay: _propTypes2.default.bool,
  lazyLoad: _propTypes2.default.bool,
  lazyLoadNext: _propTypes2.default.bool,
  showIndex: _propTypes2.default.bool,
  showBullets: _propTypes2.default.bool,
  showThumbnails: _propTypes2.default.bool,
  showPlayButton: _propTypes2.default.bool,
  showFullscreenButton: _propTypes2.default.bool,
  disableThumbnailScroll: _propTypes2.default.bool,
  disableArrowKeys: _propTypes2.default.bool,
  disableSwipe: _propTypes2.default.bool,
  useBrowserFullscreen: _propTypes2.default.bool,
  preventDefaultTouchmoveEvent: _propTypes2.default.bool,
  defaultImage: _propTypes2.default.string,
  indexSeparator: _propTypes2.default.string,
  thumbnailPosition: _propTypes2.default.string,
  startIndex: _propTypes2.default.number,
  slideDuration: _propTypes2.default.number,
  slideInterval: _propTypes2.default.number,
  swipeThreshold: _propTypes2.default.number,
  swipingTransitionDuration: _propTypes2.default.number,
  onSlide: _propTypes2.default.func,
  onScreenChange: _propTypes2.default.func,
  onPause: _propTypes2.default.func,
  onPlay: _propTypes2.default.func,
  onClick: _propTypes2.default.func,
  onImageLoad: _propTypes2.default.func,
  onImageError: _propTypes2.default.func,
  onTouchMove: _propTypes2.default.func,
  onTouchEnd: _propTypes2.default.func,
  onTouchStart: _propTypes2.default.func,
  onMouseOver: _propTypes2.default.func,
  onMouseLeave: _propTypes2.default.func,
  onImageGalleryReady: _propTypes2.default.func,
  onItemsGalleryChange: _propTypes2.default.func,
  onThumbnailError: _propTypes2.default.func,
  onThumbnailClick: _propTypes2.default.func,
  renderCustomControls: _propTypes2.default.func,
  renderLeftNav: _propTypes2.default.func,
  renderRightNav: _propTypes2.default.func,
  renderPlayPauseButton: _propTypes2.default.func,
  renderFullscreenButton: _propTypes2.default.func,
  renderItem: _propTypes2.default.func,
  stopPropagation: _propTypes2.default.bool,
  additionalClass: _propTypes2.default.string,
  useTranslate3D: _propTypes2.default.bool,
  isRTL: _propTypes2.default.bool,
  disableNavigation: _propTypes2.default.bool
};
ImageGallery.defaultProps = {
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