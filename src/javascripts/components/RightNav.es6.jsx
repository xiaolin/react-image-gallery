import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'RightNav',

  mixins: [
    PureRenderMixin
  ],

  onTouchTap (e) {
    e.preventDefault();
    this.props.onClick();
  },

  cssClasses () {
    return classNames('image-gallery-right-nav', {
      'image-gallery-right-nav--inactive': !this.props.active
    });
  },

  render () {
    return (
      <a
        className={this.cssClasses()}
        onTouchTap={this.onTouchTap}
      />
    );
  }
});
