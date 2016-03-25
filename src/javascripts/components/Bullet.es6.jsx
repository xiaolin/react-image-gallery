import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'Bullet',

  mixins: [
    PureRenderMixin
  ],

  onTouchTap (e) {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(this.props.index);
    }
  },

  cssClasses () {
    return classNames('image-gallery-bullets__item', {
      'image-gallery-bullets__item--active': this.props.active
    });
  },

  render () {
    return (
       <li
        className={this.cssClasses()}
        onTouchTap={this.onTouchTap}
      >
      </li>
    );
  }
});
