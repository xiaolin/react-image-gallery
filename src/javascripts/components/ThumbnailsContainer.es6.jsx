import React from 'react';
import ReactDOM from 'react-dom';

import PureRenderMixin from 'react-addons-pure-render-mixin';

export default function ThumbnailsContainerImporter(
  Thumbnail
) {
  if (!Thumbnail) { throw "You didn't pass required dependencies" }
  return  React.createClass({
    displayName: 'ThumbnailsContainer',

    mixins: [PureRenderMixin],

    getInitialState () {
      return {
        containerWidth: 0,
        positionX: 0
      };
    },

    componentDidMount () {
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount () {
      window.removeEventListener('resize', this.handleResize);
    },

    componentDidUpdate (prevProps, prevState) {
      if (prevState.containerWidth !== this.state.containerWidth) {
        // adjust thumbnail container when window width is adjusted
        // when the container resizes, thumbnailsTranslateX
        // should always be negative (moving right),
        // if container fits all thumbnails its set to 0

        this.setState({
          positionX: -this._getScrollX(this.props.currentIndex > 0 ? 1 : 0) * this.props.currentIndex
        });
      }

      if (prevProps.currentIndex !== this.props.currentIndex) {
        this._setNewPosition(prevProps.currentIndex, this.props.currentIndex);
      }
    },

    handleResize () {
      let newContainerWidth = this.refs.thumbnails.offsetWidth;
      this.setState({containerWidth: newContainerWidth});
    },

    cssPosition () {
      let positionX = `${this.state.positionX}px`;
      let translate = `translate3d(${positionX}, 0, 0)`;
      return {
        MozTransform: translate,
        WebkitTransform: translate,
        OTransform: translate,
        msTransform: translate,
        transform: translate
      };
    },

    _setNewPosition (oldIndex, newIndex) {
      let positionX = 0;
      if (newIndex !== 0) {
        let indexDifference = Math.abs(
          oldIndex - newIndex
        );
        let scrollX = this._getScrollX(indexDifference);
        if (scrollX > 0) {
          if (oldIndex < newIndex) {
            positionX = this.state.positionX - scrollX;
          } else if (oldIndex > newIndex) {
            positionX = this.state.positionX + scrollX;
          }
        }
      }
      this.setState({positionX: positionX});
    },

    _getScrollX (indexDifference) {
      let thumbnails = ReactDOM.findDOMNode(this.refs.thumbnails);
      if (this.props.disableScroll) {
        return 0;
      }
      if (thumbnails) {
        // no need to scroll
        if (thumbnails.scrollWidth <= this.state.containerWidth) {
          return 0;
        }

        let totalThumbnails = this.props.items.length;

        // total scroll-x required to see the last thumbnail
        let totalScrollX = thumbnails.scrollWidth - this.state.containerWidth;

        // scroll-x required per index change
        let perIndexScrollX = totalScrollX / (totalThumbnails - 1);

        return indexDifference * perIndexScrollX;
      }
    },

    renderThumbnails () {
      return this.props.items.map((item, index) => {
        return (
          <Thumbnail
            key={index}
            item={item}
            index={index}
            active={this.props.currentIndex === index}
            mouseOver={this.props.mouseOver}
            mouseLeave={this.props.mouseLeave}
            onClick={this.props.onClick}
            onTouchTap={this.props.onTouchTap}
          />
        )
      });
    },

    render () {
      return (
        <div
          ref='thumbnails'
          className='image-gallery-thumbnails'
          style={this.cssPosition()}
        >
          {this.renderThumbnails()}
        </div>
      );
    }
  });
}
