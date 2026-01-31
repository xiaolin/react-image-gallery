import React, { memo } from "react";
import type { CSSProperties } from "react";

interface SlideProps {
  index: number;
  alignment?: string;
  originalClass?: string;
  style?: CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onMouseOver?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

/**
 * Individual slide component for the gallery
 */
const Slide = memo<SlideProps>(function Slide({
  index,
  alignment = "",
  originalClass = "",
  style = {},
  onClick,
  onKeyUp,
  onTouchMove,
  onTouchEnd,
  onTouchStart,
  onMouseOver,
  onMouseLeave,
  children = null,
}) {
  return (
    <div
      key={`slide-${index}`}
      aria-label={`Go to Slide ${index + 1}`}
      className={`image-gallery-slide ${alignment} ${originalClass}`}
      role="button"
      style={style}
      tabIndex={-1}
      onClick={onClick}
      onFocus={
        onMouseOver as unknown as React.FocusEventHandler<HTMLDivElement>
      }
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

export default Slide;
