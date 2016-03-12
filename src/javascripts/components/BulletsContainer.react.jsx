import React from 'react';

import PureRenderMixin from 'react-addons-pure-render-mixin';

import Bullet from './Bullet'

export default React.createClass({
  displayName: 'BulletsContainer',

  mixins: [PureRenderMixin],

  renderBullets () {
    let bullets = [];
    for (let i = 0; i < this.props.numberOfBullets; i++) {
      bullets.push(
        <Bullet
          key={i}
          index={i}
          active={this.props.currentIndex == i}
          onTouchTap={this.props.onTouchTap}
          onClick={this.props.onClick}
        />
      );
    };
    return bullets;
  },

  render () {
    return (
      <div className='image-gallery-bullets'>
        <ul className='image-gallery-bullets-container'>
          {this.renderBullets()}
        </ul>
      </div>
    );
  }
});
