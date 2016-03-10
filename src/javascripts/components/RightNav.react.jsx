import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClickAndTap from './mixins/click-and-tap';

export default React.createClass({
  displayName: 'RightNav',

  mixins: [
    ClickAndTap,
    PureRenderMixin
  ],

  cssClasses () {
    return classNames('image-gallery-right-nav', this.props.classNames, {
      'active': this.props.active
    });
  },

  render () {
    <a
      className={this.cssClasses()}
      onTouchTap={this.onTouchTap}
      onClick={this.onClick}
    /> 
  }
});
