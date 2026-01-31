import React, { memo } from "react";
import clsx from "clsx";
import { bool, func, number, string } from "prop-types";

/**
 * Bullet button component for bullet navigation
 */
const Bullet = memo(function Bullet({ index, isActive, bulletClass, onClick }) {
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

Bullet.propTypes = {
  bulletClass: string,
  index: number.isRequired,
  isActive: bool,
  onClick: func,
};

Bullet.defaultProps = {
  isActive: false,
  bulletClass: "",
  onClick: null,
};

export default Bullet;
