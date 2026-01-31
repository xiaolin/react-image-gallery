import React from "react";
import { render, screen } from "@testing-library/react";
import ThumbnailBar from "./ThumbnailBar";

describe("<ThumbnailBar />", () => {
  const defaultProps = {
    thumbnails: [
      <button key="1">Thumb 1</button>,
      <button key="2">Thumb 2</button>,
    ],
  };

  it("renders nothing when thumbnails is empty", () => {
    const { container } = render(<ThumbnailBar thumbnails={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when thumbnails is undefined", () => {
    const { container } = render(<ThumbnailBar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders thumbnail navigation when thumbnails provided", () => {
    render(<ThumbnailBar {...defaultProps} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<ThumbnailBar {...defaultProps} />);
    expect(screen.getByLabelText("Thumbnail Navigation")).toBeInTheDocument();
  });

  it("renders all provided thumbnails", () => {
    render(<ThumbnailBar {...defaultProps} />);
    expect(screen.getByText("Thumb 1")).toBeInTheDocument();
    expect(screen.getByText("Thumb 2")).toBeInTheDocument();
  });

  it("has correct wrapper class for bottom position", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} thumbnailPosition="bottom" />
    );
    expect(container.firstChild).toHaveClass(
      "image-gallery-thumbnails-wrapper"
    );
    expect(container.firstChild).toHaveClass("image-gallery-thumbnails-bottom");
  });

  it("has correct wrapper class for top position", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} thumbnailPosition="top" />
    );
    expect(container.firstChild).toHaveClass("image-gallery-thumbnails-top");
  });

  it("has correct wrapper class for left position", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} thumbnailPosition="left" />
    );
    expect(container.firstChild).toHaveClass("image-gallery-thumbnails-left");
  });

  it("has correct wrapper class for right position", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} thumbnailPosition="right" />
    );
    expect(container.firstChild).toHaveClass("image-gallery-thumbnails-right");
  });

  it("has RTL class when isRTL is true and horizontal", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} isRTL={true} thumbnailPosition="bottom" />
    );
    expect(container.firstChild).toHaveClass("thumbnails-wrapper-rtl");
  });

  it("does not have RTL class when vertical", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} isRTL={true} thumbnailPosition="left" />
    );
    expect(container.firstChild).not.toHaveClass("thumbnails-wrapper-rtl");
  });

  it("has horizontal swipe class when not disabled and horizontal", () => {
    const { container } = render(
      <ThumbnailBar
        {...defaultProps}
        disableThumbnailSwipe={false}
        thumbnailPosition="bottom"
      />
    );
    expect(container.firstChild).toHaveClass("thumbnails-swipe-horizontal");
  });

  it("has vertical swipe class when not disabled and vertical", () => {
    const { container } = render(
      <ThumbnailBar
        {...defaultProps}
        disableThumbnailSwipe={false}
        thumbnailPosition="left"
      />
    );
    expect(container.firstChild).toHaveClass("thumbnails-swipe-vertical");
  });

  it("does not have swipe class when disabled", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} disableThumbnailSwipe={true} />
    );
    expect(container.firstChild).not.toHaveClass("thumbnails-swipe-horizontal");
    expect(container.firstChild).not.toHaveClass("thumbnails-swipe-vertical");
  });

  it("applies thumbnailStyle to container", () => {
    const style = { transform: "translateX(-100px)" };
    render(<ThumbnailBar {...defaultProps} thumbnailStyle={style} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveStyle({ transform: "translateX(-100px)" });
  });

  it("applies thumbnailBarHeight to wrapper", () => {
    const { container } = render(
      <ThumbnailBar {...defaultProps} thumbnailBarHeight={{ height: 100 }} />
    );
    const thumbnailsWrapper = container.querySelector(
      ".image-gallery-thumbnails"
    );
    expect(thumbnailsWrapper).toHaveStyle({ height: "100px" });
  });

  it("has correct inner structure", () => {
    const { container } = render(<ThumbnailBar {...defaultProps} />);
    expect(
      container.querySelector(".image-gallery-thumbnails")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".image-gallery-thumbnails-container")
    ).toBeInTheDocument();
  });
});
