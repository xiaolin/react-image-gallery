React Image Gallery
===

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-image-gallery.svg?style=flat)](http://www.npmjs.com/package/react-image-gallery)

## Live Demo (try it on mobile for swipe support)
Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

![demo gif](https://github.com/xiaolin/react-image-gallery/raw/master/static/image_gallery.gif)

React image gallery is a React component for building image galleries and carousels

Features of `react-image-gallery`
* Mobile friendly
* Thumbnail navigation
* Fullscreen support
* Custom rendered slides
* Responsive design

## Getting started

```
npm install react-image-gallery
```

### Style import

```
# SCSS
@import "node_modules/react-image-gallery/styles/scss/image-gallery.scss";

# CSS
@import "node_modules/react-image-gallery/styles/css/image-gallery.css";

# Webpack
import "react-image-gallery/styles/css/image-gallery.css";

# Stylesheet with no icons
node_modules/react-image-gallery/styles/scss/image-gallery-no-icon.scss
node_modules/react-image-gallery/styles/css/image-gallery-no-icon.css
```


### Example
Need more example? See [`example/app.js`](https://github.com/xiaolin/react-image-gallery/blob/master/example/app.js)
```js
import ImageGallery from 'react-image-gallery';

class MyComponent extends React.Component {

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

  render() {

    const images = [
      {
        original: 'http://lorempixel.com/1000/600/nature/1/',
        thumbnail: 'http://lorempixel.com/250/150/nature/1/',
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
      <ImageGallery
        items={images}
        slideInterval={2000}
        onImageLoad={this.handleImageLoad}/>
    );
  }

}
```

# Props

* `items`: (required) Array of objects, see example above,
  * Available Properties
    * `original` - image src url
    * `thumbnail` - image thumbnail src url
    * `originalClass` - custom image class
    * `thumbnailClass` - custom thumbnail class
    * `originalAlt` - image alt
    * `thumbnailAlt` - thumbnail image alt
    * `originalTitle` - image title
    * `thumbnailTitle` - thumbnail image title
    * `thumbnailLabel` - label for thumbnail
    * `description` - description for image
    * `srcSet` - image srcset (html5 attribute)
    * `sizes` - image sizes (html5 attribute)
* `infinite`: Boolean, default `true`
  * infinite sliding
* `lazyLoad`: Boolean, default `false`
* `showNav`: Boolean, default `true`
* `showThumbnails`: Boolean, default `true`
* `thumbnailPosition`: String, default `bottom`
  * available positions: `top, right, bottom, left`
* `showFullscreenButton`: Boolean, default `true`
* `useBrowserFullscreen`: Boolean, default `true`
  * if false, fullscreen will be done via css within the browser
* `showPlayButton`: Boolean, default `true`
* `showBullets`: Boolean, default `false`
* `showIndex`: Boolean, default `false`
* `autoPlay`: Boolean, default `false`
* `disableThumbnailScroll`: Boolean, default `false`
  * disables the thumbnail container from adjusting
* `slideOnThumbnailHover`: Boolean, default `false`
  * slides to the currently hovered thumbnail
* `disableArrowKeys`: Boolean, default `false`
* `disableSwipe`: Boolean, default `false`
* `defaultImage`: String, default `undefined`
  * an image src pointing to your default image if an image fails to load
  * handles both slide image, and thumbnail image
* `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
* `slideDuration`: Integer, default `450`
  * transition duration during image slide in milliseconds
* `swipingTransitionDuration`: Integer, default `0`
  * transition duration while swiping in milliseconds
* `slideInterval`: Integer, default `3000`
* `startIndex`: Integer, default `0`
* `onImageError`: Function, `callback(event)`
  * overrides defaultImage
* `onThumbnailError`: Function, `callback(event)`
  * overrides defaultImage
* `onThumbnailClick`: Function, `callback(event, index)`
* `onImageLoad`: Function, `callback(event)`
* `onSlide`: Function, `callback(currentIndex)`
* `onScreenChange`: Function, `callback(fullscreenElement)`
* `onPause`: Function, `callback(currentIndex)`
* `onPlay`: Function, `callback(currentIndex)`
* `onClick`: Function, `callback(event)`
* `onTouchMove`: Function, `callback(event)`
* `onTouchEnd`: Function, `callback(event)`
* `onTouchStart`: Function, `callback(event)`
* `renderCustomControls`: Function, custom controls rendering
  * Use this to render custom controls or other elements on the currently displayed image (like the fullscreen button)
  ```javascript
    _renderCustomControls() {
      return <a href='' className='image-gallery-custom-action' onClick={this._customAction.bind(this)}/>
    }
  ```
* `renderItem`: Function, custom item rendering
  * On a specific item `[{thumbnail: '...', renderItem: this.myRenderItem}]`
  or
  * As a prop passed into `ImageGallery` to completely override `_renderItem`, see source for reference
* `renderThumbInner`: Function, custom thumbnail rendering
  * On a specific item `[{thumbnail: '...', renderThumbInner: this.myRenderThumbInner}]`
  or
  * As a prop passed into `ImageGallery` to completely override `_renderThumbInner`, see source for reference

* `renderLeftNav`: Function, custom left nav component
  * Use this to render a custom left nav control
  * Passes `onClick` callback that will slide to the previous item and `disabled` argument for when to disable the nav
  ```javascript
    renderLeftNav(onClick, disabled) {
      return (
        <button
          className='image-gallery-custom-left-nav'
          disabled={disabled}
          onClick={onClick}/>
      )
    }
  ```
* `renderRightNav`: Function, custom right nav component
  * Use this to render a custom right nav control
  * Passes `onClick` callback that will slide to the next item and `disabled` argument for when to disable the nav
  ```javascript
    renderRightNav(onClick, disabled) {
      return (
        <button
          className='image-gallery-custom-right-nav'
          disabled={disabled}
          onClick={onClick}/>
      )
    }
  ```
* `renderPlayPauseButton`: Function, play pause button component
  * Use this to render a custom play pause button
  * Passes `onClick` callback that will toggle play/pause and `isPlaying` argument for when gallery is playing
  ```javascript
    renderPlayPauseButton: (onClick, isPlaying) => {
      return (
        <button
          type='button'
          className={
            `image-gallery-play-button${isPlaying ? ' active' : ''}`}
          onClick={onClick}
        />
      );
    }
  ```
* `renderFullscreenButton`: Function, custom fullscreen button component
  * Use this to render a custom fullscreen button
  * Passes `onClick` callback that will toggle fullscreen and `isFullscreen` argument for when fullscreen is active
  ```javascript
    renderFullscreenButton: (onClick, isFullscreen) => {
      return (
        <button
          type='button'
          className={
            `image-gallery-fullscreen-button${isFullscreen ? ' active' : ''}`}
          onClick={onClick}
        />
      );
    },
  ```


# Functions

* `play()`: plays the slides
* `pause()`: pauses the slides
* `fullScreen()`: activates full screen
* `exitFullScreen()`: deactivates full screen
* `slideToIndex(index)`: slides to a specific index
* `getCurrentIndex()`: returns the current index

# Contributing

* Follow eslint provided
* Comment your code
* Describe your feature/implementation in the pullrequest
* Write [clean](https://github.com/ryanmcdermott/clean-code-javascript) code

# Build the example locally

```
git clone https://github.com/xiaolin/react-image-gallery.git
cd react-image-gallery
npm install
npm start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.


# License

MIT
