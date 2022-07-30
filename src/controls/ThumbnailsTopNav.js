import React from 'react';
import { bool, func } from 'prop-types';
import SVG from 'src/SVG';

const ThumbnailsTopNav = React.memo(({
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="image-gallery-icon thumbnails-top-nav"
      disabled={disabled}
      onClick={onClick}
      aria-label="Previous Slide"
    >
      <SVG icon="top" viewBox="6 7 15 10" />
    </button>
  );
});

ThumbnailsTopNav.displayName = 'ThumbnailsTopNav';

ThumbnailsTopNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};


export default ThumbnailsTopNav;
