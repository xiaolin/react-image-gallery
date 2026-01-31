import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Thumbnail from "./Thumbnail";

describe("<Thumbnail />", () => {
  const defaultProps = {
    index: 0,
  };

  it("renders a button", () => {
    render(<Thumbnail {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label based on index", () => {
    render(<Thumbnail {...defaultProps} index={0} />);
    expect(screen.getByLabelText("Go to Slide 1")).toBeInTheDocument();
  });

  it("has correct aria-label for different indices", () => {
    render(<Thumbnail {...defaultProps} index={5} />);
    expect(screen.getByLabelText("Go to Slide 6")).toBeInTheDocument();
  });

  it("has correct base class name", () => {
    render(<Thumbnail {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-thumbnail");
  });

  it("applies custom thumbnailClass", () => {
    render(<Thumbnail {...defaultProps} thumbnailClass="custom-thumb" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("image-gallery-thumbnail");
    expect(button).toHaveClass("custom-thumb");
  });

  it("has active class when isActive is true", () => {
    render(<Thumbnail {...defaultProps} isActive={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("active");
  });

  it("does not have active class when isActive is false", () => {
    render(<Thumbnail {...defaultProps} isActive={false} />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("active");
  });

  it("has aria-pressed true when active", () => {
    render(<Thumbnail {...defaultProps} isActive={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("has aria-pressed false when not active", () => {
    render(<Thumbnail {...defaultProps} isActive={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("has tabIndex 0", () => {
    render(<Thumbnail {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabindex", "0");
  });

  it("has type button", () => {
    render(<Thumbnail {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Thumbnail {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onMouseOver when mouse enters", () => {
    const onMouseOver = jest.fn();
    render(<Thumbnail {...defaultProps} onMouseOver={onMouseOver} />);
    fireEvent.mouseOver(screen.getByRole("button"));
    expect(onMouseOver).toHaveBeenCalledTimes(1);
  });

  it("calls onMouseLeave when mouse leaves", () => {
    const onMouseLeave = jest.fn();
    render(<Thumbnail {...defaultProps} onMouseLeave={onMouseLeave} />);
    fireEvent.mouseLeave(screen.getByRole("button"));
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("calls onFocus when focused", () => {
    const onFocus = jest.fn();
    render(<Thumbnail {...defaultProps} onFocus={onFocus} />);
    fireEvent.focus(screen.getByRole("button"));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("calls onKeyUp when key is pressed", () => {
    const onKeyUp = jest.fn();
    render(<Thumbnail {...defaultProps} onKeyUp={onKeyUp} />);
    fireEvent.keyUp(screen.getByRole("button"), { key: "Enter" });
    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it("handles null onClick gracefully", () => {
    render(<Thumbnail {...defaultProps} onClick={null} />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });

  it("handles null onMouseOver gracefully", () => {
    render(<Thumbnail {...defaultProps} onMouseOver={null} />);
    expect(() => fireEvent.mouseOver(screen.getByRole("button"))).not.toThrow();
  });

  it("renders children", () => {
    render(
      <Thumbnail {...defaultProps}>
        <img alt="Thumbnail" src="thumb.jpg" />
      </Thumbnail>
    );
    expect(screen.getByAltText("Thumbnail")).toBeInTheDocument();
  });

  it("renders children with span wrapper", () => {
    render(
      <Thumbnail {...defaultProps}>
        <span className="thumb-inner">
          <img alt="Thumbnail" src="thumb.jpg" />
        </span>
      </Thumbnail>
    );
    expect(screen.getByAltText("Thumbnail")).toBeInTheDocument();
    expect(document.querySelector(".thumb-inner")).toBeInTheDocument();
  });
});
