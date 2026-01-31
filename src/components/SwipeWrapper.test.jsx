import React from "react";
import { render, screen } from "@testing-library/react";
import SwipeWrapper from "./SwipeWrapper";

// Mock react-swipeable
jest.mock("react-swipeable", () => ({
  useSwipeable: jest.fn(() => ({
    ref: jest.fn(),
    onMouseDown: jest.fn(),
  })),
}));

describe("<SwipeWrapper />", () => {
  it("renders children", () => {
    render(
      <SwipeWrapper>
        <div data-testid="child">Child content</div>
      </SwipeWrapper>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("applies className", () => {
    const { container } = render(
      <SwipeWrapper className="test-class">
        <div>Child</div>
      </SwipeWrapper>
    );
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("renders without className", () => {
    const { container } = render(
      <SwipeWrapper>
        <div>Child</div>
      </SwipeWrapper>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("passes delta to useSwipeable", async () => {
    const { useSwipeable } = await import("react-swipeable");
    render(
      <SwipeWrapper delta={50}>
        <div>Child</div>
      </SwipeWrapper>
    );
    expect(useSwipeable).toHaveBeenCalledWith(
      expect.objectContaining({ delta: 50 })
    );
  });

  it("passes onSwiping callback to useSwipeable", async () => {
    const { useSwipeable } = await import("react-swipeable");
    const onSwiping = jest.fn();
    render(
      <SwipeWrapper onSwiping={onSwiping}>
        <div>Child</div>
      </SwipeWrapper>
    );
    expect(useSwipeable).toHaveBeenCalledWith(
      expect.objectContaining({ onSwiping })
    );
  });

  it("passes onSwiped callback to useSwipeable", async () => {
    const { useSwipeable } = await import("react-swipeable");
    const onSwiped = jest.fn();
    render(
      <SwipeWrapper onSwiped={onSwiped}>
        <div>Child</div>
      </SwipeWrapper>
    );
    expect(useSwipeable).toHaveBeenCalledWith(
      expect.objectContaining({ onSwiped })
    );
  });
});
