# React Image Gallery

**A responsive, customizable image gallery component for React**

<br />

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)
[![Download Count](http://img.shields.io/npm/dm/react-image-gallery.svg?style=flat)](https://www.npmjs.com/package/react-image-gallery)
[![Bundle size](https://badgen.net/bundlephobia/minzip/react-image-gallery)](https://bundlephobia.com/package/react-image-gallery)
[![CI](https://github.com/xiaolin/react-image-gallery/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaolin/react-image-gallery/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br />

▶️ **[VIEW LIVE DEMO](http://linxtion.com/demo/react-image-gallery)**

<br />

![React Image Gallery Demo](https://github.com/xiaolin/react-image-gallery/raw/master/static/ig-demo.gif)

<br />

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

<br />

## 🚀 Getting Started

```
npm install react-image-gallery
```

```tsx
import { useRef } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";
import type { GalleryItem, ImageGalleryRef } from "react-image-gallery";

const images: GalleryItem[] = [
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
  const galleryRef = useRef<ImageGalleryRef>(null);

  return (
    <ImageGallery
      ref={galleryRef}
      items={images}
      onSlide={(index) => console.log("Slid to", index)}
    />
  );
}
```

For more examples, see [`example/App.jsx`](https://github.com/xiaolin/react-image-gallery/blob/master/example/App.jsx)

<br />

## ⚙️ Props

- `items`: (required) Array of objects. Available properties:
  - `original` - image source URL
  - `thumbnail` - thumbnail source URL
  - `fullscreen` - fullscreen image URL (defaults to original)
  - `originalHeight` - image height (html5 attribute)
  - `originalWidth` - image width (html5 attribute)
  - `loading` - "lazy" or "eager" (HTML5 attribute)
  - `thumbnailHeight` - image height (html5 attribute)
  - `thumbnailWidth` - image width (html5 attribute)
  - `thumbnailLoading` - "lazy" or "eager" (HTML5 attribute)
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
- `infinite`: Boolean, default `true` - loop infinitely
- `lazyLoad`: Boolean, default `false`
- `showNav`: Boolean, default `true`
- `showThumbnails`: Boolean, default `true`
- `thumbnailPosition`: String, default `bottom` - options: `top`, `right`, `bottom`, `left`
- `showFullscreenButton`: Boolean, default `true`
- `useBrowserFullscreen`: Boolean, default `true` - if false, uses CSS-based fullscreen
- `useTranslate3D`: Boolean, default `true` - if false, uses `translate` instead of `translate3d`
- `showPlayButton`: Boolean, default `true`
- `isRTL`: Boolean, default `false` - right-to-left mode
- `showBullets`: Boolean, default `false`
- `maxBullets`: Number, default `undefined` - max bullets shown (minimum 3, active bullet stays centered)
- `showIndex`: Boolean, default `false`
- `autoPlay`: Boolean, default `false`
- `disableThumbnailScroll`: Boolean, default `false` - disable thumbnail auto-scroll
- `disableKeyDown`: Boolean, default `false` - disable keyboard navigation
- `disableSwipe`: Boolean, default `false`
- `disableThumbnailSwipe`: Boolean, default `false`
- `onErrorImageURL`: String, default `undefined` - fallback image URL for failed loads
- `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
- `slideDuration`: Number, default `550` - slide transition duration (ms)
- `swipingTransitionDuration`: Number, default `0` - transition duration while swiping (ms)
- `slideInterval`: Number, default `3000`
- `slideOnThumbnailOver`: Boolean, default `false`
- `slideVertically`: Boolean, default `false` - slide vertically instead of horizontally
- `flickThreshold`: Number, default `0.4` - swipe velocity threshold (lower = more sensitive)
- `swipeThreshold`: Number, default `30` - percentage of slide width needed to trigger navigation
- `stopPropagation`: Boolean, default `false` - call stopPropagation on swipe events
- `startIndex`: Number, default `0`
- `onImageError`: Function, `callback(event)` - overrides `onErrorImageURL`
- `onThumbnailError`: Function, `callback(event)` - overrides `onErrorImageURL`
- `onThumbnailClick`: Function, `callback(event, index)`
- `onBulletClick`: Function, `callback(event, index)`
- `onImageLoad`: Function, `callback(event)`
- `onSlide`: Function, `callback(currentIndex)`
- `onBeforeSlide`: Function, `callback(nextIndex)`
- `onScreenChange`: Function, `callback(isFullscreen)`
- `onPause`: Function, `callback(currentIndex)`
- `onPlay`: Function, `callback(currentIndex)`
- `onClick`: Function, `callback(event)`
- `onTouchMove`: Function, `callback(event) on gallery slide`
- `onTouchEnd`: Function, `callback(event) on gallery slide`
- `onTouchStart`: Function, `callback(event) on gallery slide`
- `onMouseOver`: Function, `callback(event) on gallery slide`
- `onMouseLeave`: Function, `callback(event) on gallery slide`
- `additionalClass`: String, additional class for the root node
- `renderCustomControls`: Function, render custom controls on the current slide
- `renderItem`: Function, custom slide rendering
- `renderThumbInner`: Function, custom thumbnail rendering
- `renderLeftNav`: Function, custom left nav component
- `renderRightNav`: Function, custom right nav component
- `renderTopNav`: Function, custom top nav component (vertical mode)
- `renderBottomNav`: Function, custom bottom nav component (vertical mode)
- `renderPlayPauseButton`: Function, custom play/pause button
- `renderFullscreenButton`: Function, custom fullscreen button
- `useWindowKeyDown`: Boolean, default `true` - use window or element for key events

<br />

## 🔧 Functions

The following functions can be accessed using [refs](https://reactjs.org/docs/refs-and-the-dom.html)

- `play()`: starts the slideshow
- `pause()`: pauses the slideshow
- `togglePlay()`: toggles between play and pause
- `fullScreen()`: enters fullscreen mode
- `exitFullScreen()`: exits fullscreen mode
- `toggleFullScreen()`: toggles fullscreen mode
- `slideToIndex(index)`: slides to a specific index
- `getCurrentIndex()`: returns the current index

<br />

## 🤝 Contributing

Pull requests should be focused on a single issue. If you're unsure whether a change is useful or involves a major modification, please open an issue first.

- Follow the eslint config
- Comment your code

<br />

## 🛠️ Build the example locally

Requires Node.js >= 18.18

```
git clone https://github.com/xiaolin/react-image-gallery.git
cd react-image-gallery
npm install
npm start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.

<br />

## 📄 License

MIT © [Xiao Lin](https://github.com/xiaolin)
