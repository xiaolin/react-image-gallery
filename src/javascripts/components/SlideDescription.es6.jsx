import React from 'react';

export default React.createClass({
  displayName: 'SlideDescription',

  render () {
    return (
      <span className='image-gallery-description'>
        {this.props.item.description}
      </span>
    );
  }
});
