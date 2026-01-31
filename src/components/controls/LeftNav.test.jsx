import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import LeftNav from "./LeftNav";

describe("<LeftNav />", () => {
  const defaultProps = {
    disabled: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<LeftNav {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<LeftNav {...defaultProps} />);
    expect(screen.getByLabelText("Previous Slide")).toBeInTheDocument();
  });

  it("has correct class names", () => {
    render(<LeftNav {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-icon");
    expect(button).toHaveClass("image-gallery-left-nav");
  });

  it("calls onClick when clicked", () => {
    render(<LeftNav {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<LeftNav {...defaultProps} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when disabled prop is false", () => {
    render(<LeftNav {...defaultProps} disabled={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does not call onClick when disabled and clicked", () => {
    render(<LeftNav {...defaultProps} disabled={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("renders SVG icon", () => {
    render(<LeftNav {...defaultProps} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });
});
