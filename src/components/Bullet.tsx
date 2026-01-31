import React, { memo } from "react";
import clsx from "clsx";

interface BulletProps {
  index: number;
  isActive?: boolean;
  bulletClass?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Bullet button component for bullet navigation
 */
const Bullet = memo<BulletProps>(function Bullet({
  index,
  isActive = false,
  bulletClass = "",
  onClick,
}) {
  const className = clsx("image-gallery-bullet", bulletClass, {
    active: isActive,
  });

  return (
    <button
      key={`bullet-${index}`}
      aria-label={`Go to Slide ${index + 1}`}
      aria-pressed={isActive ? "true" : "false"}
      className={className}
      type="button"
      onClick={onClick}
    />
  );
});

export default Bullet;
