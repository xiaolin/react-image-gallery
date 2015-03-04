'use strict';

var React = require('react');
var ImageGallery = require('../src/ImageGallery.react');


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
  },
];


(function() {
  React.render(<ImageGallery items={images} showBullets={true}/>, document.getElementById('container'));
})();
