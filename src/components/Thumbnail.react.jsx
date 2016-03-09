import React from 'react';
import classNames from 'classnames';
import Image from './Image';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'Thumbnail',

  mixins: [PureRenderMixin],

  mouseOver (e) {
    this.props.mouseOver(this.props.item, this.props.index);
  },

  mouseLeave (e) {
    this.props.mouseLeave(this.props.item, this.props.index);
  },

  cssClasses () {
    return classNames('image-gallery-thumbnail', this.props.classNames, {
      'active': this.props.active
    });
  },

  onTouchTap (e) {
    if (this.props.onTouchTap) {
      this.props.onTouchTap(this.props.item, this.props.index);
    } else if (this.props.onClick) {
      this.props.onClick(this.props.item, this.props.index);
    }
  },

  onClick (e) {
    if (this.props.onClick) {
      e.preventDefault();
      this.props.onClick(this.props.item, this.props.index);
    }
  },

  render () {
    return (
      <a
        onMouseOver={this.mouseOver}
        onMouseLeave={this.mouseLeave}
        className={this.cssClasses()}
        onTouchTap={this.onTouchTap}
        onClick={this.onClick}>

        <img
          src={item.thumbnail}
          alt={item.thumbnailAlt}
          onError={this._handleImageError}/>
      </a>   
    );
  }
  
});
