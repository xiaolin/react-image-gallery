import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Slide from "./Slide";

describe("<Slide />", () => {
  const defaultProps = {
    index: 0,
  };

  it("renders a slide div", () => {
    render(<Slide {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has correct aria-label based on index", () => {
    render(<Slide {...defaultProps} index={0} />);
    expect(screen.getByLabelText("Go to Slide 1")).toBeInTheDocument();
  });

  it("has correct aria-label for different indices", () => {
    render(<Slide {...defaultProps} index={3} />);
    expect(screen.getByLabelText("Go to Slide 4")).toBeInTheDocument();
  });

  it("has correct base class name", () => {
    render(<Slide {...defaultProps} />);
    const slide = screen.getByRole("button");
    expect(slide).toHaveClass("image-gallery-slide");
  });

  it("applies alignment class", () => {
    render(<Slide {...defaultProps} alignment="center" />);
    const slide = screen.getByRole("button");
    expect(slide).toHaveClass("center");
  });

  it("applies originalClass", () => {
    render(<Slide {...defaultProps} originalClass="custom-slide" />);
    const slide = screen.getByRole("button");
    expect(slide).toHaveClass("custom-slide");
  });

  it("applies custom style", () => {
    const style = { backgroundColor: "red", width: "100px" };
    render(<Slide {...defaultProps} style={style} />);
    const slide = screen.getByRole("button");
    expect(slide).toHaveStyle({ backgroundColor: "red", width: "100px" });
  });

  it("has tabIndex -1", () => {
    render(<Slide {...defaultProps} />);
    const slide = screen.getByRole("button");
    expect(slide).toHaveAttribute("tabindex", "-1");
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Slide {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onKeyUp when key is pressed", () => {
    const onKeyUp = jest.fn();
    render(<Slide {...defaultProps} onKeyUp={onKeyUp} />);
    fireEvent.keyUp(screen.getByRole("button"), { key: "Enter" });
    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it("calls onMouseOver when mouse enters", () => {
    const onMouseOver = jest.fn();
    render(<Slide {...defaultProps} onMouseOver={onMouseOver} />);
    fireEvent.mouseOver(screen.getByRole("button"));
    expect(onMouseOver).toHaveBeenCalledTimes(1);
  });

  it("calls onMouseLeave when mouse leaves", () => {
    const onMouseLeave = jest.fn();
    render(<Slide {...defaultProps} onMouseLeave={onMouseLeave} />);
    fireEvent.mouseLeave(screen.getByRole("button"));
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("calls onTouchStart when touch starts", () => {
    const onTouchStart = jest.fn();
    render(<Slide {...defaultProps} onTouchStart={onTouchStart} />);
    fireEvent.touchStart(screen.getByRole("button"));
    expect(onTouchStart).toHaveBeenCalledTimes(1);
  });

  it("calls onTouchMove when touch moves", () => {
    const onTouchMove = jest.fn();
    render(<Slide {...defaultProps} onTouchMove={onTouchMove} />);
    fireEvent.touchMove(screen.getByRole("button"));
    expect(onTouchMove).toHaveBeenCalledTimes(1);
  });

  it("calls onTouchEnd when touch ends", () => {
    const onTouchEnd = jest.fn();
    render(<Slide {...defaultProps} onTouchEnd={onTouchEnd} />);
    fireEvent.touchEnd(screen.getByRole("button"));
    expect(onTouchEnd).toHaveBeenCalledTimes(1);
  });

  it("renders children", () => {
    render(
      <Slide {...defaultProps}>
        <img alt="Test" src="test.jpg" />
      </Slide>
    );
    expect(screen.getByAltText("Test")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <Slide {...defaultProps}>
        <img alt="Gallery item" src="test.jpg" />
        <span>Caption</span>
      </Slide>
    );
    expect(screen.getByAltText("Gallery item")).toBeInTheDocument();
    expect(screen.getByText("Caption")).toBeInTheDocument();
  });
});
