import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BottomNav from "./BottomNav";

describe("<BottomNav />", () => {
  const defaultProps = {
    disabled: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<BottomNav {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<BottomNav {...defaultProps} />);
    expect(screen.getByLabelText("Next Slide")).toBeInTheDocument();
  });

  it("has correct class names", () => {
    render(<BottomNav {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-icon");
    expect(button).toHaveClass("image-gallery-bottom-nav");
  });

  it("calls onClick when clicked", () => {
    render(<BottomNav {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<BottomNav {...defaultProps} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when disabled prop is false", () => {
    render(<BottomNav {...defaultProps} disabled={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does not call onClick when disabled and clicked", () => {
    render(<BottomNav {...defaultProps} disabled={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("renders SVG icon", () => {
    render(<BottomNav {...defaultProps} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });
});
