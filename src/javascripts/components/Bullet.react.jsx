import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClickAndTap from './mixins/click-and-tap';

export default React.createClass({
  displayName: 'Bullet',

  mixins: [
    ClickAndTap,
    PureRenderMixin
  ],

  getDefaultProps () {
    return {
      item: this
    };
  },

  cssClasses () {
    return classNames('image-gallery-bullet', this.props.classNames, {
      'active': this.props.active
    });
  },

  render () {
    return (
       <li
        className={this.cssClasses()}
        onTouchTap={this.onTouchTap}
        onClick={this.onClick}>
      </li>     
    );
  }
});
