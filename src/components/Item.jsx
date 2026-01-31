import React from "react";
import { bool, func, string } from "prop-types";

const defaultProps = {
  description: "",
  fullscreen: "",
  isFullscreen: false,
  originalAlt: "",
  originalHeight: "",
  originalWidth: "",
  originalTitle: "",
  sizes: "",
  srcSet: "",
  loading: "eager",
};

const Item = React.memo((props) => {
  const {
    description,
    fullscreen, // fullscreen version of img
    handleImageLoaded,
    isFullscreen,
    onImageError,
    original,
    originalAlt,
    originalHeight,
    originalWidth,
    originalTitle,
    sizes,
    srcSet,
    loading,
  } = { ...defaultProps, ...props };
  const itemSrc = isFullscreen ? fullscreen || original : original;

  return (
    <React.Fragment>
      <img
        alt={originalAlt}
        className="image-gallery-image"
        height={originalHeight}
        loading={loading}
        sizes={sizes}
        src={itemSrc}
        srcSet={srcSet}
        title={originalTitle}
        width={originalWidth}
        onError={onImageError}
        onLoad={(event) => handleImageLoaded(event, original)}
      />
      {description && (
        <span className="image-gallery-description">{description}</span>
      )}
    </React.Fragment>
  );
});

Item.displayName = "Item";

Item.propTypes = {
  description: string,
  fullscreen: string, // fullscreen version of img
  handleImageLoaded: func.isRequired,
  isFullscreen: bool,
  loading: string,
  original: string.isRequired,
  originalAlt: string,
  originalHeight: string,
  originalTitle: string,
  originalWidth: string,
  sizes: string,
  srcSet: string,
  onImageError: func.isRequired,
};

export default Item;
