import React from 'react';
import { bool, func } from 'prop-types';
import SVG from 'src/SVG';

const ThumbnailsBottomNav = React.memo(({
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="image-gallery-icon thumbnails-bottom-nav"
      disabled={disabled}
      onClick={onClick}
      aria-label="Next Slide"
    >
      <SVG icon="bottom" viewBox="6 7 15 10" />
    </button>
  );
});

ThumbnailsBottomNav.displayName = 'ThumbnailsBottomNav';

ThumbnailsBottomNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};


export default ThumbnailsBottomNav;
