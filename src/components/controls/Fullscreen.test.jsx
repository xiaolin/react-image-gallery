import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Fullscreen from "./Fullscreen";

describe("<Fullscreen />", () => {
  const defaultProps = {
    isFullscreen: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<Fullscreen {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<Fullscreen {...defaultProps} />);
    expect(screen.getByLabelText("Open Fullscreen")).toBeInTheDocument();
  });

  it("has correct class names", () => {
    render(<Fullscreen {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-icon");
    expect(button).toHaveClass("image-gallery-fullscreen-button");
  });

  it("calls onClick when clicked", () => {
    render(<Fullscreen {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("renders maximize icon when not fullscreen", () => {
    render(<Fullscreen {...defaultProps} isFullscreen={false} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    // maximize icon uses a path element
    expect(svg.querySelector("path")).toBeInTheDocument();
  });

  it("renders minimize icon when fullscreen", () => {
    render(<Fullscreen {...defaultProps} isFullscreen={true} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    // minimize icon also uses a path element
    expect(svg.querySelector("path")).toBeInTheDocument();
  });

  it("renders SVG with strokeWidth of 2", () => {
    render(<Fullscreen {...defaultProps} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("stroke-width", "2");
  });
});
