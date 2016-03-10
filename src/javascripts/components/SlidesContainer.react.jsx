import React from 'react';
import Swipeable from 'react-swipeable';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import AlignmentMixin from './mixins/alignment';

import Slide from './Slide';

export default React.createClass({
  displayName: 'SlidesContainer',

  mixins: [
    AlignmentMixin,
    PureRenderMixin
  ],

  renderSlides () {
    let slides = [];
    for (let i = 0; i < this.props.items.length; i++) {
      let alignment = this.getAlignmentClassName(i);
      if (!this.props.lazyLoad || (this.props.lazyLoad && alignment)) {
        slides.push(
          <Slide
            key={i}
            item={this.props.items[i]}
            server={this.props.server}
            alignment={alignment}
          />
        );
      }
    }
    return slides;
  },

  render () {
    if (this.props.items.length > 1) {
      return (
        <Swipeable
          onSwipedLeft={this.props.onSwipedLeft}
          onSwipedRight={this.props.onSwipedRight}
        >
          <div className='image-gallery-slides'>
            {this.renderSlides()}
          </div>
        </Swipeable>
      );
    } else {
      return (
        <div className='image-gallery-slides'>
          {this.renderSlides()}
        </div>
      );
    }
  }
});
