import React from 'react';
import classNames from 'classnames';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'LeftNav',

  mixins: [
    PureRenderMixin
  ],

  onTouchTap (e) {
    e.preventDefault();
    this.props.onClick();
  },

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
      />
    );
  }
});
