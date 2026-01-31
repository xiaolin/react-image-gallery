import React, { memo } from "react";
import clsx from "clsx";

interface BulletNavProps {
  bullets?: React.ReactNode[];
  slideVertically?: boolean;
}

/**
 * Bullet navigation component
 */
const BulletNav = memo<BulletNavProps>(function BulletNav({
  bullets = [],
  slideVertically = false,
}) {
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

export default BulletNav;
