import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClickAndTap from './mixins/click-and-tap';

export default React.createClass({
  displayName: 'LeftNav',

  mixins: [
    ClickAndTap,
    PureRenderMixin
  ],

  cssClasses () {
    return classNames('image-gallery-left-nav', {
      'image-gallery-left-nav--inactive': !this.props.active
    });
  },

  render () {
    return (
      <a
        className={this.cssClasses()}
        onTouchTap={this.onTouchTap}
        onClick={this.onClick}
      />
    );
  }
});
