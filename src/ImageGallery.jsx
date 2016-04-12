import React from 'react'
import Swipeable from 'react-swipeable'

const MIN_INTERVAL = 500

function throttle(func, wait) {
  let context, args, result
  let timeout = null
  let previous = 0

  let later = function() {
    previous = new Date().getTime()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function() {
    let now = new Date().getTime()
    let remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}


export default class ImageGallery extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      currentIndex: props.startIndex,
      thumbsTranslateX: 0,
      offsetPercentage: 0,
      galleryWidth: 0
    }

    this._slideLeft = throttle(this._slideLeft, MIN_INTERVAL, true)
    this._slideRight = throttle(this._slideRight, MIN_INTERVAL, true)
    this._handleResize = this._handleResize.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.galleryWidth !== this.state.galleryWidth ||
        prevProps.showThumbnails !== this.props.showThumbnails) {

      // adjust thumbnail container when window width is adjusted
      this._setThumbsTranslateX(
        -this._getThumbsTranslateX(
          this.state.currentIndex > 0 ? 1 : 0) * this.state.currentIndex)

    }

    if (prevState.currentIndex !== this.state.currentIndex) {
      if (this.props.onSlide) {
        this.props.onSlide(this.state.currentIndex)
      }

      this._updateThumbnailTranslateX(prevState)
    }
  }

  componentWillMount() {
    this._thumbnailDelay = 300
    this._ghotClickDelay = 600
    this._preventGhostClick = false
  }

  componentDidMount() {
    window.setTimeout(() => {this._handleResize(), 300})
    if (this.props.autoPlay) {
      this.play()
    }
    window.addEventListener('keydown', this._handleKeyDown)
    window.addEventListener('resize', this._handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this._handleKeyDown)
    window.removeEventListener('resize', this._handleResize)
    if (this._intervalId) {
      window.clearInterval(this._intervalId)
      this._intervalId = null
    }
  }

  play(callback = true) {
    if (this._intervalId) {
      return
    }
    const {slideInterval} = this.props
    this._intervalId = window.setInterval(() => {
      if (!this.state.hovering) {
        if (!this.props.infinite && !this._canSlideRight()) {
          this.pause()
        } else {
          this.slideToIndex(this.state.currentIndex + 1)
        }
      }
    }, slideInterval > MIN_INTERVAL ? slideInterval : MIN_INTERVAL)

    if (this.props.onPlay && callback) {
      this.props.onPlay(this.state.currentIndex)
    }

  }

  pause(callback = true) {
    if (this._intervalId) {
      window.clearInterval(this._intervalId)
      this._intervalId = null
    }

    if (this.props.onPause && callback) {
      this.props.onPause(this.state.currentIndex)
    }
  }

  slideToIndex(index, event) {
    let slideCount = this.props.items.length - 1
    let currentIndex = index

    if (index < 0) {
      currentIndex = slideCount
    } else if (index > slideCount) {
      currentIndex = 0
    }

    this.setState({
      previousIndex: this.state.currentIndex,
      currentIndex: currentIndex,
      offsetPercentage: 0,
      style: {
        transition: 'transform .45s ease-out'
      }
    })

    if (event) {
      if (this._intervalId) {
        // user event, while playing, reset interval
        this.pause(false)
        this.play(false)
      }
    }
  }

  _wrapClick(func) {
    if (typeof func === 'function') {
      return event => {
        if (this._preventGhostClick === true) {
          return
        }
        func(event)
      }
    }
  }

  _touchEnd() {
    this._preventGhostClick = true
    this._preventGhostClickTimer = window.setTimeout(() => {
      this._preventGhostClick = false
      this._preventGhostClickTimer = null
    }, this._ghotClickDelay)
  }

  _handleResize() {
    if (this._imageGallery) {
      this.setState({galleryWidth: this._imageGallery.offsetWidth})
    }
  }

  _handleKeyDown(event) {
    const LEFT_ARROW = 37
    const RIGHT_ARROW = 39
    const key = parseInt(event.keyCode || event.which || 0)

    switch(key) {
      case LEFT_ARROW:
        if (this._canSlideLeft() && !this._intervalId) {
          this._slideLeft()
        }
        break
      case RIGHT_ARROW:
        if (this._canSlideRight() && !this._intervalId) {
          this._slideRight()
        }
        break
    }
  }

  _handleMouseOverThumbnails(index) {
    if (this.props.slideOnThumbnailHover) {
      this.setState({hovering: true})
      if (this._thumbnailTimer) {
        window.clearTimeout(this._thumbnailTimer)
        this._thumbnailTimer = null
      }
      this._thumbnailTimer = window.setTimeout(() => {
        this.slideToIndex(index)
      }, this._thumbnailDelay)
    }
  }

  _handleMouseLeaveThumbnails() {
    if (this._thumbnailTimer) {
      window.clearTimeout(this._thumbnailTimer)
      this._thumbnailTimer = null
      if (this.props.autoPlay === true) {
        this.play(false)
      }
    }
    this.setState({hovering: false})
  }

  _handleMouseOver() {
    this.setState({hovering: true})
  }

  _handleMouseLeave() {
    this.setState({hovering: false})
  }

  _handleImageError(event) {
    if (this.props.defaultImage &&
        event.target.src.indexOf(this.props.defaultImage) === -1) {
      event.target.src = this.props.defaultImage
    }
  }

  _handleOnSwiped(ev, x, y, isFlick) {
    this.setState({isFlick: isFlick})
  }

  _handleOnSwipedTo(index) {
    let slideTo = this.state.currentIndex
    if (Math.abs(this.state.offsetPercentage) > 30 || this.state.isFlick) {
      slideTo += index
    }

    if (index < 0) {
      if (!this._canSlideLeft()) {
        slideTo = this.state.currentIndex
      }
    } else {
      if (!this._canSlideRight()) {
        slideTo = this.state.currentIndex
      }
    }

    this.slideToIndex(slideTo)
  }

  _handleSwiping(index, _, delta) {
    const offsetPercentage = index * (delta / this.state.galleryWidth * 100)
    this.setState({offsetPercentage: offsetPercentage, style: {}})
  }

  _canNavigate() {
    return this.props.items.length >= 2
  }

  _canSlideLeft() {
    if (this.props.infinite) {
      return true
    } else {
      return this.state.currentIndex > 0
    }
  }

  _canSlideRight() {
    if (this.props.infinite) {
      return true
    } else {
      return this.state.currentIndex < this.props.items.length - 1
    }
  }

  _updateThumbnailTranslateX(prevState) {
    if (this.state.currentIndex === 0) {
      this._setThumbsTranslateX(0)
    } else {
      let indexDifference = Math.abs(
        prevState.currentIndex - this.state.currentIndex)
      let scrollX = this._getThumbsTranslateX(indexDifference)
      if (scrollX > 0) {
        if (prevState.currentIndex < this.state.currentIndex) {
          this._setThumbsTranslateX(
            this.state.thumbsTranslateX - scrollX)
        } else if (prevState.currentIndex > this.state.currentIndex) {
          this._setThumbsTranslateX(
            this.state.thumbsTranslateX + scrollX)
        }
      }
    }
  }

  _setThumbsTranslateX(thumbsTranslateX) {
    this.setState({thumbsTranslateX})
  }

  _getThumbsTranslateX(indexDifference) {
    if (this.props.disableThumbnailScroll) {
      return 0
    }

    if (this._thumbnails) {
      if (this._thumbnails.scrollWidth <= this.state.galleryWidth) {
        return 0
      }
      let totalThumbnails = this._thumbnails.children.length
      // total scroll-x required to see the last thumbnail
      let totalScrollX = this._thumbnails.scrollWidth - this.state.galleryWidth
      // scroll-x required per index change
      let perIndexScrollX = totalScrollX / (totalThumbnails - 1)

      return indexDifference * perIndexScrollX
    }
  }

  _getAlignmentClassName(index) {
    let {currentIndex} = this.state
    let alignment = ''
    const LEFT = 'left'
    const CENTER = 'center'
    const RIGHT = 'right'

    switch (index) {
      case (currentIndex - 1):
        alignment = ` ${LEFT}`
        break
      case (currentIndex):
        alignment = ` ${CENTER}`
        break
      case (currentIndex + 1):
        alignment = ` ${RIGHT}`
        break
    }

    if (this.props.items.length >= 3 && this.props.infinite) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = ` ${RIGHT}`
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = ` ${LEFT}`
      }
    }

    return alignment
  }

  _getSlideStyle(index) {
    const {currentIndex, offsetPercentage} = this.state
    const basetranslateX = -100 * currentIndex
    const totalSlides = this.props.items.length - 1

    let translateX = basetranslateX + (index * 100) + offsetPercentage
    let zIndex = 1

    if (this.props.infinite) {
      if (currentIndex === 0 && index === totalSlides) {
        // make the last slide the slide before the first
        translateX = -100 + offsetPercentage
      } else if (currentIndex === totalSlides && index === 0) {
        // make the first slide the slide after the last
        translateX = 100 + offsetPercentage
      }
    }

    // current index has more zIndex so slides wont fly by toggling infinite
    if (index === currentIndex) {
      zIndex = 3
    } else if (index === this.state.previousIndex) {
      zIndex = 2
    }

    const translate3d = `translate3d(${translateX}%, 0, 0)`

    return {
      WebkitTransform: translate3d,
      MozTransform: translate3d,
      msTransform: translate3d,
      OTransform: translate3d,
      transform: translate3d,
      zIndex: zIndex
    }
  }

  _getThumbnailStyle() {
    const translate3d = `translate3d(${this.state.thumbsTranslateX}px, 0, 0)`
    return {
      WebkitTransform: translate3d,
      MozTransform: translate3d,
      msTransform: translate3d,
      OTransform: translate3d,
      transform: translate3d
    }
  }

  _slideLeft() {
    this.slideToIndex(this.state.currentIndex - 1)
  }

  _slideRight() {
    this.slideToIndex(this.state.currentIndex + 1)
  }

  render() {
    const {currentIndex} = this.state
    const thumbnailStyle = this._getThumbnailStyle()

    const slideLeft = this._slideLeft.bind(this)
    const slideRight = this._slideRight.bind(this)

    let slides = []
    let thumbnails = []
    let bullets = []

    this.props.items.map((item, index) => {
      const alignment = this._getAlignmentClassName(index)
      const originalClass = item.originalClass ?
        ` ${item.originalClass}` : ''
      const thumbnailClass = item.thumbnailClass ?
        ` ${item.thumbnailClass}` : ''

      const slide = (
        <div
          key={index}
          className={'image-gallery-slide' + alignment + originalClass}
          style={Object.assign(this._getSlideStyle(index), this.state.style)}
          onClick={this._wrapClick(this.props.onClick)}
          onTouchStart={this.props.onClick}
          onTouchEnd={this._touchEnd.bind(this)}
        >
          <div className='image-gallery-image'>
            <img
              src={item.original}
              alt={item.originalAlt}
              onLoad={this.props.onImageLoad}
              onError={this._handleImageError.bind(this)}
            />
            {
              item.description &&
                <span className='image-gallery-description'>
                  {item.description}
                </span>
            }
          </div>
        </div>
      )

      if (this.props.lazyLoad) {
        if (alignment) {
          slides.push(slide)
        }
      } else {
        slides.push(slide)
      }

      if (this.props.showThumbnails) {
        thumbnails.push(
          <a
            onMouseOver={this._handleMouseOverThumbnails.bind(this, index)}
            onMouseLeave={this._handleMouseLeaveThumbnails.bind(this, index)}
            key={index}
            className={
              'image-gallery-thumbnail' +
              (currentIndex === index ? ' active' : '') +
              thumbnailClass
            }

            onTouchStart={this.slideToIndex.bind(this, index)}
            onTouchEnd={this._touchEnd.bind(this)}
            onClick={this._wrapClick(this.slideToIndex.bind(this, index))}>

            <img
              src={item.thumbnail}
              alt={item.thumbnailAlt}
              onError={this._handleImageError.bind(this)}/>
          </a>
        )
      }

      if (this.props.showBullets) {
        bullets.push(
          <li
            key={index}
            className={
              'image-gallery-bullet ' + (
                currentIndex === index ? 'active' : '')}

            onTouchStart={this.slideToIndex.bind(this, index)}
            onTouchEnd={this._touchEnd.bind(this)}
            onClick={this._wrapClick(this.slideToIndex.bind(this, index))}>
          </li>
        )
      }
    })

    return (
      <section ref={i => this._imageGallery = i} className='image-gallery'>
        <div
          onMouseOver={this._handleMouseOver.bind(this)}
          onMouseLeave={this._handleMouseLeave.bind(this)}
          className='image-gallery-content'>
          {
            this._canNavigate() ?
              [
                this.props.showNav &&
                  <span key='navigation'>
                    {
                      this._canSlideLeft() &&
                        <a
                          className='image-gallery-left-nav'
                          onTouchStart={slideLeft}
                          onTouchEnd={this._touchEnd.bind(this)}
                          onClick={this._wrapClick(slideLeft)}/>

                    }
                    {
                      this._canSlideRight() &&
                        <a
                          className='image-gallery-right-nav'
                          onTouchStart={slideRight}
                          onTouchEnd={this._touchEnd.bind(this)}
                          onClick={this._wrapClick(slideRight)}/>
                    }
                  </span>,

                  <Swipeable
                    className='image-gallery-swipe'
                    key='swipeable'
                    onSwipingLeft={this._handleSwiping.bind(this, -1)}
                    onSwipingRight={this._handleSwiping.bind(this, 1)}
                    onSwiped={this._handleOnSwiped.bind(this)}
                    onSwipedLeft={this._handleOnSwipedTo.bind(this, 1)}
                    onSwipedRight={this._handleOnSwipedTo.bind(this, -1)}
                  >
                    <div className='image-gallery-slides'>
                      {slides}
                    </div>
                  </Swipeable>
              ]
            :
              <div className='image-gallery-slides'>
                {slides}
              </div>
          }
          {
            this.props.showBullets &&
              <div className='image-gallery-bullets'>
                <ul className='image-gallery-bullets-container'>
                  {bullets}
                </ul>
              </div>
          }
          {
            this.props.showIndex &&
              <div className='image-gallery-index'>
                <span className='image-gallery-index-current'>
                  {this.state.currentIndex + 1}
                </span>
                <span className='image-gallery-index-separator'>
                  {this.props.indexSeparator}
                </span>
                <span className='image-gallery-index-total'>
                  {this.props.items.length}
                </span>
              </div>
          }
        </div>

        {
          this.props.showThumbnails &&
            <div className='image-gallery-thumbnails'>
              <div
                ref={t => this._thumbnails = t}
                className='image-gallery-thumbnails-container'
                style={thumbnailStyle}>
                {thumbnails}
              </div>
            </div>
        }
      </section>
    )
  }

}

ImageGallery.propTypes = {
  items: React.PropTypes.array.isRequired,
  showNav: React.PropTypes.bool,
  autoPlay: React.PropTypes.bool,
  lazyLoad: React.PropTypes.bool,
  infinite: React.PropTypes.bool,
  showIndex: React.PropTypes.bool,
  showBullets: React.PropTypes.bool,
  showThumbnails: React.PropTypes.bool,
  slideOnThumbnailHover: React.PropTypes.bool,
  disableThumbnailScroll: React.PropTypes.bool,
  defaultImage: React.PropTypes.string,
  indexSeparator: React.PropTypes.string,
  startIndex: React.PropTypes.number,
  slideInterval: React.PropTypes.number,
  onSlide: React.PropTypes.func,
  onPause: React.PropTypes.func,
  onPlay: React.PropTypes.func,
  onClick: React.PropTypes.func,
  onImageLoad: React.PropTypes.func,
}

ImageGallery.defaultProps = {
  items: [],
  showNav: true,
  autoPlay: false,
  lazyLoad: false,
  infinite: true,
  showIndex: false,
  showBullets: false,
  showThumbnails: true,
  slideOnThumbnailHover: false,
  disableThumbnailScroll: false,
  indexSeparator: ' / ',
  startIndex: 0,
  slideInterval: 3000
}
