import React, { memo } from "react";
import { func, node, number, object, string } from "prop-types";

/**
 * Individual slide component for the gallery
 */
const Slide = memo(function Slide({
  index,
  alignment,
  originalClass,
  style,
  onClick,
  onKeyUp,
  onTouchMove,
  onTouchEnd,
  onTouchStart,
  onMouseOver,
  onMouseLeave,
  children,
}) {
  return (
    <div
      aria-label={`Go to Slide ${index + 1}`}
      key={`slide-${index}`}
      tabIndex="-1"
      className={`image-gallery-slide ${alignment} ${originalClass}`}
      style={style}
      onClick={onClick}
      onKeyUp={onKeyUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      onMouseOver={onMouseOver}
      onFocus={onMouseOver}
      onMouseLeave={onMouseLeave}
      role="button"
    >
      {children}
    </div>
  );
});

Slide.propTypes = {
  index: number.isRequired,
  alignment: string,
  originalClass: string,
  style: object,
  onClick: func,
  onKeyUp: func,
  onTouchMove: func,
  onTouchEnd: func,
  onTouchStart: func,
  onMouseOver: func,
  onMouseLeave: func,
  children: node,
};

Slide.defaultProps = {
  alignment: "",
  originalClass: "",
  style: {},
  onClick: null,
  onKeyUp: null,
  onTouchMove: null,
  onTouchEnd: null,
  onTouchStart: null,
  onMouseOver: null,
  onMouseLeave: null,
  children: null,
};

export default Slide;
