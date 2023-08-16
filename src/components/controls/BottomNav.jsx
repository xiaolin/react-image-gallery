import React from "react";
import { bool, func } from "prop-types";
import SVG from "src/components/SVG";

const BottomNav = React.memo(({ disabled, onClick }) => {
  return (
    <button
      type="button"
      className="image-gallery-icon image-gallery-bottom-nav"
      disabled={disabled}
      onClick={onClick}
      aria-label="Next Slide"
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
