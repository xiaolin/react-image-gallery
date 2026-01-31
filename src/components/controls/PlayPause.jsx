import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const PlayPause = React.memo(({ isPlaying, onClick }) => {
  return (
    <button
      aria-label="Play or Pause Slideshow"
      className="image-gallery-icon image-gallery-play-button"
      type="button"
      onClick={onClick}
    >
      <SVG icon={isPlaying ? "pause" : "play"} strokeWidth={2} />
    </button>
  );
});

PlayPause.displayName = "PlayPause";

PlayPause.propTypes = {
  isPlaying: bool.isRequired,
  onClick: func.isRequired,
};

export default PlayPause;
