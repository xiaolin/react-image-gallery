import React from 'react';
import Swipeable from 'react-swipeable';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import AlignmentMixin from './mixins/alignment';

export default function SlidesContainerImporter(
  Slide,
  LeftNav,
  RightNav
) {
  return React.createClass({
    displayName: 'SlidesContainer',

    mixins: [
      AlignmentMixin,
      PureRenderMixin
    ],

    renderNavs () {
      if (this.props.showNav) {
        return [
          <LeftNav
            key='left-nav'
            onClick={this.props.onSwipedRight}
            active={this.props.infinite || this.props.currentIndex > 0}
          />,
          <RightNav
            key='right-nav'
            onClick={this.props.onSwipedLeft}
            active={this.props.infinite || this.props.currentIndex < this.props.items.length - 1}
          />
        ];
      }
    },

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
              showDescription={this.props.showDescription}
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
              <div className='image-gallary-slides__nav-container'>
                {this.renderNavs()}
              </div>
            </div>
          </Swipeable>
        );
      } else {
        return (
          <div className='image-gallery-slides'>
            {this.renderSlides()}
            <div className='image-gallary-slides__nav-container'>
              {this.renderNavs()}
            </div>
          </div>
        );
      }
    }
  });
}
