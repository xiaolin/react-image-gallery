import React from "react";
import SVG from "src/components/SVG";

interface BottomNavProps {
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const BottomNav = React.memo<BottomNavProps>(({ disabled, onClick }) => {
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

export default BottomNav;
