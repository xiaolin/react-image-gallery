import React, { memo } from "react";
import { number, string } from "prop-types";

/**
 * Index indicator component showing current slide position
 */
const IndexIndicator = memo(function IndexIndicator({
  currentIndex,
  totalItems,
  indexSeparator,
}) {
  return (
    <div className="image-gallery-index">
      <span className="image-gallery-index-current">{currentIndex + 1}</span>
      <span className="image-gallery-index-separator">{indexSeparator}</span>
      <span className="image-gallery-index-total">{totalItems}</span>
    </div>
  );
});

IndexIndicator.propTypes = {
  currentIndex: number.isRequired,
  totalItems: number.isRequired,
  indexSeparator: string,
};

IndexIndicator.defaultProps = {
  indexSeparator: " / ",
};

export default IndexIndicator;
