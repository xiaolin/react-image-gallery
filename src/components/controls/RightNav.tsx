import React from "react";
import SVG from "src/components/SVG";

interface RightNavProps {
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const RightNav = React.memo<RightNavProps>(({ disabled, onClick }) => {
  return (
    <button
      aria-label="Next Slide"
      className="image-gallery-icon image-gallery-right-nav"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <SVG icon="right" viewBox="6 0 12 24" />
    </button>
  );
});

RightNav.displayName = "RightNav";

export default RightNav;
