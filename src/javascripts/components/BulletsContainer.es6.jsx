import React from 'react';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default function BulletsContainerImporter(
  Bullet
) {
  if (!Bullet) { throw "You didn't pass required dependencies" }
  return React.createClass({
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
        <ul className='image-gallery-bullets'>
          {this.renderBullets()}
        </ul>
      );
    }
  });
}
