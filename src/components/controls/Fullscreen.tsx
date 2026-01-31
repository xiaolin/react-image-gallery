import React from "react";
import SVG from "src/components/SVG";

interface FullscreenProps {
  isFullscreen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Fullscreen = React.memo<FullscreenProps>(({ isFullscreen, onClick }) => {
  return (
    <button
      aria-label="Open Fullscreen"
      className="image-gallery-icon image-gallery-fullscreen-button"
      type="button"
      onClick={onClick}
    >
      <SVG icon={isFullscreen ? "minimize" : "maximize"} strokeWidth={2} />
    </button>
  );
});

Fullscreen.displayName = "Fullscreen";

export default Fullscreen;
