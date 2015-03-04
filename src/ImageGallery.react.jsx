'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ImageGallery = React.createClass({

  mixins: [PureRenderMixin],

  displayName: 'ImageGallery',

  propTypes: {
    items: React.PropTypes.array.isRequired,
    showThumbnails: React.PropTypes.bool,
    showBullets: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      showThumbnails: true,
      showBullets: false
    }
  },

  getInitialState: function() {
    return {
      currentIndex: 0,
      thumbnailTranslateX: 0,
      containerWidth: 0
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.containerWidth != this.state.containerWidth) {
      // indexDifference should always be 1 unless its the initial index
      var indexDifference = this.state.currentIndex > 0 ? 1 : 0;

      // when the container resizes, thumbnailTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0
      this.setState({
        thumbnailTranslateX: -this._getScrollX(indexDifference) * this.state.currentIndex
      });
    }

    if (prevState.currentIndex != this.state.currentIndex) {
      var indexDifference = Math.abs(prevState.currentIndex - this.state.currentIndex);
      var scrollX = this._getScrollX(indexDifference);
      if (scrollX > 0) {
        if (prevState.currentIndex < this.state.currentIndex) {
          this.setState({thumbnailTranslateX: this.state.thumbnailTranslateX - scrollX});
        } else if (prevState.currentIndex > this.state.currentIndex) {
          this.setState({thumbnailTranslateX: this.state.thumbnailTranslateX + scrollX});
        }
      }
    }

  },

  componentDidMount: function() {
    this.setState({containerWidth: this.getDOMNode().offsetWidth});
    window.addEventListener("resize", this._handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener("resize", this._handleResize);
  },

  slideToIndex: function(index) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({currentIndex: slideCount});
    } else if (index > slideCount) {
      this.setState({currentIndex: 0});
    } else {
      this.setState({currentIndex: index});
    }
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

  render: function() {
    var currentIndex = this.state.currentIndex;
    var ThumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)'
    };

    return (
      <section className='ImageGallery'>
        <div className='ImageGallery_content'>

          <a className='ImageGallery_content_left_nav'
            onClick={this.slideToIndex.bind(this, currentIndex - 1)}/>


          <a className='ImageGallery_content_right_nav'
            onClick={this.slideToIndex.bind(this, currentIndex + 1)}/>

          <div className='ImageGallery_content_slides'>
            {
              this.props.items.map(function(item, index) {

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

                return (
                  <div
                    key={index}
                    className={'ImageGallery_content_slides_slide ' + alignment}>
                    <img src={item.original}/>
                  </div>
                );
              }, this)
            }
          </div>

          {
            this.props.showBullets &&
              <div className='ImageGallery_bullet_container'>
                <ul className='ImageGallery_bullet_container_bullets'>
                  {
                    this.props.items.map(function(item, index) {
                      return (
                        <li
                          key={index}
                          className={'ImageGallery_bullet_container_bullets_bullet ' + (currentIndex === index ? 'active' : '')}
                          onClick={this.slideToIndex.bind(this, index)}>
                        </li>
                      );
                    }, this)
                  }
                </ul>
              </div>
          }
        </div>

        {
          this.props.showThumbnails &&
            <div className='ImageGallery_thumbnail_container'>
              <div
                ref='thumbnails'
                className='ImageGallery_thumbnail_container_thumbnails'
                style={ThumbnailStyle}>
                {
                  this.props.items.map(function(item, index) {
                    return (
                      <a
                        key={index}
                        className={'ImageGallery_thumbnail_container_thumbnails_thumbnail ' + (currentIndex === index ? 'active' : '')}
                        onClick={this.slideToIndex.bind(this, index)}>
                        <img src={item.thumbnail}/>
                      </a>
                    );
                  }, this)
                }
              </div>
            </div>
        }
      </section>
    );

  }

});

module.exports = ImageGallery;
