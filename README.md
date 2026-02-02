<div align="center">

# React Image Gallery

**A responsive, customizable image gallery component for React**

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-image-gallery.svg?style=flat)](https://www.npmjs.com/package/react-image-gallery)
[![Bundle size](https://badgen.net/bundlephobia/minzip/react-image-gallery)](https://bundlephobia.com/package/react-image-gallery)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

<br />

### [🚀 View Live Demo](http://linxtion.com/demo/react-image-gallery)

<br />

<video src="https://github.com/xiaolin/react-image-gallery/raw/master/static/ig-demo.mp4" autoplay loop muted playsinline></video>

</div>

---

## ✨ Features

| Feature              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| 📱 **Mobile Swipe**  | Native touch gestures for smooth mobile navigation        |
| 🖼️ **Thumbnails**    | Customizable thumbnail navigation with multiple positions |
| 📺 **Fullscreen**    | Browser fullscreen or CSS-based fullscreen modes          |
| 🎨 **Theming**       | CSS custom properties for easy styling                    |
| ⌨️ **Keyboard Nav**  | Arrow keys, escape, and custom key bindings               |
| 🔄 **RTL Support**   | Right-to-left language support                            |
| ↕️ **Vertical Mode** | Slide vertically instead of horizontally                  |
| 🎬 **Custom Slides** | Render videos, iframes, or any custom content             |

---

## 🚀 Getting started

React Image Gallery requires **React 16.0.0 or later.**

```
npm install react-image-gallery
```

### Zero-config (Recommended)

Styles are automatically injected when you import the component. No separate CSS import required!

```js
import ImageGallery from "react-image-gallery";

// That's it! Styles are automatically injected.
```

### Manual style import (Optional)

If you prefer to manage styles yourself (for customization, bundling optimization, or to prevent auto-injection):

```css
/* CSS @import */
@import "~react-image-gallery/styles/image-gallery.css";
```

```js
// JS import (using webpack or similar bundler)
import "react-image-gallery/styles/image-gallery.css";
```

Note: If you import the CSS manually, it will be detected and auto-injection will be skipped.

### 🎨 Theming with CSS Custom Properties

Customize the gallery appearance by overriding CSS custom properties:

```css
/* In your CSS or styled component */
.image-gallery {
  --ig-primary-color: #ff6b6b; /* Primary/accent color */
  --ig-white: #ffffff; /* Icon and text color */
  --ig-black: #000000; /* Background color in fullscreen */
  --ig-background-overlay: rgba(0, 0, 0, 0.5); /* Overlay background */
  --ig-thumbnail-size: 120px; /* Thumbnail dimensions */
  --ig-thumbnail-border-width: 3px; /* Thumbnail border width */
}
```

Or apply globally:

```css
:root {
  --ig-primary-color: #e91e63;
}
```

### 📖 Example

Need more examples? See [`example/App.jsx`](https://github.com/xiaolin/react-image-gallery/blob/master/example/App.jsx)

```js
import ImageGallery from "react-image-gallery";

const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

function MyGallery() {
  return <ImageGallery items={images} />;
}
```

---

## ⚙️ Props

- `items`: (required) Array of objects, see example above,
  - Available Properties
    - `original` - image src url
    - `thumbnail` - image thumbnail src url
    - `fullscreen` - image for fullscreen (defaults to original)
    - `originalHeight` - image height (html5 attribute)
    - `originalWidth` - image width (html5 attribute)
    - `loading` - image loading. Either "lazy" or "eager" (html5 attribute)
    - `thumbnailHeight` - image height (html5 attribute)
    - `thumbnailWidth` - image width (html5 attribute)
    - `thumbnailLoading` - image loading. Either "lazy" or "eager" (html5 attribute)
    - `originalClass` - custom image class
    - `thumbnailClass` - custom thumbnail class
    - `renderItem` - Function for custom rendering a specific slide (see renderItem below)
    - `renderThumbInner` - Function for custom thumbnail renderer (see renderThumbInner below)
    - `originalAlt` - image alt
    - `thumbnailAlt` - thumbnail image alt
    - `originalTitle` - image title
    - `thumbnailTitle` - thumbnail image title
    - `thumbnailLabel` - label for thumbnail
    - `description` - description for image
    - `srcSet` - image srcset (html5 attribute)
    - `sizes` - image sizes (html5 attribute)
    - `bulletClass` - extra class for the bullet of the item
- `infinite`: Boolean, default `true`
  - infinite sliding
- `lazyLoad`: Boolean, default `false`
- `showNav`: Boolean, default `true`
- `showThumbnails`: Boolean, default `true`
- `thumbnailPosition`: String, default `bottom`
  - available positions: `top, right, bottom, left`
- `showFullscreenButton`: Boolean, default `true`
- `useBrowserFullscreen`: Boolean, default `true`
  - if false, fullscreen will be done via css within the browser
- `useTranslate3D`: Boolean, default `true`
  - if false, will use `translate` instead of `translate3d` css property to transition slides
- `showPlayButton`: Boolean, default `true`
- `isRTL`: Boolean, default `false`
  - if true, gallery's direction will be from right-to-left (to support right-to-left languages)
- `showBullets`: Boolean, default `false`
- `maxBullets`: Number, default `undefined`
  - Maximum number of bullets to show at once. Active bullet stays centered while bullets slide. Minimum value is 3.
- `showIndex`: Boolean, default `false`
- `autoPlay`: Boolean, default `false`
- `disableThumbnailScroll`: Boolean, default `false`
  - disables the thumbnail container from adjusting
- `disableKeyDown`: Boolean, default `false`
  - disables keydown listener for keyboard shortcuts (left arrow, right arrow, esc key)
- `disableSwipe`: Boolean, default `false`
- `disableThumbnailSwipe`: Boolean, default `false`
- `onErrorImageURL`: String, default `undefined`
  - an image src pointing to your default image if an image fails to load
  - handles both slide image, and thumbnail image
- `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
- `slideDuration`: Number, default `550`
  - transition duration during image slide in milliseconds
- `swipingTransitionDuration`: Number, default `0`
  - transition duration while swiping in milliseconds
- `slideInterval`: Number, default `3000`
- `slideOnThumbnailOver`: Boolean, default `false`
- `slideVertically`: Boolean, default `false`
  - if true, slides will transition vertically instead of horizontally
- `flickThreshold`: Number (float), default `0.4`
  - Determines the max velocity of a swipe before it's considered a flick (lower = more sensitive)
- `swipeThreshold`: Number, default `30`
  - A percentage of how far the offset of the current slide is swiped to trigger a slide event.
    e.g. If the current slide is swiped less than 30% to the left or right, it will not trigger a slide event.
- `stopPropagation`: Boolean, default `false`
  - Automatically calls stopPropagation on all 'swipe' events.
- `startIndex`: Number, default `0`
- `onImageError`: Function, `callback(event)`
  - overrides onErrorImage
- `onThumbnailError`: Function, `callback(event)`
  - overrides onErrorImage
- `onThumbnailClick`: Function, `callback(event, index)`
- `onBulletClick`: Function, `callback(event, index)`
- `onImageLoad`: Function, `callback(event)`
- `onSlide`: Function, `callback(currentIndex)`
- `onBeforeSlide`: Function, `callback(nextIndex)`
- `onScreenChange`: Function, `callback(boolean)`
  - When fullscreen is toggled a boolean is passed to the callback
- `onPause`: Function, `callback(currentIndex)`
- `onPlay`: Function, `callback(currentIndex)`
- `onClick`: Function, `callback(event)`
- `onTouchMove`: Function, `callback(event) on gallery slide`
- `onTouchEnd`: Function, `callback(event) on gallery slide`
- `onTouchStart`: Function, `callback(event) on gallery slide`
- `onMouseOver`: Function, `callback(event) on gallery slide`
- `onMouseLeave`: Function, `callback(event) on gallery slide`
- `additionalClass`: String,
  - Additional class that will be added to the root node of the component.
- `renderCustomControls`: Function, custom controls rendering
  - Use this to render custom controls or other elements on the currently displayed image (like the fullscreen button)
  ```javascript
    _renderCustomControls() {
      return <a href='' className='image-gallery-custom-action' onClick={this._customAction.bind(this)}/>
    }
  ```
- `renderItem`: Function, custom item rendering
  - NOTE: Highly suggest looking into a render cache such as React.memo if you plan to override renderItem
  - On a specific item `[{thumbnail: '...', renderItem: this.myRenderItem}]`
  - As a prop passed into `ImageGallery` to completely override `renderItem`, see source for renderItem implementation
- `renderThumbInner`: Function, custom thumbnail rendering

  - On a specific item `[{thumbnail: '...', renderThumbInner: this.myRenderThumbInner}]`
  - As a prop passed into `ImageGallery` to completely override `_renderThumbInner`, see source for reference

- `renderLeftNav`: Function, custom left nav component
  - See [`<LeftNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/LeftNav.jsx)
  - Use this to render a custom left nav control
  - Args:
    - `onClick` callback that will slide to the previous item
    - `disabled` boolean for when the nav is disabled
  ```javascript
  renderLeftNav: (onClick, disabled) => (
    <LeftNav onClick={onClick} disabled={disabled} />
  );
  ```
- `renderRightNav`: Function, custom right nav component
  - See [`<RightNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/RightNav.jsx)
  - Use this to render a custom right nav control
  - Args:
    - `onClick` callback that will slide to the next item
    - `disabled` boolean for when the nav is disabled
  ```javascript
  renderRightNav: (onClick, disabled) => (
    <RightNav onClick={onClick} disabled={disabled} />
  );
  ```
- `renderTopNav`: Function, custom top nav component (for vertical sliding)
  - See [`<TopNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/TopNav.jsx)
  - Use this to render a custom top nav control when `slideVertically` is true
  - Args:
    - `onClick` callback that will slide to the previous item
    - `disabled` boolean for when the nav is disabled
  ```javascript
  renderTopNav: (onClick, disabled) => (
    <TopNav onClick={onClick} disabled={disabled} />
  );
  ```
- `renderBottomNav`: Function, custom bottom nav component (for vertical sliding)
  - See [`<BottomNav />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/BottomNav.jsx)
  - Use this to render a custom bottom nav control when `slideVertically` is true
  - Args:
    - `onClick` callback that will slide to the next item
    - `disabled` boolean for when the nav is disabled
  ```javascript
  renderBottomNav: (onClick, disabled) => (
    <BottomNav onClick={onClick} disabled={disabled} />
  );
  ```
- `renderPlayPauseButton`: Function, play pause button component
  - See [`<PlayPause />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/PlayPause.jsx)
  - Use this to render a custom play pause button
  - Args:
    - `onClick` callback that will toggle play/pause
    - `isPlaying` boolean for when gallery is playing
  ```javascript
  renderPlayPauseButton: (onClick, isPlaying) => (
    <PlayPause onClick={onClick} isPlaying={isPlaying} />
  );
  ```
- `renderFullscreenButton`: Function, custom fullscreen button component
  - See [`<Fullscreen />`](https://github.com/xiaolin/react-image-gallery/blob/master/src/components/controls/Fullscreen.jsx)
  - Use this to render a custom fullscreen button
  - Args:
    - `onClick` callback that will toggle fullscreen
    - `isFullscreen` argument for when fullscreen is active
  ```javascript
    renderFullscreenButton: (onClick, isFullscreen) => (
      <Fullscreen onClick={onClick} isFullscreen={isFullscreen} />
    ),
  ```
- `useWindowKeyDown`: Boolean, default `true`
  - If `true`, listens to keydown events on window (window.addEventListener)
  - If `false`, listens to keydown events on image gallery element (imageGalleryElement.addEventListener)

---

## 🔧 Functions

The following functions can be accessed using [refs](https://reactjs.org/docs/refs-and-the-dom.html)

- `play()`: plays the slides
- `pause()`: pauses the slides
- `toggleFullScreen()`: toggles full screen
- `slideToIndex(index)`: slides to a specific index
- `getCurrentIndex()`: returns the current index

---

## 🤝 Contributing

Each pull request (PR) should be specific and isolated to the issue you're trying to fix. Please do not stack features, chores, refactors, or enhancements in one PR. Describe your feature/implementation in the PR. If you're unsure whether it's useful or if it involves a major change, please open an issue first and seek feedback.

- Follow eslint provided
- Comment your code
- Write [clean](https://github.com/ryanmcdermott/clean-code-javascript) code

---

## 🛠️ Build the example locally

Requires Node.js >= 18.18

```
git clone https://github.com/xiaolin/react-image-gallery.git
cd react-image-gallery
npm install
npm start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.

---

## 📄 License

MIT © [Xiao Lin](https://github.com/xiaolin)
