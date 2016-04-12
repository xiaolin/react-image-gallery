React Image Gallery
===

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-swipe.svg?style=flat)](http://www.npmjs.com/package/react-image-gallery)

![http://i.imgur.com/bxa4s9f.gif](http://i.imgur.com/bxa4s9f.gif)

React image gallery is a React component for building image gallery and carousels

Features of `react-image-gallery`
* Mobile friendly
* Thumbnail navigation
* Responsive design

## Demo & Examples
Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

## Getting started

```
npm install react-image-gallery
```

### SASS

```
@import "../node_modules/react-image-gallery/src/image-gallery";
```

### CSS

```
build/image-gallery.css
```

### EXAMPLE
Need more example? See example/app.js
```js
import ImageGallery from 'react-image-gallery';

class MyComponent extends React.Component {

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

  handlePlay() {
    this._imageGallery.play()
  }

  handlePause() {
    this._imageGallery.pause()
  }

  render() {

    const images = [
      {
        original: 'http://lorempixel.com/1000/600/nature/1/',
        thumbnail: 'http://lorempixel.com/250/150/nature/1/',
        originalClass: 'featured-slide',
        thumbnailClass: 'featured-thumb',
        originalAlt: 'original-alt',
        thumbnailAlt: 'thumbnail-alt',
        description: 'Optional description...'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/2/',
        thumbnail: 'http://lorempixel.com/250/150/nature/2/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/3/',
        thumbnail: 'http://lorempixel.com/250/150/nature/3/'
      }
    ]

    return (
      <div>
        <button onClick={this.handlePlay.bind(this)}>Play</button>
        <button onClick={this.handlePause.bind(this)}>Pause</button>
        <ImageGallery
          ref={i => this._imageGallery = i}
          items={images}
          slideInterval={2000}
          handleImageLoad={this.handleImageLoad}/>
      </div>
    );
  }

}
```

# Props

* `items`: (required) Array of objects, see example above,
* `infinite`: Boolean, default `true`
  * infinite sliding
* `lazyLoad`: Boolean, default `false`
* `showNav`: Boolean, default `true`
* `showThumbnails`: Boolean, default `true`
* `showBullets`: Boolean, default `false`
* `showIndex`: Boolean, default `false`
* `autoPlay`: Boolean, default `false`
* `disableThumbnailScroll`: Boolean, default `false`
  * disables the thumbnail container from adjusting
* `slideOnThumbnailHover`: Boolean, default `false`
  * slides to the currently hovered thumbnail
* `defaultImage`: String, default `undefined`
  * an image src pointing to your default image if an image fails to load
* `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
* `slideInterval`: Integer, default `4000`
* `startIndex`: Integer, default `0`
* `onImageLoad`: Function, `callback(event)`
* `onSlide`: Function, `callback(currentIndex)`
* `onPause`: Function, `callback(currentIndex)`
* `onPlay`: Function, `callback(currentIndex)`
* `onClick`: Function, `callback(event)`


# functions

* `play()`: continuous plays if image is not hovered.
* `pause()`: pauses the slides.
* `slideToIndex(index)`: slide to a specific index.

# Notes

* Feel free to contribute and or provide feedback!

# To build the example locally

```
git clone https://github.com/xiaolin/react-image-gallery.git
npm install
npm start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.


# License

MIT
