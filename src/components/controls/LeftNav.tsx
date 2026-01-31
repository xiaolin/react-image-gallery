import React from "react";
import SVG from "src/components/SVG";

interface LeftNavProps {
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const LeftNav = React.memo<LeftNavProps>(({ disabled, onClick }) => {
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

export default LeftNav;
