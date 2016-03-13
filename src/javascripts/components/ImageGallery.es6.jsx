import React from 'react';
import ReactDOM from 'react-dom';

import Utils from '../utils';

export default function ImageGalleryImporter(
  SlidesContainer,
  ThumbnailsContainer,
  BulletsContainer,
  GalleryIndex
) {
  return React.createClass({
    displayName: 'ImageGallery',

    propTypes: {
      items: React.PropTypes.array.isRequired,
      showThumbnails: React.PropTypes.bool,
      showBullets: React.PropTypes.bool,
      showNav: React.PropTypes.bool,
      showIndex: React.PropTypes.bool,
      showDescription: React.PropTypes.bool,
      indexSeparator: React.PropTypes.string,
      autoPlay: React.PropTypes.bool,
      lazyLoad: React.PropTypes.bool,
      infinite: React.PropTypes.bool,
      slideInterval: React.PropTypes.number,
      onSlide: React.PropTypes.func,
      onClick: React.PropTypes.func,
      startIndex: React.PropTypes.number,
      defaultImage: React.PropTypes.string,
      disableThumbnailScroll: React.PropTypes.bool,
      slideOnThumbnailHover: React.PropTypes.bool,
      server: React.PropTypes.bool
    },

    getDefaultProps () {
      return {
        lazyLoad: true,
        showThumbnails: true,
        showNav: true,
        showBullets: false,
        showIndex: false,
        showDescription: false,
        infinite: true,
        indexSeparator: ' / ',
        autoPlay: false,
        disableThumbnailScroll: false,
        server: false,
        slideOnThumbnailHover: false,
        slideInterval: 4000,
        startIndex: 0
      }
    },

    getInitialState () {
      return {
        currentIndex: this.props.startIndex,
        thumbnailsTranslateX: 0,
        containerWidth: 0
      }
    },

    componentWillMount () {
      this._thumbnailDelay = 300;
    },

    componentDidMount () {
      this.handleResize();
      if (this.props.autoPlay) {
        this.play();
      }
      window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount () {
      window.removeEventListener('resize', this.handleResize);
      if (this._intervalId) {
        window.clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    componentDidUpdate (prevProps, prevState) {
      if (prevState.containerWidth !== this.state.containerWidth ||
          prevProps.showThumbnails !== this.props.showThumbnails) {

        // adjust thumbnail container when window width is adjusted
        // when the container resizes, thumbnailsTranslateX
        // should always be negative (moving right),
        // if container fits all thumbnails its set to 0

        this._setThumbnailsTranslateX(
          -this._getScrollX(this.state.currentIndex > 0 ? 1 : 0) *
            this.state.currentIndex
        );

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
          let indexDifference = Math.abs(
            prevState.currentIndex - this.state.currentIndex
          );
          let scrollX = this._getScrollX(indexDifference);
          if (scrollX > 0) {
            if (prevState.currentIndex < this.state.currentIndex) {
              this._setThumbnailsTranslateX(
                this.state.thumbnailsTranslateX - scrollX
              );
            } else if (prevState.currentIndex > this.state.currentIndex) {
              this._setThumbnailsTranslateX(
                this.state.thumbnailsTranslateX + scrollX
              );
            }
          }
        }
      }
    },

    play () {
      if (this._intervalId) {
        return;
      }
      this._intervalId = window.setInterval(() => {
        if (!this.state.hovering) {
          this.slideToIndex(this.state.currentIndex + 1)
        }
      }, this.props.slideInterval);
    },

    pause () {
      if (this._intervalId) {
        window.clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    swipeNext () {
      this.slideToIndex(this.state.currentIndex + 1, true);
    },

    swipePrev () {
      this.slideToIndex(this.state.currentIndex - 1, true);
    },

    onBulletChanged (bullet, bulletIndex) {
      this.slideToIndex(bulletIndex, true);
    },

    // now, event says if the call is a user one
    slideToIndex (index, event) {
      let slideCount = this.props.items.length - 1;

      if (index < 0) {
        if (this.props.infinite || !event) {
          this.setState({currentIndex: slideCount});
        } else {
          this.setState({currentIndex: 0});
        }
      } else if (index > slideCount) {
        if (this.props.infinite || !event) {
          this.setState({currentIndex: 0})
        } else {
          this.setState({currentIndex: slideCount});
        }
      } else {
        this.setState({currentIndex: index});
      }
      if (event) {
        if (this._intervalId) {
          // user event, reset interval
          this.pause();
          this.play();
        }
      }
    },

    handleMouseOver () {
      this.setState({hovering: true});
    },

    handleMouseLeave () {
      this.setState({hovering: false});
    },

    handleResize () {
      let gallery = this.refs.imageGallery;
      this.setState({containerWidth: gallery.offsetWidth});
    },

    handleMouseOverThumbnails (thumbnail, index) {
      if (this.props.slideOnThumbnailHover) {
        this.setState({hovering: true});
        if (this._thumbnailTimer) {
          window.clearTimeout(this._thumbnailTimer);
          this._thumbnailTimer = null;
        }
        this._thumbnailTimer = window.setTimeout(() => {
          this.slideToIndex(index);
          this.pause();
        }, this._thumbnailDelay);
      }
    },

    handleMouseLeaveThumbnails (thumbnail, index) {
      if (this._thumbnailTimer) {
        window.clearTimeout(this._thumbnailTimer);
        this._thumbnailTimer = null;
        if (this.props.autoPlay == true) {
          this.play();
        }
      }
      this.setState({hovering: false});
    },

    _getScrollX (indexDifference) {
      let thumbnails = ReactDOM.findDOMNode(this.refs.thumbnails);
      if (this.props.disableThumbnailScroll) {
        return 0;
      }
      if (thumbnails) {
        if (thumbnails.scrollWidth <= this.state.containerWidth) {
          return 0;
        }

        let totalThumbnails = thumbnails.children.length;

        // total scroll-x required to see the last thumbnail
        let totalScrollX = thumbnails.scrollWidth - this.state.containerWidth;

        // scroll-x required per index change
        let perIndexScrollX = totalScrollX / (totalThumbnails - 1);

        return indexDifference * perIndexScrollX;
      }
    },

    _setThumbnailsTranslateX (x) {
      this.setState({thumbnailsTranslateX: x});
    },

    renderBullets () {
      if (this.props.showBullets) {
        return (
          <BulletsContainer
            numberOfBullets={this.props.items.length}
            onTouchTap={this.onBulletChanged}
            onClick={this.onBulletChanged}
            currentIndex={this.state.currentIndex}
          />
        );
      }
    },

    renderSlides () {
      return (
        <SlidesContainer
          items={this.props.items}
          currentIndex={this.state.currentIndex}
          server={this.props.server}
          lazyLoad={this.props.lazyLoad}
          onSwipedRight={this.swipeNext}
          onSwipedLeft={this.swipePrev}
          showNav={this.props.showNav}
          showDescription={this.props.showDescription}
          infinite={this.props.infinite}
        />
      );
    },

    renderIndex () {
      if (this.props.showIndex) {
        return (
          <GalleryIndex
            index={this.state.currentIndex}
            total={this.props.items.length}
            indexSeparator={this.props.indexSeparator}
          />
        );
      }
    },

    renderThumbnails () {
      if (this.props.showThumbnails) {
        return (
          <div className='image-gallery-thumbnails'>
            <ThumbnailsContainer
              ref='thumbnails'
              items={this.props.items}
              currentIndex={this.state.currentIndex}
              mouseOver={this.handleMouseOverThumbnails}
              mouseLeave={this.handleMouseLeaveThumbnails}
              onTouchTap={this.onBulletChanged}
              onClick={this.onBulletChanged}
              positionX={this.state.thumbnailsTranslateX}
            />
          </div>
        );
      }
    },

    render () {
      return (
        <section
          ref='imageGallery'
          className='image-gallery'
        >
          <div
            onMouseOver={this.handleMouseOver}
            onMouseLeave={this.handleMouseLeave}
            className='image-gallery-content'
          >
            {this.renderSlides()}
            {this.renderBullets()}
            {this.renderIndex()}
            {this.renderThumbnails()}
          </div>

        </section>
      );
    }
  });
}
