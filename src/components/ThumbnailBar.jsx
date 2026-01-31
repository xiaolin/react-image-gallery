import React, { memo } from "react";
import clsx from "clsx";
import { arrayOf, bool, func, node, object, string } from "prop-types";
import SwipeWrapper from "src/components/SwipeWrapper";

/**
 * Thumbnail bar container component
 */
const ThumbnailBar = memo(function ThumbnailBar({
  thumbnails,
  thumbnailPosition,
  thumbnailStyle,
  thumbnailBarHeight,
  isRTL,
  disableThumbnailSwipe,
  onSwiping,
  onSwiped,
  thumbnailsWrapperRef,
  thumbnailsRef,
}) {
  const getThumbnailPositionClassName = (position) => {
    const classNames = {
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
      onSwiped={!disableThumbnailSwipe ? onSwiped : undefined}
      onSwiping={!disableThumbnailSwipe ? onSwiping : undefined}
    >
      <div
        ref={thumbnailsWrapperRef}
        className="image-gallery-thumbnails"
        style={thumbnailBarHeight}
      >
        <nav
          ref={thumbnailsRef}
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

ThumbnailBar.propTypes = {
  disableThumbnailSwipe: bool,
  isRTL: bool,
  thumbnailBarHeight: object,
  thumbnailPosition: string,
  thumbnails: arrayOf(node),
  thumbnailsRef: object,
  thumbnailStyle: object,
  thumbnailsWrapperRef: object,
  onSwiped: func,
  onSwiping: func,
};

ThumbnailBar.defaultProps = {
  thumbnails: [],
  thumbnailPosition: "bottom",
  thumbnailStyle: {},
  thumbnailBarHeight: {},
  isRTL: false,
  disableThumbnailSwipe: false,
  onSwiping: null,
  onSwiped: null,
  thumbnailsWrapperRef: null,
  thumbnailsRef: null,
};

export default ThumbnailBar;
