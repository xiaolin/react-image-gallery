import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import PlayPause from "./PlayPause";

describe("<PlayPause />", () => {
  const defaultProps = {
    isPlaying: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<PlayPause {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<PlayPause {...defaultProps} />);
    expect(
      screen.getByLabelText("Play or Pause Slideshow")
    ).toBeInTheDocument();
  });

  it("has correct class names", () => {
    render(<PlayPause {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-icon");
    expect(button).toHaveClass("image-gallery-play-button");
  });

  it("calls onClick when clicked", () => {
    render(<PlayPause {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("renders play icon when not playing", () => {
    render(<PlayPause {...defaultProps} isPlaying={false} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    // play icon uses a polygon element
    expect(svg.querySelector("polygon")).toBeInTheDocument();
  });

  it("renders pause icon when playing", () => {
    render(<PlayPause {...defaultProps} isPlaying={true} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    // pause icon uses rect elements
    const rects = svg.querySelectorAll("rect");
    expect(rects.length).toBe(2);
  });

  it("renders SVG with strokeWidth of 2", () => {
    render(<PlayPause {...defaultProps} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("stroke-width", "2");
  });
});
