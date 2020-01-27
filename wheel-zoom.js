"use strict";

(function JcWheelZoomModule(factory) {
  window.JcWheelZoom = factory();
})(function JcWheelZoomFactory() {
  /**
   * @class JcWheelZoom
   * @param {selector} selector
   * @param {Object} [options]
   * @constructor
   */
  function JcWheelZoom(selector, options) {
    for (let fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }

    const defaults = {
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
    _init: function() {
      // original image sizes
      this.original.image = {
        width: this.image.offsetWidth,
        height: this.image.offsetHeight
      };

      // will move this container, and will center the image in it
      this.container = document.createElement("div");

      this.window.appendChild(this.container);
      this.container.appendChild(this.image);

      this._prepare();

      if (this.options.dragScrollable === true) {
        new DragScrollable(this.window);
      }

      this.window.addEventListener("mousewheel", this._rescale);

      window.addEventListener("resize", this._rescale);
    },
    /**
     * @private
     */
    _prepare: function() {
      // original window sizes
      this.original.window = {
        width: this.window.offsetWidth,
        height: this.window.offsetHeight
      };

      // minimum allowed proportion of scale
      const minScale = Math.min(
        this.original.window.width / this.original.image.width,
        this.original.window.height / this.original.image.height
      );

      // calculate margin-left and margin-top to center the image
      this.correctX = Math.max(
        0,
        (this.original.window.width - this.original.image.width * minScale) / 2
      );
      this.correctY = Math.max(
        0,
        (this.original.window.height - this.original.image.height * minScale) /
          2
      );

      // set new image dimensions to fit it into the container
      this.image.width = this.original.image.width * minScale;
      this.image.height = this.original.image.height * minScale;

      // center the image
      this.image.style.marginLeft = `${this.correctX}px`;
      this.image.style.marginTop = `${this.correctY}px`;

      this.container.style.width = `${this.image.width + this.correctX * 2}px`;
      this.container.style.height = `${this.image.height +
        this.correctY * 2}px`;

      if (typeof this.options.prepare === "function") {
        this.options.prepare(minScale, this.correctX, this.correctY);
      }
    },
    /**
     * @private
     */
    _rescale: function(event) {
      event.preventDefault();

      const delta = event.wheelDelta > 0 || event.detail < 0 ? 1 : -1;

      // the size of the image at the moment
      const imageCurrentWidth = this.image.width;
      const imageCurrentHeight = this.image.height;

      // current proportion of scale
      const scale = imageCurrentWidth / this.original.image.width;
      // minimum allowed proportion of scale
      const minScale = Math.min(
        this.original.window.width / this.original.image.width,
        this.original.window.height / this.original.image.height
      );
      // new allowed proportion of scale
      let newScale = scale + delta / this.options.speed;

      newScale =
        newScale < minScale
          ? minScale
          : newScale > this.options.maxScale
          ? this.options.maxScale
          : newScale;

      // scroll along the X axis before resizing
      const scrollLeftBeforeRescale = this.window.scrollLeft;
      // scroll along the Y axis before resizing
      const scrollTopBeforeRescale = this.window.scrollTop;

      // new image sizes that will be set
      const imageNewWidth = (this.image.width =
        this.original.image.width * newScale);
      const imageNewHeight = (this.image.height =
        this.original.image.height * newScale);

      const containerNewWidth = imageNewWidth + this.correctX * 2;
      const containerNewHeight = imageNewHeight + this.correctY * 2;

      this.container.style.width = `${containerNewWidth}px`;
      this.container.style.height = `${containerNewHeight}px`;

      if (typeof this.options.rescale === "function") {
        this.options.rescale(newScale, this.correctX, this.correctY, minScale);
      }

      // scroll on the X axis after resized
      const scrollLeftAfterRescale = this.window.scrollLeft;
      // scroll on the Y axis after resized
      const scrollTopAfterRescale = this.window.scrollTop;

      const windowCoords = _getCoords(this.window);

      const x = Math.round(
        event.pageX - windowCoords.left + this.window.scrollLeft - this.correctX
      );
      const newX = Math.round((imageNewWidth * x) / imageCurrentWidth);
      const shiftX = newX - x;

      this.window.scrollLeft +=
        shiftX + (scrollLeftBeforeRescale - scrollLeftAfterRescale);

      const y = Math.round(
        event.pageY - windowCoords.top + this.window.scrollTop - this.correctY
      );
      const newY = Math.round((imageNewHeight * y) / imageCurrentHeight);
      const shiftY = newY - y;

      this.window.scrollTop +=
        shiftY + (scrollTopBeforeRescale - scrollTopAfterRescale);
    },
    /**
     * @public
     */
    prepare: function() {
      this._prepare();
    },
    /**
     * @public
     */
    zoomUp: function() {
      const windowCoords = _getCoords(this.window);

      const event = new Event("mousewheel");

      event.wheelDelta = 1;
      event.detail = -1;
      event.pageX = windowCoords.left + this.original.window.width / 2;
      event.pageY = windowCoords.top + this.original.window.height / 2;

      this._rescale(event);
    },
    /**
     * @public
     */
    zoomDown: function() {
      const windowCoords = _getCoords(this.window);

      const event = new Event("mousewheel");

      event.wheelDelta = -1;
      event.detail = 1;
      event.pageX = windowCoords.left + this.original.window.width / 2;
      event.pageY = windowCoords.top + this.original.window.height / 2;

      this._rescale(event);
    }
  };

  /**
   * Create JcWheelZoom instance
   * @param {selector} selector
   * @param {Object} [options]
   * @returns {JcWheelZoom}
   */
  JcWheelZoom.create = function(selector, options) {
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
    mouseDownHandler: function(event) {
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
    mouseUpHandler: function(event) {
      event.preventDefault();

      document.removeEventListener("mouseup", this.mouseUpHandler);
      document.removeEventListener("mousemove", this.mouseMoveHandler);
    },
    mouseMoveHandler: function(event) {
      event.preventDefault();

      this.scrollable.scrollLeft =
        this.scrollable.scrollLeft - (event.clientX - this.coords.left);
      this.scrollable.scrollTop =
        this.scrollable.scrollTop - (event.clientY - this.coords.top);

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
    const box = element.getBoundingClientRect();

    const { body, documentElement } = document;

    const scrollTop =
      window.pageYOffset || documentElement.scrollTop || body.scrollTop;
    const scrollLeft =
      window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;

    const clientTop = documentElement.clientTop || body.clientTop || 0;
    const clientLeft = documentElement.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return { top, left };
  }

  function _extend(dst, src) {
    if (dst && src) {
      for (let key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }

    return dst;
  }

  // Export
  return JcWheelZoom;
});
