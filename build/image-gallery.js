(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ImageGallery = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ImageGallery = React.createClass({

  mixins: [PureRenderMixin],

  displayName: 'ImageGallery',

  propTypes: {
    items: React.PropTypes.array.isRequired,
    showThumbnails: React.PropTypes.bool,
    showBullets: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      showThumbnails: true,
      showBullets: false
    }
  },

  getInitialState: function() {
    return {
      currentIndex: 0,
      thumbnailTranslateX: 0,
      containerWidth: 0
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.containerWidth != this.state.containerWidth) {
      // indexDifference should always be 1 unless its the initial index
      var indexDifference = this.state.currentIndex > 0 ? 1 : 0;

      // when the container resizes, thumbnailTranslateX
      // should always be negative (moving right),
      // if container fits all thumbnails its set to 0
      this.setState({
        thumbnailTranslateX: -this._getScrollX(indexDifference) * this.state.currentIndex
      });
    }

    if (prevState.currentIndex != this.state.currentIndex) {
      var indexDifference = Math.abs(prevState.currentIndex - this.state.currentIndex);
      var scrollX = this._getScrollX(indexDifference);
      if (scrollX > 0) {
        if (prevState.currentIndex < this.state.currentIndex) {
          this.setState({thumbnailTranslateX: this.state.thumbnailTranslateX - scrollX});
        } else if (prevState.currentIndex > this.state.currentIndex) {
          this.setState({thumbnailTranslateX: this.state.thumbnailTranslateX + scrollX});
        }
      }
    }

  },

  componentDidMount: function() {
    this.setState({containerWidth: this.getDOMNode().offsetWidth});
    window.addEventListener("resize", this._handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener("resize", this._handleResize);
  },

  slideToIndex: function(index) {
    var slideCount = this.props.items.length - 1;

    if (index < 0) {
      this.setState({currentIndex: slideCount});
    } else if (index > slideCount) {
      this.setState({currentIndex: 0});
    } else {
      this.setState({currentIndex: index});
    }
  },

  _handleResize: function() {
    this.setState({containerWidth: this.getDOMNode().offsetWidth});
  },

  _getScrollX: function(indexDifference) {
    if (this.refs.thumbnails) {
      var thumbNode = this.refs.thumbnails.getDOMNode();
      if (thumbNode.scrollWidth <= this.state.containerWidth) {
        return 0;
      }
      var totalThumbnails = thumbNode.children.length;

      // total scroll-x required to see the last thumbnail
      var totalScrollX = thumbNode.scrollWidth - this.state.containerWidth;

      // scroll-x required per index change
      var perIndexScrollX = totalScrollX / (totalThumbnails - 1);

      return indexDifference * perIndexScrollX;
    }
  },

  render: function() {
    var currentIndex = this.state.currentIndex;
    var ThumbnailStyle = {
      MozTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      WebkitTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      OTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      msTransform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)',
      transform: 'translate3d(' + this.state.thumbnailTranslateX + 'px, 0, 0)'
    };

    return (
      React.createElement("section", {className: "ImageGallery"}, 
        React.createElement("div", {className: "ImageGallery_content"}, 

          React.createElement("a", {className: "ImageGallery_content_left_nav", 
            onClick: this.slideToIndex.bind(this, currentIndex - 1)}), 


          React.createElement("a", {className: "ImageGallery_content_right_nav", 
            onClick: this.slideToIndex.bind(this, currentIndex + 1)}), 

          React.createElement("div", {className: "ImageGallery_content_slides"}, 
            
              this.props.items.map(function(item, index) {

              var alignment = '';
              switch (index) {
                case (currentIndex - 1):
                  alignment = 'left';
                  break;

                case (currentIndex):
                  alignment = 'center';
                  break;

                case (currentIndex + 1):
                  alignment = 'right';
                  break;
              }

                return (
                  React.createElement("div", {
                    key: index, 
                    className: 'ImageGallery_content_slides_slide ' + alignment}, 
                    React.createElement("img", {src: item.original})
                  )
                );
              }, this)
            
          ), 

          
            this.props.showBullets &&
              React.createElement("div", {className: "ImageGallery_bullet_container"}, 
                React.createElement("ul", {className: "ImageGallery_bullet_container_bullets"}, 
                  
                    this.props.items.map(function(item, index) {
                      return (
                        React.createElement("li", {
                          key: index, 
                          className: 'ImageGallery_bullet_container_bullets_bullet ' + (currentIndex === index ? 'active' : ''), 
                          onClick: this.slideToIndex.bind(this, index)}
                        )
                      );
                    }, this)
                  
                )
              )
          
        ), 

        
          this.props.showThumbnails &&
            React.createElement("div", {className: "ImageGallery_thumbnail_container"}, 
              React.createElement("div", {
                ref: "thumbnails", 
                className: "ImageGallery_thumbnail_container_thumbnails", 
                style: ThumbnailStyle}, 
                
                  this.props.items.map(function(item, index) {
                    return (
                      React.createElement("a", {
                        key: index, 
                        className: 'ImageGallery_thumbnail_container_thumbnails_thumbnail ' + (currentIndex === index ? 'active' : ''), 
                        onClick: this.slideToIndex.bind(this, index)}, 
                        React.createElement("img", {src: item.thumbnail})
                      )
                    );
                  }, this)
                
              )
            )
        
      )
    );

  }

});

module.exports = ImageGallery;


},{"react":"react","react/addons":"react/addons"}]},{},[1])(1)
});