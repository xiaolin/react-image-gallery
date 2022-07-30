import React from 'react';
import { bool, func } from 'prop-types';
import SVG from 'src/SVG';

const ThumbnailsRightNav = React.memo(({
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="image-gallery-icon thumbnails-right-nav"
      disabled={disabled}
      onClick={onClick}
      aria-label="Next Slide"
    >
      <SVG icon="right" viewBox="6 0 12 24" />
    </button>
  );
});

ThumbnailsRightNav.displayName = 'ThumbnailsRightNav';

ThumbnailsRightNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};


export default ThumbnailsRightNav;
