import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Item from "./Item";

describe("<Item />", () => {
  const defaultProps = {
    original: "test-image.jpg",
    handleImageLoaded: jest.fn(),
    onImageError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders an image with the original src", () => {
    const { container } = render(<Item {...defaultProps} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "test-image.jpg");
  });

  it("renders with alt text", () => {
    render(<Item {...defaultProps} originalAlt="Test alt text" />);
    const img = screen.getByAltText("Test alt text");
    expect(img).toBeInTheDocument();
  });

  it("renders with title", () => {
    const { container } = render(
      <Item {...defaultProps} originalTitle="Test title" />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("title", "Test title");
  });

  it("renders with srcSet and sizes", () => {
    const { container } = render(
      <Item
        {...defaultProps}
        srcSet="test-small.jpg 300w, test-large.jpg 800w"
        sizes="(max-width: 600px) 300px, 800px"
      />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute(
      "srcset",
      "test-small.jpg 300w, test-large.jpg 800w"
    );
    expect(img).toHaveAttribute("sizes", "(max-width: 600px) 300px, 800px");
  });

  it("renders with width and height", () => {
    const { container } = render(
      <Item {...defaultProps} originalWidth="800" originalHeight="600" />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
  });

  it("renders with loading attribute", () => {
    const { container } = render(<Item {...defaultProps} loading="lazy" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("uses eager loading by default", () => {
    const { container } = render(<Item {...defaultProps} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("renders description when provided", () => {
    render(<Item {...defaultProps} description="Test description" />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<Item {...defaultProps} />);
    expect(
      container.querySelector(".image-gallery-description")
    ).not.toBeInTheDocument();
  });

  it("calls handleImageLoaded on image load", () => {
    const { container } = render(<Item {...defaultProps} />);
    const img = container.querySelector("img");
    fireEvent.load(img);
    expect(defaultProps.handleImageLoaded).toHaveBeenCalledWith(
      expect.any(Object),
      "test-image.jpg"
    );
  });

  it("calls onImageError on image error", () => {
    const { container } = render(<Item {...defaultProps} />);
    const img = container.querySelector("img");
    fireEvent.error(img);
    expect(defaultProps.onImageError).toHaveBeenCalled();
  });

  it("uses fullscreen src when isFullscreen is true", () => {
    const { container } = render(
      <Item
        {...defaultProps}
        fullscreen="fullscreen-image.jpg"
        isFullscreen={true}
      />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "fullscreen-image.jpg");
  });

  it("falls back to original src when isFullscreen but no fullscreen provided", () => {
    const { container } = render(
      <Item {...defaultProps} isFullscreen={true} />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "test-image.jpg");
  });

  it("uses original src when not fullscreen even if fullscreen provided", () => {
    const { container } = render(
      <Item
        {...defaultProps}
        fullscreen="fullscreen-image.jpg"
        isFullscreen={false}
      />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "test-image.jpg");
  });
});
