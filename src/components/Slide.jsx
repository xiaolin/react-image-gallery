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
      key={`slide-${index}`}
      aria-label={`Go to Slide ${index + 1}`}
      className={`image-gallery-slide ${alignment} ${originalClass}`}
      role="button"
      style={style}
      tabIndex="-1"
      onClick={onClick}
      onFocus={onMouseOver}
      onKeyUp={onKeyUp}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
    >
      {children}
    </div>
  );
});

Slide.propTypes = {
  alignment: string,
  children: node,
  index: number.isRequired,
  originalClass: string,
  style: object,
  onClick: func,
  onKeyUp: func,
  onMouseLeave: func,
  onMouseOver: func,
  onTouchEnd: func,
  onTouchMove: func,
  onTouchStart: func,
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
