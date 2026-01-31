import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const TopNav = React.memo(({ disabled, onClick }) => {
  return (
    <button
      aria-label="Previous Slide"
      className="image-gallery-icon image-gallery-top-nav"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <SVG icon="top" viewBox="6 0 12 24" />
    </button>
  );
});

TopNav.displayName = "TopNav";

TopNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};

export default TopNav;
