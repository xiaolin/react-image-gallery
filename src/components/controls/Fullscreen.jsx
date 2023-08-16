import React from 'react';
import { bool, func } from 'prop-types';
import SVG from 'src/SVG';

const Fullscreen = React.memo(({
  isFullscreen,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="image-gallery-icon image-gallery-fullscreen-button"
      onClick={onClick}
      aria-label="Open Fullscreen"
    >
      <SVG strokeWidth={2} icon={isFullscreen ? 'minimize' : 'maximize'} />
    </button>
  );
});

Fullscreen.displayName = 'Fullscreen';

Fullscreen.propTypes = {
  isFullscreen: bool.isRequired,
  onClick: func.isRequired,
};


export default Fullscreen;
