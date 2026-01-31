import React, { memo } from "react";

interface IndexIndicatorProps {
  currentIndex: number;
  totalItems: number;
  indexSeparator?: string;
}

/**
 * Index indicator component showing current slide position
 */
const IndexIndicator = memo<IndexIndicatorProps>(function IndexIndicator({
  currentIndex,
  totalItems,
  indexSeparator = " / ",
}) {
  return (
    <div className="image-gallery-index">
      <span className="image-gallery-index-current">{currentIndex + 1}</span>
      <span className="image-gallery-index-separator">{indexSeparator}</span>
      <span className="image-gallery-index-total">{totalItems}</span>
    </div>
  );
});

export default IndexIndicator;
