React Image Gallery
===

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-image-gallery.svg?style=flat)](https://www.npmjs.com/package/react-image-gallery)
[![Bundle size](https://badgen.net/bundlephobia/minzip/react-image-gallery)](https://bundlephobia.com/package/react-image-gallery)

### Live Demo (try it on mobile for swipe support)
[`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

![demo gif](https://github.com/xiaolin/react-image-gallery/raw/master/static/image_gallery_v1.0.2.gif)

React image gallery is a React component for building image galleries and carousels

## Features

* Mobile swipe gestures
* Thumbnail navigation
* Fullscreen support
* Custom rendered slides
* RTL support
* Responsive design
* Tons of customization options (see props below)

## Getting started

React Image Gallery requires **React 16.0.0 or later.**

```
npm install react-image-gallery
```

### Style import (with webpack)
```
# SCSS
@import "~react-image-gallery/styles/scss/image-gallery.scss";

# CSS
@import "~react-image-gallery/styles/css/image-gallery.css";
```

### Example
Need more example? See [`example/app.js`](https://github.com/xiaolin/react-image-gallery/blob/master/example/app.js)
```js
import ImageGallery from 'react-image-gallery';

const images = [
  {
    original: 'https://picsum.photos/id/1018/1000/600/',
    thumbnail: 'https://picsum.photos/id/1018/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1015/1000/600/',
    thumbnail: 'https://picsum.photos/id/1015/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
];

class MyGallery extends React.Component {
  render() {
    return <ImageGallery items={images} />;
  }
}
```

# Props

* `items`: (required) Array of objects, see example above,
  * Available Properties
    * `original` - image src url
    * `thumbnail` - image thumbnail src url
    * `fullscreen` - image for fullscreen (defaults to original)
    * `originalHeight` - image height (html5 attribute)
    * `originalWidth` - image width (html5 attribute)
    * `loading` - image loading. Either "lazy" or "eager" (html5 attribute)
    * `thumbnailHeight` - image height (html5 attribute)
    * `thumbnailWidth` - image width (html5 attribute)
    * `thumbnailLoading` - image loading. Either "lazy" or "eager" (html5 attribute)
    * `originalClass` - custom image class
    * `thumbnailClass` - custom thumbnail class
    * `renderItem` - Function for custom rendering a specific slide (see renderItem below)
    * `renderThumbInner` - Function for custom thumbnail renderer (see renderThumbInner below)
    * `originalAlt` - image alt
    * `thumbnailAlt` - thumbnail image alt
    * `originalTitle` - image title
    * `thumbnailTitle` - thumbnail image title
    * `thumbnailLabel` - label for thumbnail
    * `description` - description for image
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
* `isRTL`: Boolean, default `false`
  * if true, gallery's direction will be from right-to-left (to support right-to-left languages)
* `showBullets`: Boolean, default `false`
* `showIndex`: Boolean, default `false`
* `autoPlay`: Boolean, default `false`
* `disableThumbnailScroll`: Boolean, default `false`
  * disables the thumbnail container from adjusting
* `disableKeyDown`: Boolean, default `false`
  * disables keydown listener for keyboard shortcuts (left arrow, right arrow, esc key)
* `disableSwipe`: Boolean, default `false`
* `disableThumbnailSwipe`: Boolean, default `false`
* `onErrorImageURL`: String, default `undefined`
  * an image src pointing to your default image if an image fails to load
  * handles both slide image, and thumbnail image
* `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
* `slideDuration`: Number, default `450`
  * transition duration during image slide in milliseconds
* `swipingTransitionDuration`: Number, default `0`
  * transition duration while swiping in milliseconds
* `slideInterval`: Number, default `3000`
* `slideOnThumbnailOver`: Boolean, default `false`
* `flickThreshold`: Number (float), default `0.4`
  * Determines the max velocity of a swipe before it's considered a flick (lower = more sensitive)
* `swipeThreshold`: Number, default `30`
  * A percentage of how far the offset of the current slide is swiped to trigger a slide event.
    e.g. If the current slide is swiped less than 30% to the left or right, it will not trigger a slide event.
* `stopPropagation`: Boolean, default `false`
    * Automatically calls stopPropagation on all 'swipe' events.
* `startIndex`: Number, default `0`
* `onImageError`: Function, `callback(event)`
  * overrides onErrorImage
* `onThumbnailError`: Function, `callback(event)`
  * overrides onErrorImage
* `onThumbnailClick`: Function, `callback(event, index)`
* `onImageLoad`: Function, `callback(event)`
* `onSlide`: Function, `callback(currentIndex)`
* `onBeforeSlide`: Function, `callback(nextIndex)`
* `onScreenChange`: Function, `callback(boolean)`
  * When fullscreen is toggled a boolean is passed to the callback
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
  * NOTE: Highly suggest looking into a render cache such as React.memo if you plan to override renderItem
  * On a specific item `[{thumbnail: '...', renderItem: this.myRenderItem}]`
  * As a prop passed into `ImageGallery` to completely override `renderItem`, see source for renderItem implementation
* `renderThumbInner`: Function, custom thumbnail rendering
  * On a specific item `[{thumbnail: '...', renderThumbInner: this.myRenderThumbInner}]`
  * As a prop passed into `ImageGallery` to completely override `_renderThumbInner`, see source for reference

* `renderLeftNav`: Function, custom left nav component
  * See [`<LeftNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/controls/LeftNav.js)
  * Use this to render a custom left nav control
  * Args:
    * `onClick` callback that will slide to the previous item
    * `disabled` boolean for when the nav is disabled
  ```javascript
    renderLeftNav: (onClick, disabled) => (
      <LeftNav onClick={onClick} disabled={disabled} />
    )
  ```
* `renderRightNav`: Function, custom right nav component
  * See [`<RightNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/controls/RightNav.js)
  * Use this to render a custom right nav control
  * Args:
    * `onClick` callback that will slide to the next item
    * `disabled` boolean for when the nav is disabled
  ```javascript
    renderRightNav: (onClick, disabled) => (
      <RightNav onClick={onClick} disabled={disabled} />
    )
  ```
* `renderPlayPauseButton`: Function, play pause button component
  * See [`<PlayPause />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/controls/PlayPause.js)
  * Use this to render a custom play pause button
  * Args:
    * `onClick` callback that will toggle play/pause
    * `isPlaying` boolean for when gallery is playing
  ```javascript
    renderPlayPauseButton: (onClick, isPlaying) => (
      <PlayPause onClick={onClick} isPlaying={isPlaying} />
    )
  ```
* `renderFullscreenButton`: Function, custom fullscreen button component
  * See [`<Fullscreen />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/controls/Fullscreen.js)
  * Use this to render a custom fullscreen button
  * Args:
    * `onClick` callback that will toggle fullscreen
    * `isFullscreen` argument for when fullscreen is active
  ```javascript
    renderFullscreenButton: (onClick, isFullscreen) => (
      <Fullscreen onClick={onClick} isFullscreen={isFullscreen} />
    ),
  ```
* `useWindowKeyDown`: Boolean, default `true`
  * If `true`, listens to keydown events on window (window.addEventListener)
  * If `false`, listens to keydown events on image gallery element (imageGalleryElement.addEventListener)

# Functions

The following functions can be accessed using [refs](https://reactjs.org/docs/refs-and-the-dom.html)

* `play()`: plays the slides
* `pause()`: pauses the slides
* `toggleFullScreen()`: toggles full screen
* `slideToIndex(index)`: slides to a specific index
* `getCurrentIndex()`: returns the current index

# Contributing

Each PR should be specific and isolated to the issue you're trying to fix. Please do not stack features/chores/refactors/enhancements in one PR. Describe your feature/implementation in the PR. If you're unsure its useful or if it is a major change, please open an issue first and get feedback.

* Follow eslint provided
* Comment your code
* Write [clean](https://github.com/ryanmcdermott/clean-code-javascript) code

# Build the example locally (requires node >= 12.13)

```
git clone https://github.com/xiaolin/react-image-gallery.git
cd react-image-gallery
npm install --global yarn
yarn install
yarn start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.

# License

MIT
