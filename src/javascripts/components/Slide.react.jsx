import React from 'react';

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
        imageCssClass: this.props.server ? 'loaded' : ''
      };
    },

    cssClasses () {
      let classNames = [
        'image-gallery-slide',
        this.props.alignment
      ];

      if (this.props.item.originalClass) {
        classNames.push(this.props.item.originalClass);
      }

      return classNames.join(' ');
    },

    handleImageLoad (event) {
      // slide images have an opacity of 0, onLoad the class 'loaded' is added
      // so that it transitions smoothly when navigating to non adjacent slides
      // TODO: Check if setState is OK for this usecase. If it is, I think this is
      // more react-way.
      this.setState({
        imageCssClass: 'loaded'
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
          onClick={this.props.onClick}
          onTouchTap={this.props.onTouchTap || this.props.onClick}
        >
          <Image
            className={this.state.imageCssClass}
            src={this.props.item.original}
            alt={this.props.item.originalAlt}
            handleLoad={this.handleImageLoad}
          />
          {this.renderDescription()}
        </div>
      );
    }
  });
}
