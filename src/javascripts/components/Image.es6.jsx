import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  displayName: 'Image',

  mixins: [PureRenderMixin],

  getInitialState () {
    return {
      src: this.props.src
    };
  },

  handleLoadError (event) {
    if (this.props.defaultImage) {
      this.setState({
        src: this.props.defaultImage
      });
    }
  },

  render () {
    return (
      <img
        className={this.props.className}
        src={this.props.src}
        alt={this.props.alt}
        onLoad={this.props.handleLoad}
        onError={this.props.handleLoadError || this.handleLoadError}
      />
    );
  }
});
