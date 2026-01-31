import React, { memo } from "react";
import clsx from "clsx";

interface ThumbnailProps {
  index: number;
  isActive?: boolean;
  thumbnailClass?: string;
  onMouseLeave?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
  onMouseOver?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
  onFocus?: ((event: React.FocusEvent<HTMLButtonElement>) => void) | null;
  onKeyUp?: ((event: React.KeyboardEvent<HTMLButtonElement>) => void) | null;
  onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
  children?: React.ReactNode;
}

/**
 * Individual thumbnail button component
 */
const Thumbnail = memo<ThumbnailProps>(function Thumbnail({
  index,
  isActive = false,
  thumbnailClass = "",
  onMouseLeave,
  onMouseOver,
  onFocus,
  onKeyUp,
  onClick,
  children = null,
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
      tabIndex={0}
      type="button"
      onClick={onClick ?? undefined}
      onFocus={onFocus ?? undefined}
      onKeyUp={onKeyUp ?? undefined}
      onMouseLeave={onMouseLeave ?? undefined}
      onMouseOver={onMouseOver ?? undefined}
    >
      {children}
    </button>
  );
});

export default Thumbnail;
