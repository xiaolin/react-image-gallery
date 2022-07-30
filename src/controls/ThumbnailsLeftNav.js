import React from 'react';
import { bool, func } from 'prop-types';
import SVG from 'src/SVG';

const ThumbnailsLeftNav = React.memo(({
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="image-gallery-icon thumbnails-left-nav"
      disabled={disabled}
      onClick={onClick}
      aria-label="Previous Slide"
    >
      <SVG icon="left" viewBox="6 0 12 24" />
    </button>
  );
});

ThumbnailsLeftNav.displayName = 'ThumbnailsLeftNav';

ThumbnailsLeftNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};


export default ThumbnailsLeftNav;
