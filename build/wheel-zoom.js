"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @class JcWheelZoom
 * @param {selector} selector
 * @param {Object} [options]
 * @constructor
 */
function JcWheelZoom(selector, options) {
  for (var fn in this) {
    if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
      this[fn] = this[fn].bind(this);
    }
  }

  var defaults = {
    // drag scrollable image
    dragScrollable: true,
    // maximum allowed proportion of scale
    maxScale: 1,
    // image resizing speed
    speed: 10
  };

  this.image = document.querySelector(selector);
  this.options = _extend(defaults, options);

  if (this.image !== null) {
    // for window take just the parent
    this.window = this.image.parentNode;
    if (("" + this.window.className).replace(/[\n\t]/g, " ").indexOf("_image-gallery-image-wrapper") > -1) {
      this.container = this.window;
      this.window = this.container.parentNode;
    }

    // if the image has already been loaded
    if (this.image.complete) {
      this._init();
    } else {
      // if suddenly the image has not loaded yet, then wait
      this.image.onload = this._init;
    }
  }
}

JcWheelZoom.prototype = {
  constructor: JcWheelZoom,
  image: null,
  container: null,
  window: null,
  original: { image: {}, window: {} },
  options: null,
  correctX: null,
  correctY: null,
  /**
   * @private
   */
  _init: function _init() {
    // original image sizes
    this.original.image = {
      width: this.image.offsetWidth,
      height: this.image.offsetHeight
    };

    // will move this container, and will center the image in it
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = '_image-gallery-image-wrapper';
      this.container.style.display = "flex";
      this.container.style.justifyContent = "center";

      this.window.appendChild(this.container);
      this.container.appendChild(this.image);
    }

    this._prepare();

    if (this.options.dragScrollable === true) {
      new DragScrollable(this.window);
    }

    this.window.addEventListener("wheel", this._rescale);

    window.addEventListener("resize", this._rescale);
  },
  /**
   * @private
   */
  _prepare: function _prepare() {
    // original window sizes
    this.original.window = {
      width: this.window.offsetWidth,
      height: this.window.offsetHeight
    };

    // minimum allowed proportion of scale
    var minScale = Math.min(this.original.window.width / this.original.image.width, this.original.window.height / this.original.image.height);

    // calculate margin-left and margin-top to center the image
    this.correctX = Math.max(0, (this.original.window.width - this.original.image.width * minScale) / 2);
    this.correctY = Math.max(0, (this.original.window.height - this.original.image.height * minScale) / 2);

    // set new image dimensions to fit it into the container
    this.image.width = this.original.image.width * minScale;
    this.image.height = this.original.image.height * minScale;

    // center the image
    // this.image.style.marginLeft = `${this.correctX}px`;
    // this.image.style.marginTop = `${this.correctY}px`;

    this.container.style.width = this.image.width + this.correctX * 2 + "px";
    this.container.style.height = this.image.height + this.correctY * 2 + "px";

    if (typeof this.options.prepare === "function") {
      this.options.prepare(minScale, this.correctX, this.correctY);
    }
  },
  /**
   * @private
   */
  _rescale: function _rescale(event) {
    event.preventDefault();

    var delta = event.wheelDelta > 0 || event.detail < 0 || event.deltaY < 0 ? 1 : -1;

    // the size of the image at the moment
    var imageCurrentWidth = this.image.width;
    var imageCurrentHeight = this.image.height;

    // current proportion of scale
    var scale = imageCurrentWidth / this.original.image.width;

    // minimum allowed proportion of scale
    var minScale = Math.min(this.original.window.width / this.original.image.width, this.original.window.height / this.original.image.height);
    // new allowed proportion of scale
    var newScale = scale + delta / this.options.speed;

    newScale = newScale < minScale ? minScale : newScale > this.options.maxScale ? this.options.maxScale : newScale;

    // scroll along the X axis before resizing
    var scrollLeftBeforeRescale = this.window.scrollLeft;
    // scroll along the Y axis before resizing
    var scrollTopBeforeRescale = this.window.scrollTop;

    // new image sizes that will be set
    var imageNewWidth = this.image.width = this.original.image.width * newScale;
    var imageNewHeight = this.image.height = this.original.image.height * newScale;

    var containerNewWidth = imageNewWidth + this.correctX * 2;
    var containerNewHeight = imageNewHeight + this.correctY * 2;

    this.container.style.width = containerNewWidth + "px";
    this.container.style.height = containerNewHeight + "px";

    if (typeof this.options.rescale === "function") {
      this.options.rescale(newScale, this.correctX, this.correctY, minScale);
    }

    // scroll on the X axis after resized
    var scrollLeftAfterRescale = this.window.scrollLeft;
    // scroll on the Y axis after resized
    var scrollTopAfterRescale = this.window.scrollTop;

    var windowCoords = _getCoords(this.window);

    var x = Math.round(event.pageX - windowCoords.left + this.window.scrollLeft - this.correctX);
    var newX = Math.round(imageNewWidth * x / imageCurrentWidth);
    var shiftX = newX - x;

    this.window.scrollLeft += shiftX + (scrollLeftBeforeRescale - scrollLeftAfterRescale);

    var y = Math.round(event.pageY - windowCoords.top + this.window.scrollTop - this.correctY);
    var newY = Math.round(imageNewHeight * y / imageCurrentHeight);
    var shiftY = newY - y;

    this.window.scrollTop += shiftY + (scrollTopBeforeRescale - scrollTopAfterRescale);
  },
  /**
   * @public
   */
  prepare: function prepare() {
    this._prepare();
  },
  /**
   * @public
   */
  zoomUp: function zoomUp() {
    var windowCoords = _getCoords(this.window);

    var event = new Event("mousewheel");

    event.wheelDelta = 1;
    event.detail = -1;
    event.pageX = windowCoords.left + this.original.window.width / 2;
    event.pageY = windowCoords.top + this.original.window.height / 2;

    this._rescale(event);
  },
  /**
   * @public
   */
  zoomDown: function zoomDown() {
    var windowCoords = _getCoords(this.window);

    var event = new Event("mousewheel");

    event.wheelDelta = -1;
    event.detail = 1;
    event.pageX = windowCoords.left + this.original.window.width / 2;
    event.pageY = windowCoords.top + this.original.window.height / 2;

    this._rescale(event);
  },
  resetZoom: function resetZoom() {
    if (this.original.image && this.image) {
      var minScale = Math.min(this.original.window.width / this.original.image.width, this.original.window.height / this.original.image.height);

      // set new image dimensions to fit it into the container
      this.image.width = this.original.image.width * minScale;
      this.image.height = this.original.image.height * minScale;

      this.container.style.height = this.original.window.height + "px";
      this.container.style.width = this.original.window.width + "px";
    }
  }
};

/**
 * Create JcWheelZoom instance
 * @param {selector} selector
 * @param {Object} [options]
 * @returns {JcWheelZoom}
 */
JcWheelZoom.create = function (selector, options) {
  return new JcWheelZoom(selector, options);
};

/**
 * @class DragScrollable
 * @param {Element} scrollable
 * @constructor
 */
function DragScrollable(scrollable) {
  this.mouseUpHandler = this.mouseUpHandler.bind(this);
  this.mouseDownHandler = this.mouseDownHandler.bind(this);
  this.mouseMoveHandler = this.mouseMoveHandler.bind(this);

  this.scrollable = scrollable;
  this.scrollable.addEventListener("mousedown", this.mouseDownHandler);
}

DragScrollable.prototype = {
  scrollable: null,
  coords: null,
  mouseDownHandler: function mouseDownHandler(event) {
    event.preventDefault();

    if (event.which !== 1) {
      return false;
    }

    this.coords = {
      left: event.clientX,
      top: event.clientY
    };

    document.addEventListener("mouseup", this.mouseUpHandler);
    document.addEventListener("mousemove", this.mouseMoveHandler);
  },
  mouseUpHandler: function mouseUpHandler(event) {
    event.preventDefault();

    document.removeEventListener("mouseup", this.mouseUpHandler);
    document.removeEventListener("mousemove", this.mouseMoveHandler);
  },
  mouseMoveHandler: function mouseMoveHandler(event) {
    event.preventDefault();

    this.scrollable.scrollLeft = this.scrollable.scrollLeft - (event.clientX - this.coords.left);
    this.scrollable.scrollTop = this.scrollable.scrollTop - (event.clientY - this.coords.top);

    this.coords = {
      left: event.clientX,
      top: event.clientY
    };
  }
};

/**
 * Get element coordinates (with support old browsers)
 * @param {Element} element
 * @returns {{top: number, left: number}}
 */
function _getCoords(element) {
  var box = element.getBoundingClientRect();

  var _document = document,
      body = _document.body,
      documentElement = _document.documentElement;


  var scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;

  var clientTop = documentElement.clientTop || body.clientTop || 0;
  var clientLeft = documentElement.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: top, left: left };
}

function _extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }

  return dst;
}

exports.default = JcWheelZoom;