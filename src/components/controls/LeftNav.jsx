import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const LeftNav = React.memo(({ disabled, onClick }) => {
  return (
    <button
      aria-label="Previous Slide"
      className="image-gallery-icon image-gallery-left-nav"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <SVG icon="left" viewBox="6 0 12 24" />
    </button>
  );
});

LeftNav.displayName = "LeftNav";

LeftNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};

export default LeftNav;
