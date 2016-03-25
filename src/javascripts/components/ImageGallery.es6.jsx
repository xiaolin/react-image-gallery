import React from 'react';
import ReactDOM from 'react-dom';

import Utils from '../utils';

export default function ImageGalleryImporter(
  SlidesContainer,
  ThumbnailsContainer,
  BulletsContainer,
  GalleryIndex
) {
  if (
    !SlidesContainer ||
    !ThumbnailsContainer ||
    !BulletsContainer ||
    !GalleryIndex
  ) { throw "You didn't pass required dependencies" }
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
      if (prevState.currentIndex !== this.state.currentIndex) {
        // call back function if provided
        if (this.props.onSlide) {
          this.props.onSlide(this.state.currentIndex);
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

    onBulletChanged (bulletIndex) {
      this.slideToIndex(bulletIndex, true);
    },

    onThumbnailChanged (thumbnail, index) {
      this.slideToIndex(index, true);
    },

    // now, event says if the call is a user one
    slideToIndex (index, userEvent) {
      let slideCount = this.props.items.length - 1;

      if (index < 0) {
        if (this.props.infinite || !userEvent) {
          this.setState({currentIndex: slideCount});
        } else {
          this.setState({currentIndex: 0});
        }
      } else if (index > slideCount) {
        if (this.props.infinite || !userEvent) {
          this.setState({currentIndex: 0})
        } else {
          this.setState({currentIndex: slideCount});
        }
      } else {
        this.setState({currentIndex: index});
      }
      if (userEvent) {
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

    renderBullets () {
      if (this.props.showBullets) {
        return (
          <div className='image-gallery-container__content__bullets-container'>
            <BulletsContainer
              numberOfBullets={this.props.items.length}
              onClick={this.onBulletChanged}
              currentIndex={this.state.currentIndex}
            />
          </div>
        );
      }
    },

    renderSlides () {
      return (
        <div className='image-gallery-container__content__slides-container'>
          <SlidesContainer
            items={this.props.items}
            currentIndex={this.state.currentIndex}
            server={this.props.server}
            lazyLoad={this.props.lazyLoad}
            onSwipedRight={this.swipePrev}
            onSwipedLeft={this.swipeNext}
            showNav={this.props.showNav}
            showDescription={this.props.showDescription}
            infinite={this.props.infinite}
          />
        </div>
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
          <div className='image-gallery-container__content__thumbnails-container'>
            <ThumbnailsContainer
              items={this.props.items}
              currentIndex={this.state.currentIndex}
              mouseOver={this.handleMouseOverThumbnails}
              mouseLeave={this.handleMouseLeaveThumbnails}
              onClick={this.onThumbnailChanged}
            />
          </div>
        );
      }
    },

    render () {
      return (
        <section
          ref='imageGallery'
          className='image-gallery-container'
        >
          <div
            onMouseOver={this.handleMouseOver}
            onMouseLeave={this.handleMouseLeave}
            className='image-gallery-container__content'
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
