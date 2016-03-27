import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'GalleryIndex',

  mixins: [PureRenderMixin],

  render () {
    return (
      <div className='image-gallery-index'>
        <span className='image-gallery-index__current'>
          {this.props.index + 1}
        </span>
        <span className='image-gallery-index__separator'>
          {this.props.indexSeparator}
        </span>
        <span className='image-gallery-index__total'>
          {this.props.total}
        </span>
      </div>
    );
  }
});
