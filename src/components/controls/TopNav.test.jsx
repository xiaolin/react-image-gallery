import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import TopNav from "./TopNav";

describe("<TopNav />", () => {
  const defaultProps = {
    disabled: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<TopNav {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<TopNav {...defaultProps} />);
    expect(screen.getByLabelText("Previous Slide")).toBeInTheDocument();
  });

  it("has correct class names", () => {
    render(<TopNav {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-icon");
    expect(button).toHaveClass("image-gallery-top-nav");
  });

  it("calls onClick when clicked", () => {
    render(<TopNav {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<TopNav {...defaultProps} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when disabled prop is false", () => {
    render(<TopNav {...defaultProps} disabled={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("does not call onClick when disabled and clicked", () => {
    render(<TopNav {...defaultProps} disabled={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("renders SVG icon", () => {
    render(<TopNav {...defaultProps} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });
});
