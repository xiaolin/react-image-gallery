import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const BottomNav = React.memo(({ disabled, onClick }) => {
  return (
    <button
      aria-label="Next Slide"
      className="image-gallery-icon image-gallery-bottom-nav"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <SVG icon="bottom" viewBox="6 0 12 24" />
    </button>
  );
});

BottomNav.displayName = "BottomNav";

BottomNav.propTypes = {
  disabled: bool.isRequired,
  onClick: func.isRequired,
};

export default BottomNav;
