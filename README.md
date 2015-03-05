# react-image-gallery

Responsive image gallery, slideshow, carousel

## Install

```sh
npm install react-image-gallery
```

## Demo & Examples

Live demo: [`linxtion.com/demo/react-image-gallery`](http://linxtion.com/demo/react-image-gallery)

To build the examples locally, run:

```
npm install
gulp dev
```

Then open [`localhost:8001`](http://localhost:8001) in a browser.


## Use

### SASS

```
@import "../node_modules/react-image-gallery/src/ImageGallery";
```

### CSS

```
<link rel="stylesheet" href="/image-gallery.css"/>
```

### JS

```js
var ImageGallery = require('react-image-gallery');

var images = [
  {
    original: 'http://lorempixel.com/1000/600/nature/1/',
    thumbnail: 'http://lorempixel.com/250/150/nature/1/'
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

render: function() {
  return (
    <ImageGallery items={images}/>
  );
}

```

# Props

* `items`: Array of images,
* `showThumbnails`: Boolean, default true
* `showBullets`: Boolean, default false


# License

MIT
