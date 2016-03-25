import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default function SlideImporter (
  Image,
  SlideDescription
) {
  if (!Image || !SlideDescription) { throw "You didn't pass required dependencies" }
  return React.createClass({
    displayName: 'Slide',

    mixins: [PureRenderMixin],

    getDefaultProps () {
      return {
        showDescription: false
      };
    },

    getInitialState () {
      return {
        imageCssClass: this.props.server ? 'image-gallery-slides__item__image--loaded' : ''
      };
    },

    cssClasses () {
      return classNames('image-gallery-slides__item', {
        [`image-gallery-slides__item--${this.props.alignment}`]: this.props.alignment,
        [`${this.props.item.originalClass}`]: this.props.item.originalClass
      });
    },

    imageCssClasses () {
      return ['image-gallery-slides__item__image', this.state.imageCssClass].join(' ');
    },

    handleImageLoad (event) {
      // slide images have an opacity of 0, onLoad the class 'loaded' is added
      // so that it transitions smoothly when navigating to non adjacent slides
      // TODO: Check if setState is OK for this usecase. If it is, I think this is
      // more react-way.
      this.setState({
        imageCssClass: 'image-gallery-slides__item__image--loaded'
      })
    },

    renderDescription () {
      if (this.props.showDescription) {
        return (
          <SlideDescription item={this.props.item} />
        );
      }
    },

    render () {
      return (
        <div
          className={this.cssClasses()}
        >
          <Image
            className={this.imageCssClasses()}
            src={this.props.item.original}
            alt={this.props.item.originalAlt}
            handleLoad={this.handleImageLoad}
            defaultImage={this.props.item.defaultSrc}
          />
          {this.renderDescription()}
        </div>
      );
    }
  });
}
