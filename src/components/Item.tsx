import React from "react";

interface ItemProps {
  original: string;
  handleImageLoaded: (
    event: React.SyntheticEvent<HTMLImageElement>,
    originalSrc: string
  ) => void;
  onImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  description?: string;
  fullscreen?: string;
  isFullscreen?: boolean;
  originalAlt?: string;
  originalHeight?: string;
  originalWidth?: string;
  originalTitle?: string;
  sizes?: string;
  srcSet?: string;
  loading?: "eager" | "lazy";
}

const defaultProps: Partial<ItemProps> = {
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

const Item = React.memo<ItemProps>((props) => {
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

export default Item;
