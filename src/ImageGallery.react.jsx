'use strict';

var React = require('react/addons');
var Swipeable = require('react-swipeable');

var ImageGallery = React.createClass({

  mixins: [React.addons.PureRenderMixin],

  displayName: 'ImageGallery',

  propTypes: {
    items: React.PropTypes.array.isRequired,
    showThumbnails: React.PropTypes.bool,
    showBullets: React.PropTypes.bool,
    autoPlay: React.PropTypes.bool,
    lazyLoad: React.PropTypes.bool,
    slideInterval: React.PropTypes.number,
    onSlide: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      lazyLoad: true,
      showThumbnails: true,
      showBullets: false,
      autoPlay: false,
      slideInterval: 4000
    };
  },

  getInitialState: function() {
    return {
      currentIndex: 0,
      thumbnailsTranslateX: 0,
      containerWidth: 0
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.containerWidth !== this.state.containerWidth ||
        prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when window width is adjusted
      // when the container resizes, thumbnailsTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0

      this._setThumbnailsTranslateX(
        -this._getScrollX(this.state.currentIndex > 0 ? 1 : 0) *
        this.state.currentIndex);

    }

    if (prevState.currentIndex !== this.state.currentIndex) {

      // call back function if provided
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex);
      }

      // calculates thumbnail container position
      if (this.state.currentIndex === 0) {
        this._setThumbnailsTranslateX(0);
      } else {
        var indexDifference = Math.abs(
          prevState.currentIndex - this.state.currentIndex);
        var scrollX = this._getScrollX(indexDifference);
        if (scrollX > 0) {
          if (prevState.currentIndex < this.state.currentIndex) {
            this._setThumbnailsTranslateX(
              this.state.thumbnailsTranslateX - scrollX);
          } else if (prevState.currentIndex > this.state.currentIndex) {
            this._setThumbnailsTranslateX(
              this.state.thumbnailsTranslateX + scrollX);
          }
        }
      }
    }

  },

  componentDidMount: function() {
    this._handleResize();
    if (this.props.autoPlay) {
      this.play();
    }
    window.addEventListener('resize', this._handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this._handleResize);
  },

  slideToIndex: function(index, event) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({currentIndex: slideCount});
    } else if (index > slideCount) {
      this.setState({currentIndex: 0});
    } else {
      this.setState({currentIndex: index});
    }
    if (event) {
      if (this._intervalId) {
        // user event, reset interval
        this.pause();
        this.play();
      }
      event.preventDefault();
    }
  },

  play: function() {
    if (this._intervalId) {
      return;
    }
    this._intervalId = window.setInterval(function() {
      if (!this.state.hovering) {
        this.slideToIndex(this.state.currentIndex + 1);
      }
    }.bind(this), this.props.slideInterval);
  },

  pause: function() {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  _setThumbnailsTranslateX: function(x) {
    this.setState({thumbnailsTranslateX: x});
  },

  _handleResize: function() {
    this.setState({containerWidth: this.getDOMNode().offsetWidth});
  },

  _getScrollX: function(indexDifference) {
    if (this.refs.thumbnails) {
      var thumbNode = this.refs.thumbnails.getDOMNode();
      if (thumbNode.scrollWidth <= this.state.containerWidth) {
        return 0;
      }
      var totalThumbnails = thumbNode.children.length;

      // total scroll-x required to see the last thumbnail
      var totalScrollX = thumbNode.scrollWidth - this.state.containerWidth;

      // scroll-x required per index change
      var perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
    }
  },

  _handleMouseOver: function() {
    this.setState({hovering: true});
  },

  _handleMouseLeave: function() {
    this.setState({hovering: false});
  },

  _getAlignment: function(index) {
    var currentIndex = this.state.currentIndex;
    var alignment = '';
    switch (index) {
      case (currentIndex - 1):
        alignment = 'left';
        break;
      case (currentIndex):
        alignment = 'center';
        break;
      case (currentIndex + 1):
        alignment = 'right';
        break;
    }

    if (this.props.items.length >= 3) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = 'right';
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = 'left';
      }
    }

    return alignment;
  },

  render: function() {
    var currentIndex = this.state.currentIndex;
    var thumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailsTranslateX + 'px, 0, 0)'
    };

    var slides = [];
    var thumbnails = [];
    var bullets = [];

    this.props.items.map(function(item, index) {
      var alignment = this._getAlignment(index);
      if (this.props.lazyLoad) {
        if (alignment) {
          slides.push(
            <div
              key={index}
              className={'image-gallery-slide ' + alignment}>
              <img src={item.original}/>
            </div>
          );
        }
      } else {
        slides.push(
          <div
            key={index}
            className={'image-gallery-slide ' + alignment}>
            <img src={item.original}/>
          </div>
        );
      }

      if (this.props.showThumbnails) {
        thumbnails.push(
          <a
            key={index}
            className={
              'image-gallery-thumbnail ' + (
                currentIndex === index ? 'active' : '')}

            onTouchStart={this.slideToIndex.bind(this, index)}
            onClick={this.slideToIndex.bind(this, index)}>

            <img src={item.thumbnail}/>
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

            onTouchStart={this.slideToIndex.bind(this, index)}
            onClick={this.slideToIndex.bind(this, index)}>
          </li>
        );
      }
    }.bind(this));

    return (
      <section className='image-gallery'>
        <div
          onMouseOver={this._handleMouseOver}
          onMouseLeave={this._handleMouseLeave}
          className='image-gallery-content'>

          <a className='image-gallery-left-nav'
            onTouchStart={this.slideToIndex.bind(this, currentIndex - 1)}
            onClick={this.slideToIndex.bind(this, currentIndex - 1)}/>


          <a className='image-gallery-right-nav'
            onTouchStart={this.slideToIndex.bind(this, currentIndex + 1)}
            onClick={this.slideToIndex.bind(this, currentIndex + 1)}/>

          <Swipeable
            onSwipedLeft={this.slideToIndex.bind(this, currentIndex + 1)}
            onSwipedRight={this.slideToIndex.bind(this, currentIndex - 1)}>
              <div className='image-gallery-slides'>
                {slides}
              </div>
          </Swipeable>

          {
            this.props.showBullets &&
              <div className='image-gallery-bullets'>
                <ul className='image-gallery-bullets-container'>
                  {bullets}
                </ul>
              </div>
          }
        </div>

        {
          this.props.showThumbnails &&
            <div className='image-gallery-thumbnails'>
              <div
                ref='thumbnails'
                className='image-gallery-thumbnails-container'
                style={thumbnailStyle}>
                {thumbnails}
              </div>
            </div>
        }
      </section>
    );

  }

});

module.exports = ImageGallery;
