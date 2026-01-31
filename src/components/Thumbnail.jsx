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
      type="button"
      tabIndex="0"
      aria-pressed={isActive ? "true" : "false"}
      aria-label={`Go to Slide ${index + 1}`}
      className={className}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      onFocus={onFocus}
      onKeyUp={onKeyUp}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

Thumbnail.propTypes = {
  index: number.isRequired,
  isActive: bool,
  thumbnailClass: string,
  onMouseLeave: func,
  onMouseOver: func,
  onFocus: func,
  onKeyUp: func,
  onClick: func,
  children: node,
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
