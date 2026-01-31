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
      type="button"
      key={`bullet-${index}`}
      className={className}
      onClick={onClick}
      aria-pressed={isActive ? "true" : "false"}
      aria-label={`Go to Slide ${index + 1}`}
    />
  );
});

Bullet.propTypes = {
  index: number.isRequired,
  isActive: bool,
  bulletClass: string,
  onClick: func,
};

Bullet.defaultProps = {
  isActive: false,
  bulletClass: "",
  onClick: null,
};

export default Bullet;
