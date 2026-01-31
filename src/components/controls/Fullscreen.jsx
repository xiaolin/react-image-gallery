import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const Fullscreen = React.memo(({ isFullscreen, onClick }) => {
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

Fullscreen.propTypes = {
  isFullscreen: bool.isRequired,
  onClick: func.isRequired,
};

export default Fullscreen;
