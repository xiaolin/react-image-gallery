import React from "react";
import SVG from "src/components/SVG";

interface TopNavProps {
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const TopNav = React.memo<TopNavProps>(({ disabled, onClick }) => {
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

export default TopNav;
