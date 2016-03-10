import React from 'react';

import PureRenderMixin from 'react-addons-pure-render-mixin';

import Thumbnail from './Thumbnail'

export default React.createClass({
  displayName: 'ThumbnailsContainer',

  mixins: [PureRenderMixin],

  cssPosition () {
    let positionX = this.props.positionX ? `${this.props.positionX}px` : 0;
    let positionY = this.props.positionY ? `${this.props.positionY}px` : 0;
    let positionZ = this.props.positionZ ? `${this.props.positionZ}px` : 0;
    let translate = `translate3d(${positionX}, ${positionY}, ${positionZ})`;
    return {
      MozTransform: translate,
      WebkitTransform: translate,
      OTransform: translate,
      msTransform: translate,
      transform: translate
    };
    
  },

  renderThumbnails () {
    return this.props.items.map((item, index) => {
      return (
        <Thumbnail
          key={index}
          item={item}
          index={index}
          active={this.props.currentIndex === index}
          mouseOver={this.props.mouseOver}
          mouseLeave={this.props.mouseLeave}
          onClick={this.props.onClick}
          onTouchTap={this.props.onTouchTap}
        />
      )
    });  
  },

  render () {
    return (
      <div
        className='image-gallery-thumbnails-container'
        style={this.cssPosition()}
      >
        {this.renderThumbnails()}
      </div>
    );
  }
});
