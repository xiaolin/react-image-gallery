import React, { memo } from "react";
import clsx from "clsx";
import { arrayOf, bool, node } from "prop-types";

/**
 * Bullet navigation component
 */
const BulletNav = memo(function BulletNav({ bullets, slideVertically }) {
  const bulletsClass = clsx("image-gallery-bullets", {
    "image-gallery-bullets-vertical": slideVertically,
  });

  if (!bullets || bullets.length === 0) {
    return null;
  }

  return (
    <div className={bulletsClass}>
      <div
        aria-label="Bullet Navigation"
        className="image-gallery-bullets-container"
        role="navigation"
      >
        {bullets}
      </div>
    </div>
  );
});

BulletNav.propTypes = {
  bullets: arrayOf(node),
  slideVertically: bool,
};

BulletNav.defaultProps = {
  bullets: [],
  slideVertically: false,
};

export default BulletNav;
