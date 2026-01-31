import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Bullet from "./Bullet";

describe("<Bullet />", () => {
  const defaultProps = {
    index: 0,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<Bullet {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label based on index", () => {
    render(<Bullet {...defaultProps} index={0} />);
    expect(screen.getByLabelText("Go to Slide 1")).toBeInTheDocument();
  });

  it("has correct aria-label for different indices", () => {
    render(<Bullet {...defaultProps} index={4} />);
    expect(screen.getByLabelText("Go to Slide 5")).toBeInTheDocument();
  });

  it("has correct base class name", () => {
    render(<Bullet {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-bullet");
  });

  it("applies custom bulletClass", () => {
    render(<Bullet {...defaultProps} bulletClass="custom-bullet" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-bullet");
    expect(button).toHaveClass("custom-bullet");
  });

  it("has active class when isActive is true", () => {
    render(<Bullet {...defaultProps} isActive={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("active");
  });

  it("does not have active class when isActive is false", () => {
    render(<Bullet {...defaultProps} isActive={false} />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("active");
  });

  it("calls onClick when clicked", () => {
    render(<Bullet {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("has aria-pressed true when active", () => {
    render(<Bullet {...defaultProps} isActive={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("has aria-pressed false when not active", () => {
    render(<Bullet {...defaultProps} isActive={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("has type button", () => {
    render(<Bullet {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });
});
