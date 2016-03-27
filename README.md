React Image Gallery
===

[![npm version](https://badge.fury.io/js/react-image-gallery.svg)](https://badge.fury.io/js/react-image-gallery)

![](https://raw.githubusercontent.com/xiaolin/linxtion.github.io/master/static/img/react-image-gallery.png)

React image gallery is a React component for building image carousels

Features of `react-image-gallery`
* Responsive design
* Thumbnail navigation
* Mobile friendly

## Demo & Examples
Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

## Getting started

```
npm install react-image-gallery
```

Install [react-tab-event-plugin](https://github.com/zilverline/react-tap-event-plugin) and follow the plugin's instruction how to inject the event mechanism.

### SASS

```
@import "../node_modules/react-image-gallery/src/stylesheets/main";
```

### CSS

```
build/main.css
```

### JSX

```js
var ImageGallery = require('react-image-gallery').MainImporter();

var images = [
  {
    original: 'http://lorempixel.com/1000/600/nature/1/',
    thumbnail: 'http://lorempixel.com/250/150/nature/1/',
    originalDefault: 'default-image', // default is used when loading of original file failed
    thumbnailDefault: 'default-thumbnail',
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
];

handleSlide: function(index) {
  console.log('Slid to ' + index);
},

render: function() {
  return (
    <ImageGallery
      items={images}
      autoPlay={true}
      slideInterval={4000}
      onSlide={this.handleSlide}/>
  );
}

```

If you want to override some component pass it to the `MainImporter`, like this:

```javascript
var NewSlideDescription = require('mycomponent');
var ImageGallery = require('react-image-gallery').MainImporter({
  SlideDescription: NewSlideDescription
});
```

There is a catch, however. If a overwritten component contains some dependency, like `Thumbnail` component needs `Image` component, you need to export a function wrapping the component:

```javascript
var ThumbnailImporter = function(Image) {
  return React.creatClass({
    //...
  });
}

var ImageGallery = require('react-image-gallery').MainImporter({
  ThumbnailImporter: ThumbnailImporter
});
```

This allows passing a dependency to your component and you can use, in that case, the `Image` component with no need of providing one by yourself.

# Props

* `items`: (required) Array of objects, see example above,
* `lazyLoad`: Boolean, default `true`
* `showNav`: Boolean, default `true`
* `showThumbnails`: Boolean, default `true`
* `showBullets`: Boolean, default `false`
* `showIndex`: Boolean, default `false`
* `server`: Boolean, default `false`
  * adds `loaded` class to all slide `<img>`
* `autoPlay`: Boolean, default `false`
* `disableThumbnailScroll`: Boolean, default `false`
  * disables the thumbnail container from adjusting
* `slideOnThumbnailHover`: Boolean, default `false`
  * slides to the currently hovered thumbnail
* `indexSeparator`: String, default `' / '`, ignored if `showIndex` is false
* `slideInterval`: Integer, default `4000`
* `startIndex`: Integer, default `0`
* `onSlide`: Function, `callback(index)`


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
npm install react-tab-event-plugin
npm start
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.


# License

MIT
