import React from 'react'
import ReactDOM from 'react-dom'

import ImageGallery from '../src/ImageGallery'

class App extends React.Component {

  constructor() {
    super()
    this.state = {
      isPlaying: false,
      showIndex: false,
      slideOnThumbnailHover: false,
      showBullets: true,
      infinite: true,
      showThumbnails: true,
      showNav: true,
      slideInterval: 2000,
      fullscreen: false,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.slideInterval !== prevState.slideInterval) {
      // refresh setInterval
      this._pauseSlider()
      this._playSlider()
    }
  }

  _pauseSlider() {
    this._imageGallery.pause()
    this.setState({isPlaying: false})
  }

  _playSlider() {
    this._imageGallery.play()
    this.setState({isPlaying: true})
  }

  _onImageClick(event) {
    console.debug('clicked on image ', event.target)
  }

  _onImageLoad(event) {
    console.debug('loaded image ', event.target)
  }

  _onSlide(index) {
    console.debug('slid to ', index)
  }

  _onPause(index) {
    console.debug('paused on index ', index)
    this.setState({isPlaying: false})
  }

  _onPlay(index) {
    console.debug('playing from index ', index)
    this.setState({isPlaying: true})
  }

  _handleInputChange(state, event) {
    this.setState({[state]: event.target.value})
  }

  _handleCheckboxChange(state, event) {
    this.setState({[state]: event.target.checked})
  }

  render() {
    const images = [
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/1.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/1t.jpg',
        originalClass: 'featured-slide',
        thumbnailClass: 'featured-thumb',
        description: 'Custom class for slides & thumbnails'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/2.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/2t.jpg',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing...'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/3.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/3t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/4.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/4t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/5.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/5t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/6.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/6t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/7.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/7t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/8.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/8t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/9.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/9t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/10.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/10t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/11.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/11t.jpg'
      },
      {
        original: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/12.jpg',
        thumbnail: 'https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/image-gallery/12t.jpg'
      }
    ]

    return (

      <section className='app'>
        <ImageGallery
          ref={i => this._imageGallery = i}
          items={images}
          lazyLoad={false}
          onClick={this._onImageClick}
          onImageLoad={this._onImageLoad}
          onSlide={this._onSlide}
          onPause={this._onPause.bind(this)}
          onPlay={this._onPlay.bind(this)}
          infinite={this.state.infinite}
          showBullets={this.state.showBullets}
          showThumbnails={this.state.showThumbnails}
          showIndex={this.state.showIndex}
          showNav={this.state.showNav}
          slideInterval={parseInt(this.state.slideInterval)}
          autoPlay={this.state.isPlaying}
          slideOnThumbnailHover={this.state.slideOnThumbnailHover}
          fullscreen={this.state.fullscreen}
        />

        <div className='app-sandbox'>

          <h2 className='app-header'>Prop settings</h2>

          <ul className='app-buttons'>
            <li>
              <a
                className={'app-button ' + (this.state.isPlaying ? 'active' : '')}
                onClick={this._playSlider.bind(this)}>
                Play
              </a>
            </li>
            <li>
            <a
              className={'app-button ' + (!this.state.isPlaying ? 'active' : '')}
              onClick={this._pauseSlider.bind(this)}>
              Pause
            </a>
            </li>
            <li>
              <div className='app-interval-input-group'>
                <span className='app-interval-label'>interval</span>
                <input
                  className='app-interval-input'
                  type='text'
                  onChange={this._handleInputChange.bind(this, 'slideInterval')}
                  value={this.state.slideInterval}/>
              </div>
            </li>
          </ul>

          <ul className='app-checkboxes'>
            <li>
              <input
                id='infinite'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'infinite')}
                checked={this.state.infinite}/>
                <label htmlFor='infinite'>infinite sliding</label>
            </li>
            <li>
              <input
                id='show_bullets'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'showBullets')}
                checked={this.state.showBullets}/>
                <label htmlFor='show_bullets'>show bullets</label>
            </li>
            <li>
              <input
                id='show_thumbnails'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'showThumbnails')}
                checked={this.state.showThumbnails}/>
                <label htmlFor='show_thumbnails'>show thumbnails</label>
            </li>
            <li>
              <input
                id='show_navigation'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'showNav')}
                checked={this.state.showNav}/>
                <label htmlFor='show_navigation'>show navigation</label>
            </li>
            <li>
              <input
                id='show_index'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'showIndex')}
                checked={this.state.showIndex}/>
                <label htmlFor='show_index'>show index</label>
            </li>
            <li>
              <input
                id='slide_on_thumbnail_hover'
                type='checkbox'
                onChange={this._handleCheckboxChange.bind(this, 'slideOnThumbnailHover')}
                checked={this.state.slideOnThumbnailHover}/>
                <label htmlFor='slide_on_thumbnail_hover'>slide on thumbnail hover (desktop)</label>
            </li>
            <li>
              <input
                  id='fullscreen'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'fullscreen')}
                  checked={this.state.fullscreen}/>
              <label htmlFor='infinite'>fullscreen</label>
            </li>
          </ul>

        </div>
      </section>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('container'))

