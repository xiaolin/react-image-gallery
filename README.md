React Carousel Image Gallery
===

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-image-gallery.svg?style=flat)](http://www.npmjs.com/package/react-image-gallery)

## Live Demo (try it on mobile for swipe support)
Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

![demo gif](https://github.com/xiaolin/react-image-gallery/raw/master/static/image_gallery.gif)

React image gallery is a React component for building image galleries and carousels

Features of `react-image-gallery`
* Mobile Swipe Gestures
* Thumbnail Navigation
* Fullscreen Support
* Custom Rendered Slides
* Responsive Design
* Tons of customization options (see props below)
* Lightweight ~8kb (gzipped, excluding react)

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
      <ImageGallery items={images} />
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
    * `renderItem` - Function for custom renderer (see renderItem below)
    * `renderThumbInner` - Function for custom thumbnail renderer (see renderThumbInner below)
    * `originalAlt` - image alt
    * `thumbnailAlt` - thumbnail image alt
    * `originalTitle` - image title
    * `thumbnailTitle` - thumbnail image title
    * `thumbnailLabel` - label for thumbnail
    * `description` - description for image
    * `imageSet` - array of `<source>` using `<picture>` element (see [`app.js`](https://github.com/xiaolin/react-image-gallery/blob/master/example/app.js) for example)
    * `srcSet` - image srcset (html5 attribute)
    * `sizes` - image sizes (html5 attribute)
    * `bulletClass` - extra class for the bullet of the item
    * `bulletOnClick` - `callback({item, itemIndex, currentIndex})`
        * A function that will be called upon bullet click.
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
* `useTranslate3D`: Boolean, default `true`
  * if false, will use `translate` instead of `translate3d` css property to transition slides
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
* `slideDuration`: Number, default `450`
  * transition duration during image slide in milliseconds
* `swipingTransitionDuration`: Number, default `0`
  * transition duration while swiping in milliseconds
* `slideInterval`: Number, default `3000`
* `flickThreshold`: Number (float), default `0.4`
  * Determines the max velocity of a swipe before it's considered a flick (lower = more sensitive)
* `swipeThreshold`: Number, default `30`
  * A percentage of how far the offset of the current slide is swiped to trigger a slide event.
    e.g. If the current slide is swiped less than 30% to the left or right, it will not trigger a slide event.
* `stopPropagation`: Boolean, default `false`
    * Automatically calls stopPropagation on all 'swipe' events.
* `preventDefaultTouchmoveEvent`: Boolean, default `false`
    * An option to prevent the browser's touchmove event (stops the gallery from scrolling up or down when swiping)
* `startIndex`: Number, default `0`
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
* `onTouchMove`: Function, `callback(event) on gallery slide`
* `onTouchEnd`: Function, `callback(event) on gallery slide`
* `onTouchStart`: Function, `callback(event) on gallery slide`
* `onMouseOver`: Function, `callback(event) on gallery slide`
* `onMouseLeave`: Function, `callback(event) on gallery slide`
* `additionalClass`: String,
    * Additional class that will be added to the root node of the component.
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
