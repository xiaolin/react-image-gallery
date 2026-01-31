import React, { memo } from "react";
import type { CSSProperties, RefObject } from "react";
import clsx from "clsx";
import type { SwipeEventData } from "react-swipeable";
import SwipeWrapper from "src/components/SwipeWrapper";
import type { ThumbnailPosition } from "src/types";

interface ThumbnailBarProps {
  thumbnails?: React.ReactNode[];
  thumbnailPosition?: ThumbnailPosition;
  thumbnailStyle?: CSSProperties;
  thumbnailBarHeight?: { height?: number };
  isRTL?: boolean;
  disableThumbnailSwipe?: boolean;
  onSwiping?: ((eventData: SwipeEventData) => void) | null;
  onSwiped?: ((eventData: SwipeEventData) => void) | null;
  thumbnailsWrapperRef?: RefObject<HTMLDivElement | null> | null;
  thumbnailsRef?: RefObject<HTMLElement | null> | null;
}

/**
 * Thumbnail bar container component
 */
const ThumbnailBar = memo<ThumbnailBarProps>(function ThumbnailBar({
  thumbnails = [],
  thumbnailPosition = "bottom",
  thumbnailStyle = {},
  thumbnailBarHeight = {},
  isRTL = false,
  disableThumbnailSwipe = false,
  onSwiping,
  onSwiped,
  thumbnailsWrapperRef,
  thumbnailsRef,
}) {
  const getThumbnailPositionClassName = (
    position: ThumbnailPosition
  ): string => {
    const classNames: Record<ThumbnailPosition, string> = {
      left: "image-gallery-thumbnails-left",
      right: "image-gallery-thumbnails-right",
      bottom: "image-gallery-thumbnails-bottom",
      top: "image-gallery-thumbnails-top",
    };
    return classNames[position] ? ` ${classNames[position]}` : "";
  };

  const isThumbnailVertical =
    thumbnailPosition === "left" || thumbnailPosition === "right";

  const wrapperClassName = clsx(
    "image-gallery-thumbnails-wrapper",
    getThumbnailPositionClassName(thumbnailPosition),
    { "thumbnails-wrapper-rtl": !isThumbnailVertical && isRTL },
    {
      "thumbnails-swipe-horizontal":
        !isThumbnailVertical && !disableThumbnailSwipe,
    },
    {
      "thumbnails-swipe-vertical":
        isThumbnailVertical && !disableThumbnailSwipe,
    }
  );

  if (!thumbnails || thumbnails.length === 0) {
    return null;
  }

  return (
    <SwipeWrapper
      className={wrapperClassName}
      delta={0}
      onSwiped={!disableThumbnailSwipe ? (onSwiped ?? undefined) : undefined}
      onSwiping={!disableThumbnailSwipe ? (onSwiping ?? undefined) : undefined}
    >
      <div
        ref={thumbnailsWrapperRef}
        className="image-gallery-thumbnails"
        style={thumbnailBarHeight}
      >
        <nav
          ref={thumbnailsRef as RefObject<HTMLElement>}
          aria-label="Thumbnail Navigation"
          className="image-gallery-thumbnails-container"
          style={thumbnailStyle}
        >
          {thumbnails}
        </nav>
      </div>
    </SwipeWrapper>
  );
});

export default ThumbnailBar;
