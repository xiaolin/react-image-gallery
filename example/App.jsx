import React from "react";
import { createRoot } from "react-dom/client";

import ImageGallery from "src/components/ImageGallery";

const PREFIX_URL =
  "https://raw.githubusercontent.com/xiaolin/react-image-gallery/master/static/";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      showIndex: false,
      showBullets: true,
      infinite: true,
      showThumbnails: true,
      showFullscreenButton: true,
      showGalleryFullscreenButton: true,
      showPlayButton: false,
      showGalleryPlayButton: true,
      showNav: true,
      slideVertically: false,
      isRTL: false,
      slideDuration: 450,
      slideInterval: 2000,
      slideOnThumbnailOver: false,
      thumbnailPosition: "bottom",
      showVideo: false,
      useWindowKeyDown: true,
    };
    this._toggleShowVideo = this._toggleShowVideo.bind(this);

    this.images = [
      {
        thumbnail: `${PREFIX_URL}4v.jpg`,
        original: `${PREFIX_URL}4v.jpg`,
        embedUrl:
          "https://www.youtube.com/embed/4pSzhZ76GdM?autoplay=1&showinfo=0",
        description: "Render custom slides (such as videos)",
        renderItem: this._renderVideo.bind(this),
      },
      {
        original: `${PREFIX_URL}1.jpg`,
        thumbnail: `${PREFIX_URL}1t.jpg`,
        originalClass: "featured-slide",
        thumbnailClass: "featured-thumb",
        description: "Custom class for slides & thumbnails",
      },
    ].concat(this._getStaticImages());
  }

  _onImageClick(event) {
    console.debug(
      "clicked on image",
      event.target,
      "at index",
      this._imageGallery.getCurrentIndex()
    );
  }

  _onImageLoad(event) {
    console.debug("loaded image", event.target.src);
  }

  _onSlide(index) {
    this._resetVideo();
    console.debug("slid to index", index);
  }

  _onPause(index) {
    console.debug("paused on index", index);
  }

  _onScreenChange(fullScreenElement) {
    console.debug("isFullScreen?", !!fullScreenElement);
  }

  _onPlay(index) {
    console.debug("playing from index", index);
  }

  _handleInputChange(state, event) {
    if (event.target.value > 0) {
      this.setState({ [state]: event.target.value });
    }
  }

  _handleCheckboxChange(state, event) {
    this.setState({ [state]: event.target.checked });
  }

  _handleThumbnailPositionChange(event) {
    this.setState({ thumbnailPosition: event.target.value });
  }

  _getStaticImages() {
    let images = [];
    for (let i = 2; i < 12; i++) {
      images.push({
        original: `${PREFIX_URL}${i}.jpg`,
        thumbnail: `${PREFIX_URL}${i}t.jpg`,
      });
    }

    return images;
  }

  _resetVideo() {
    this.setState({ showVideo: false });

    if (this.state.showPlayButton) {
      this.setState({ showGalleryPlayButton: true });
    }

    if (this.state.showFullscreenButton) {
      this.setState({ showGalleryFullscreenButton: true });
    }
  }

  _toggleShowVideo() {
    const { showVideo } = this.state;
    this.setState({
      showVideo: !showVideo,
    });

    if (!showVideo) {
      if (this.state.showPlayButton) {
        this.setState({ showGalleryPlayButton: false });
      }

      if (this.state.showFullscreenButton) {
        this.setState({ showGalleryFullscreenButton: false });
      }
    }
  }

  _renderVideo(item) {
    return (
      <div>
        {this.state.showVideo ? (
          <div className="video-wrapper">
            <button className="close-video" onClick={this._toggleShowVideo} />
            <iframe
              title="sample video"
              width="560"
              height="315"
              src={item.embedUrl}
              style={{ border: "none" }}
              allowFullScreen
            />
          </div>
        ) : (
          <>
            <button className="play-button" onClick={this._toggleShowVideo} />
            <img
              alt="sample video cover"
              className="image-gallery-image"
              src={item.original}
            />
            {item.description && (
              <span
                className="image-gallery-description"
                style={{ right: "0", left: "initial" }}
              >
                {item.description}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  render() {
    return (
      <section className="app">
        <ImageGallery
          ref={(i) => (this._imageGallery = i)}
          items={this.images}
          onClick={this._onImageClick.bind(this)}
          onImageLoad={this._onImageLoad}
          onSlide={this._onSlide.bind(this)}
          onPause={this._onPause.bind(this)}
          onScreenChange={this._onScreenChange.bind(this)}
          onPlay={this._onPlay.bind(this)}
          infinite={this.state.infinite}
          showBullets={this.state.showBullets}
          showFullscreenButton={
            this.state.showFullscreenButton &&
            this.state.showGalleryFullscreenButton
          }
          showPlayButton={
            this.state.showPlayButton && this.state.showGalleryPlayButton
          }
          showThumbnails={this.state.showThumbnails}
          showIndex={this.state.showIndex}
          showNav={this.state.showNav}
          isRTL={this.state.isRTL}
          thumbnailPosition={this.state.thumbnailPosition}
          slideDuration={parseInt(this.state.slideDuration)}
          slideInterval={parseInt(this.state.slideInterval)}
          slideOnThumbnailOver={this.state.slideOnThumbnailOver}
          additionalClass="app-image-gallery"
          useWindowKeyDown={this.state.useWindowKeyDown}
          slideVertically={this.state.slideVertically}
        />

        <div className="app-sandbox">
          <div className="app-sandbox-content">
            <h2 className="app-header">Settings</h2>

            <ul className="app-buttons">
              <li>
                <div className="app-interval-input-group">
                  <span className="app-interval-label">Play Interval</span>
                  <input
                    className="app-interval-input"
                    type="text"
                    onChange={this._handleInputChange.bind(
                      this,
                      "slideInterval"
                    )}
                    value={this.state.slideInterval}
                  />
                </div>
              </li>

              <li>
                <div className="app-interval-input-group">
                  <span className="app-interval-label">Slide Duration</span>
                  <input
                    className="app-interval-input"
                    type="text"
                    onChange={this._handleInputChange.bind(
                      this,
                      "slideDuration"
                    )}
                    value={this.state.slideDuration}
                  />
                </div>
              </li>

              <li>
                <div className="app-interval-input-group">
                  <span className="app-interval-label">
                    Thumbnail Bar Position
                  </span>
                  <select
                    className="app-interval-input"
                    value={this.state.thumbnailPosition}
                    onChange={this._handleThumbnailPositionChange.bind(this)}
                  >
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </li>
            </ul>

            <ul className="app-checkboxes">
              <li>
                <input
                  id="infinite"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(this, "infinite")}
                  checked={this.state.infinite}
                />
                <label htmlFor="infinite">allow infinite sliding</label>
              </li>
              <li>
                <input
                  id="show_fullscreen"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "showFullscreenButton"
                  )}
                  checked={this.state.showFullscreenButton}
                />
                <label htmlFor="show_fullscreen">show fullscreen button</label>
              </li>
              <li>
                <input
                  id="show_playbutton"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "showPlayButton"
                  )}
                  checked={this.state.showPlayButton}
                />
                <label htmlFor="show_playbutton">show play button</label>
              </li>
              <li>
                <input
                  id="show_bullets"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "showBullets"
                  )}
                  checked={this.state.showBullets}
                />
                <label htmlFor="show_bullets">show bullets</label>
              </li>
              <li>
                <input
                  id="show_thumbnails"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "showThumbnails"
                  )}
                  checked={this.state.showThumbnails}
                />
                <label htmlFor="show_thumbnails">show thumbnails</label>
              </li>
              <li>
                <input
                  id="show_navigation"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(this, "showNav")}
                  checked={this.state.showNav}
                />
                <label htmlFor="show_navigation">show navigation</label>
              </li>
              <li>
                <input
                  id="show_index"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(this, "showIndex")}
                  checked={this.state.showIndex}
                />
                <label htmlFor="show_index">show index</label>
              </li>
              <li>
                <input
                  id="slide_vertically"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "slideVertically"
                  )}
                  checked={this.state.slideVertically}
                />
                <label htmlFor="slide_vertically">slide vertically</label>
              </li>
              <li>
                <input
                  id="is_rtl"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(this, "isRTL")}
                  checked={this.state.isRTL}
                />
                <label htmlFor="is_rtl">is right to left</label>
              </li>
              <li>
                <input
                  id="slide_on_thumbnail_hover"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "slideOnThumbnailOver"
                  )}
                  checked={this.state.slideOnThumbnailOver}
                />
                <label htmlFor="slide_on_thumbnail_hover">
                  slide on mouse over thumbnails
                </label>
              </li>
              <li>
                <input
                  id="use_window_keydown"
                  type="checkbox"
                  onChange={this._handleCheckboxChange.bind(
                    this,
                    "useWindowKeyDown"
                  )}
                  checked={this.state.useWindowKeyDown}
                />
                <label htmlFor="use_window_keydown">use window keydown</label>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
