import React, { memo } from "react";
import clsx from "clsx";
import { bool, func, node, number, string } from "prop-types";

/**
 * Individual thumbnail button component
 */
const Thumbnail = memo(function Thumbnail({
  index,
  isActive,
  thumbnailClass,
  onMouseLeave,
  onMouseOver,
  onFocus,
  onKeyUp,
  onClick,
  children,
}) {
  const className = clsx("image-gallery-thumbnail", thumbnailClass, {
    active: isActive,
  });

  return (
    <button
      key={`thumbnail-${index}`}
      aria-label={`Go to Slide ${index + 1}`}
      aria-pressed={isActive ? "true" : "false"}
      className={className}
      tabIndex="0"
      type="button"
      onClick={onClick}
      onFocus={onFocus}
      onKeyUp={onKeyUp}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
    >
      {children}
    </button>
  );
});

Thumbnail.propTypes = {
  children: node,
  index: number.isRequired,
  isActive: bool,
  thumbnailClass: string,
  onClick: func,
  onFocus: func,
  onKeyUp: func,
  onMouseLeave: func,
  onMouseOver: func,
};

Thumbnail.defaultProps = {
  isActive: false,
  thumbnailClass: "",
  onMouseLeave: null,
  onMouseOver: null,
  onFocus: null,
  onKeyUp: null,
  onClick: null,
  children: null,
};

export default Thumbnail;
