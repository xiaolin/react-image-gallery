import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClickAndTap from './mixins/click-and-tap';

export default function ThumbnailImporter(
  Image
) {
  if (!Image) { throw "You didn't pass required dependencies" }

  return React.createClass({
    displayName: 'Thumbnail',

    mixins: [
      ClickAndTap,
      PureRenderMixin
    ],

    mouseOver (e) {
      this.props.mouseOver(this.props.item, this.props.index);
    },

    mouseLeave (e) {
      this.props.mouseLeave(this.props.item, this.props.index);
    },

    cssClasses () {
      return classNames('image-gallery-thumbnails__item', this.props.classNames, {
        'image-gallery-thumbnails__item--active': this.props.active
      });
    },

    render () {
      return (
        <a
          onMouseOver={this.mouseOver}
          onMouseLeave={this.mouseLeave}
          className={this.cssClasses()}
          onTouchTap={this.onTouchTap}
          onClick={this.onClick}>

          <Image
            className='image-gallery-thumbnails__item__image'
            src={this.props.item.thumbnail}
            alt={this.props.item.thumbnailAlt}
          />
        </a>
      );
    }

  });
}
