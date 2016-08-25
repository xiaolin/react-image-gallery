import React from 'react';
import Swipeable from 'react-swipeable';

const MIN_INTERVAL = 500;

function throttle(func, wait) {
  let context, args, result;
  let timeout = null;
  let previous = 0;

  let later = function() {
    previous = new Date().getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    let now = new Date().getTime();
    let remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

}

// This is to handle accessing event properties in an asynchronous way
// https://facebook.github.io/react/docs/events.html#syntheticevent
function debounceEventHandler(...args) {
  const throttled = throttle(...args);
  return function(event) {
    if (event) {
      event.persist();
      return throttled(event);
    }

    return throttled();
  };
}


export default class ImageGallery extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: props.startIndex,
      thumbsTranslateX: 0,
      offsetPercentage: 0,
      galleryWidth: 0,
      thumbnailWidth: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.disableArrowKeys !== nextProps.disableArrowKeys) {
      if (nextProps.disableArrowKeys) {
        window.removeEventListener('keydown', this._handleKeyDown);
      } else {
        window.addEventListener('keydown', this._handleKeyDown);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.thumbnailWidth !== this.state.thumbnailWidth ||
        prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when thumbnail width is adjusted
      this._setThumbsTranslateX(
        -this._getThumbsTranslateX(
          this.state.currentIndex > 0 ? 1 : 0) * this.state.currentIndex);

    }

    if (prevState.currentIndex !== this.state.currentIndex) {
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex);
      }

      this._updateThumbnailTranslateX(prevState);
    }
  }

  componentWillMount() {
    this._slideLeft = debounceEventHandler(
      this._slideLeft.bind(this), MIN_INTERVAL, true);

    this._slideRight = debounceEventHandler(
      this._slideRight.bind(this), MIN_INTERVAL, true);

    this._handleResize = this._handleResize.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._thumbnailDelay = 300;
  }

  componentDidMount() {
    // delay initial resize to get the accurate this._imageGallery.offsetWidth
    window.setTimeout(() => this._handleResize(), 500);

    if (this.props.autoPlay) {
      this.play();
    }
    if (!this.props.disableArrowKeys) {
      window.addEventListener('keydown', this._handleKeyDown);
    }
    window.addEventListener('resize', this._handleResize);
  }

  componentWillUnmount() {
    if (!this.props.disableArrowKeys) {
      window.removeEventListener('keydown', this._handleKeyDown);
    }
    window.removeEventListener('resize', this._handleResize);
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  play(callback = true) {
    if (this._intervalId) {
      return;
    }
    const {slideInterval} = this.props;
    this._intervalId = window.setInterval(() => {
      if (!this.state.hovering) {
        if (!this.props.infinite && !this._canSlideRight()) {
          this.pause();
        } else {
          this.slideToIndex(this.state.currentIndex + 1);
        }
      }
    }, slideInterval > MIN_INTERVAL ? slideInterval : MIN_INTERVAL);

    if (this.props.onPlay && callback) {
      this.props.onPlay(this.state.currentIndex);
    }

  }

  pause(callback = true) {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }

    if (this.props.onPause && callback) {
      this.props.onPause(this.state.currentIndex);
    }
  }

  fullScreen() {
    const gallery = this._imageGallery;

    if (gallery.requestFullscreen) {
      gallery.requestFullscreen();
    } else if (gallery.msRequestFullscreen) {
      gallery.msRequestFullscreen();
    } else if (gallery.mozRequestFullScreen) {
      gallery.mozRequestFullScreen();
    } else if (gallery.webkitRequestFullscreen) {
      gallery.webkitRequestFullscreen();
    }
  }

  slideToIndex(index, event) {
    if (event) {
      event.preventDefault();
      if (this._intervalId) {
        // user triggered event while ImageGallery is playing, reset interval
        this.pause(false);
        this.play(false);
      }
    }

    let slideCount = this.props.items.length - 1;
    let currentIndex = index;

    if (index < 0) {
      currentIndex = slideCount;
    } else if (index > slideCount) {
      currentIndex = 0;
    }

    this.setState({
      previousIndex: this.state.currentIndex,
      currentIndex: currentIndex,
      offsetPercentage: 0,
      style: {
        transition: 'transform .45s ease-out'
      }
    });
  }

  getCurrentIndex() {
    return this.state.currentIndex;
  }

  _handleResize() {
    if (this._imageGallery) {
      this.setState({galleryWidth: this._imageGallery.offsetWidth});
    }

    if (this._imageGalleryThumbnail) {
      this.setState({thumbnailWidth: this._imageGalleryThumbnail.offsetWidth});
    }
  }

  _handleKeyDown(event) {
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
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

  _handleMouseOver() {
    this.setState({hovering: true});
  }

  _handleMouseLeave() {
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

  _shouldSlideOnSwipe() {
    const shouldSlide = Math.abs(this.state.offsetPercentage) > 30 ||
      this.state.isFlick;

    if (shouldSlide) {
      // reset isFlick state after so data is not persisted
      this.setState({isFlick: false});
    }
    return shouldSlide;
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

    this.slideToIndex(slideTo);
  }

  _handleSwiping(index, _, delta) {
    const offsetPercentage = index * (delta / this.state.galleryWidth * 100);
    this.setState({offsetPercentage: offsetPercentage, style: {}});
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

  _updateThumbnailTranslateX(prevState) {
    if (this.state.currentIndex === 0) {
      this._setThumbsTranslateX(0);
    } else {
      let indexDifference = Math.abs(
        prevState.currentIndex - this.state.currentIndex);
      let scrollX = this._getThumbsTranslateX(indexDifference);
      if (scrollX > 0) {
        if (prevState.currentIndex < this.state.currentIndex) {
          this._setThumbsTranslateX(
            this.state.thumbsTranslateX - scrollX);
        } else if (prevState.currentIndex > this.state.currentIndex) {
          this._setThumbsTranslateX(
            this.state.thumbsTranslateX + scrollX);
        }
      }
    }
  }

  _setThumbsTranslateX(thumbsTranslateX) {
    this.setState({thumbsTranslateX});
  }

  _getThumbsTranslateX(indexDifference) {
    if (this.props.disableThumbnailScroll) {
      return 0;
    }

    const {thumbnailWidth} = this.state;

    if (this._thumbnails) {
      if (this._thumbnails.scrollWidth <= thumbnailWidth) {
        return 0;
      }
      let totalThumbnails = this._thumbnails.children.length;
      // total scroll-x required to see the last thumbnail
      let totalScrollX = this._thumbnails.scrollWidth - thumbnailWidth;
      // scroll-x required per index change
      let perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
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

  _getSlideStyle(index) {
    const {currentIndex, offsetPercentage} = this.state;
    const {infinite, items} = this.props;
    const baseTranslateX = -100 * currentIndex;
    const totalSlides = items.length - 1;

    // calculates where the other slides belong based on currentIndex
    let translateX = baseTranslateX + (index * 100) + offsetPercentage;

    // adjust zIndex so that only the current slide and the slide were going
    // to is at the top layer, this prevents transitions from flying in the
    // background when swiping before the first slide or beyond the last slide
    let zIndex = 1;
    if (index === currentIndex) {
      zIndex = 3;
    } else if (index === this.state.previousIndex) {
      zIndex = 2;
    }

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

    const translate3d = `translate3d(${translateX}%, 0, 0)`;

    return {
      WebkitTransform: translate3d,
      MozTransform: translate3d,
      msTransform: translate3d,
      OTransform: translate3d,
      transform: translate3d,
      zIndex: zIndex
    };
  }

  _getThumbnailStyle() {
    const translate3d = `translate3d(${this.state.thumbsTranslateX}px, 0, 0)`;
    return {
      WebkitTransform: translate3d,
      MozTransform: translate3d,
      msTransform: translate3d,
      OTransform: translate3d,
      transform: translate3d
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

  render() {
    const {currentIndex} = this.state;
    const thumbnailStyle = this._getThumbnailStyle();

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

      const slide = (
        <div
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          style={Object.assign(this._getSlideStyle(index), this.state.style)}
          onClick={this.props.onClick}
        >
          {renderItem(item)}
        </div>
      );

      if (this.props.lazyLoad) {
        if (alignment) {
          slides.push(slide);
        }
      } else {
        slides.push(slide);
      }

      let onThumbnailError = this._handleImageError;
      if (this.props.onThumbnailError) {
        onThumbnailError = this.props.onThumbnailError;
      }

      if (this.props.showThumbnails) {
        thumbnails.push(
          <a
            onMouseOver={this._handleMouseOverThumbnails.bind(this, index)}
            onMouseLeave={this._handleMouseLeaveThumbnails.bind(this, index)}
            key={index}
            className={
              'image-gallery-thumbnail' +
              (currentIndex === index ? ' active' : '') +
              thumbnailClass
            }

            onTouchStart={event => this.slideToIndex.call(this, index, event)}
            onClick={event => this.slideToIndex.call(this, index, event)}>
              <img
                src={item.thumbnail}
                alt={item.thumbnailAlt}
                onError={onThumbnailError.bind(this)}/>
              <div className='image-gallery-thumbnail-label'>
                {item.thumbnailLabel}
              </div>
          </a>
        );
      }

      if (this.props.showBullets) {
        bullets.push(
          <li
            key={index}
            className={
              'image-gallery-bullet ' + (
                currentIndex === index ? 'active' : '')}

            onTouchStart={event => this.slideToIndex.call(this, index, event)}
            onClick={event => this.slideToIndex.call(this, index, event)}>
          </li>
        );
      }
    });

    return (
      <section ref={i => this._imageGallery = i} className='image-gallery'>
        <div
          onMouseOver={this._handleMouseOver.bind(this)}
          onMouseLeave={this._handleMouseLeave.bind(this)}
          className='image-gallery-content'>
          {
            this._canNavigate() ?
              [
                this.props.showNav &&
                  <span key='navigation'>
                    {
                      this._canSlideLeft() &&
                        <a
                          className='image-gallery-left-nav'
                          onTouchStart={slideLeft}
                          onClick={slideLeft}/>

                    }
                    {
                      this._canSlideRight() &&
                        <a
                          className='image-gallery-right-nav'
                          onTouchStart={slideRight}
                          onClick={slideRight}/>
                    }
                  </span>,

                  <Swipeable
                    className='image-gallery-swipe'
                    key='swipeable'
                    delta={1}
                    onSwipingLeft={this._handleSwiping.bind(this, -1)}
                    onSwipingRight={this._handleSwiping.bind(this, 1)}
                    onSwiped={this._handleOnSwiped.bind(this)}
                    onSwipedLeft={this._handleOnSwipedTo.bind(this, 1)}
                    onSwipedRight={this._handleOnSwipedTo.bind(this, -1)}
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
                <ul className='image-gallery-bullets-container'>
                  {bullets}
                </ul>
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

        {
          this.props.showThumbnails &&
            <div
              className='image-gallery-thumbnails'
              ref={i => this._imageGalleryThumbnail = i}
            >
              <div
                ref={t => this._thumbnails = t}
                className='image-gallery-thumbnails-container'
                style={thumbnailStyle}>
                {thumbnails}
              </div>
            </div>
        }
      </section>
    );
  }

}

ImageGallery.propTypes = {
  items: React.PropTypes.array.isRequired,
  showNav: React.PropTypes.bool,
  autoPlay: React.PropTypes.bool,
  lazyLoad: React.PropTypes.bool,
  infinite: React.PropTypes.bool,
  showIndex: React.PropTypes.bool,
  showBullets: React.PropTypes.bool,
  showThumbnails: React.PropTypes.bool,
  slideOnThumbnailHover: React.PropTypes.bool,
  disableThumbnailScroll: React.PropTypes.bool,
  disableArrowKeys: React.PropTypes.bool,
  defaultImage: React.PropTypes.string,
  indexSeparator: React.PropTypes.string,
  startIndex: React.PropTypes.number,
  slideInterval: React.PropTypes.number,
  onSlide: React.PropTypes.func,
  onPause: React.PropTypes.func,
  onPlay: React.PropTypes.func,
  onClick: React.PropTypes.func,
  onImageLoad: React.PropTypes.func,
  onImageError: React.PropTypes.func,
  onThumbnailError: React.PropTypes.func,
  renderItem: React.PropTypes.func,
};

ImageGallery.defaultProps = {
  items: [],
  showNav: true,
  autoPlay: false,
  lazyLoad: false,
  infinite: true,
  showIndex: false,
  showBullets: false,
  showThumbnails: true,
  slideOnThumbnailHover: false,
  disableThumbnailScroll: false,
  disableArrowKeys: false,
  indexSeparator: ' / ',
  startIndex: 0,
  slideInterval: 3000
};
