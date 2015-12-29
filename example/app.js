'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import ImageGallery from '../src/ImageGallery.react';

const App = React.createClass({

  mixins: [LinkedStateMixin],

  getInitialState() {
    return {
      isPlaying: false,
      slideInterval: 4000,
      showThumbnails: true,
      showIndex: false,
      showNav: true,
      showBullets: true
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.slideInterval !== prevState.slideInterval) {
      // refresh setInterval
      this._pauseSlider();
      this._playSlider();
    }
  },

  _pauseSlider() {
    if (this._imageGallery) {
      this._imageGallery.pause();
      this.setState({isPlaying: false});
    }
  },

  _playSlider() {
    if (this._imageGallery) {
      this._imageGallery.play();
      this.setState({isPlaying: true});
    }
  },

  render() {
    const images = [
      {
        original: 'http://lorempixel.com/1000/600/nature/1/',
        thumbnail: 'http://lorempixel.com/250/150/nature/1/',
        originalClass: 'featured-slide',
        thumbnailClass: 'featured-thumb',
        description: 'Custom class for slides & thumbnails'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/2/',
        thumbnail: 'http://lorempixel.com/250/150/nature/2/',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing...'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/3/',
        thumbnail: 'http://lorempixel.com/250/150/nature/3/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/4/',
        thumbnail: 'http://lorempixel.com/250/150/nature/4/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/5/',
        thumbnail: 'http://lorempixel.com/250/150/nature/5/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/6/',
        thumbnail: 'http://lorempixel.com/250/150/nature/6/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/7/',
        thumbnail: 'http://lorempixel.com/250/150/nature/7/'
      }
    ];

    return (

      <section className='app'>
        <ImageGallery
          ref={(i) => this._imageGallery = i}
          items={images}
          lazyLoad={false}
          showBullets={this.state.showBullets}
          showThumbnails={this.state.showThumbnails}
          showIndex={this.state.showIndex}
          showNav={this.state.showNav}
          slideInterval={parseInt(this.state.slideInterval)}
          autoPlay={this.state.isPlaying}
        />

        <div className='app-sandbox'>

          <h2> Playground </h2>

          <ul>
            <li>
              <a
                className={'app-button ' + (this.state.isPlaying ? 'active' : '')}
                onClick={this._playSlider}>
                Play
              </a>
            </li>
            <li>
            <a
              className={'app-button ' + (!this.state.isPlaying ? 'active' : '')}
              onClick={this._pauseSlider}>
              Pause
            </a>
            </li>
            <li>
              <div>Slide interval</div>
              <input
                type='text'
                placeholder='SlideInterval'
                valueLink={this.linkState('slideInterval')}/>
            </li>
            <li>
              <input
                type='checkbox'
                checkedLink={this.linkState('showBullets')}/>
                show bullets?
            </li>
            <li>
              <input
                type='checkbox'
                checkedLink={this.linkState('showThumbnails')}/>
                show Thumbnails?
            </li>
            <li>
              <input
                type='checkbox'
                checkedLink={this.linkState('showNav')}/>
                show Navigation?
            </li>
            <li>
              <input
                type='checkbox'
                checkedLink={this.linkState('showIndex')}/>
                show Index?
            </li>
          </ul>

        </div>
      </section>
    );
  }

});


(function() {
  ReactDOM.render(<App/>, document.getElementById('container'));
})();
