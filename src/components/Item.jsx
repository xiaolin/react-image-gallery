import React from "react";
import { bool, func, number, string } from "prop-types";

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
  rotate: 0,
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
    rotate,
  } = { ...defaultProps, ...props };
  const itemSrc = isFullscreen ? fullscreen || original : original;
  
  // 构建图片样式，支持旋转变换
  const imageStyle = rotate !== 0 ? { transform: `rotate(${rotate}deg)` } : undefined;

  return (
    <React.Fragment>
      <img
        className="image-gallery-image"
        src={itemSrc}
        alt={originalAlt}
        srcSet={srcSet}
        height={originalHeight}
        width={originalWidth}
        sizes={sizes}
        title={originalTitle}
        style={imageStyle}
        onLoad={(event) => handleImageLoaded(event, original)}
        onError={onImageError}
        loading={loading}
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
  onImageError: func.isRequired,
  original: string.isRequired,
  originalAlt: string,
  originalHeight: string,
  originalWidth: string,
  originalTitle: string,
  sizes: string,
  srcSet: string,
  loading: string,
  rotate: number, // 图片旋转角度，支持任意数值（通常为 0, 90, 180, 270）
};

export default Item;
