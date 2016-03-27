import React from 'react';

export default React.createClass({
  displayName: 'SlideDescription',

  render () {
    return (
      <span className='image-gallery-slides__item__description'>
        {this.props.item.description}
      </span>
    );
  }
});
