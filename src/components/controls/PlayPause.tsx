import React from "react";
import SVG from "src/components/SVG";

interface PlayPauseProps {
  isPlaying: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PlayPause = React.memo<PlayPauseProps>(({ isPlaying, onClick }) => {
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

export default PlayPause;
