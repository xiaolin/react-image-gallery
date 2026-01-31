import React from "react";
import { render, screen } from "@testing-library/react";
import IndexIndicator from "./IndexIndicator";

describe("<IndexIndicator />", () => {
  const defaultProps = {
    currentIndex: 0,
    totalItems: 10,
  };

  it("renders the index indicator", () => {
    const { container } = render(<IndexIndicator {...defaultProps} />);
    expect(container.firstChild).toHaveClass("image-gallery-index");
  });

  it("displays current index (1-based)", () => {
    render(<IndexIndicator {...defaultProps} currentIndex={0} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("displays correct current index for non-zero index", () => {
    render(<IndexIndicator {...defaultProps} currentIndex={5} />);
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("displays total items", () => {
    render(<IndexIndicator {...defaultProps} totalItems={10} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("displays default separator", () => {
    const { container } = render(<IndexIndicator {...defaultProps} />);
    const separator = container.querySelector(".image-gallery-index-separator");
    expect(separator).toHaveTextContent("/");
  });

  it("displays custom separator", () => {
    const { container } = render(
      <IndexIndicator {...defaultProps} indexSeparator=" of " />
    );
    const separator = container.querySelector(".image-gallery-index-separator");
    expect(separator).toHaveTextContent("of");
  });

  it("has correct structure with separate spans", () => {
    const { container } = render(<IndexIndicator {...defaultProps} />);
    expect(
      container.querySelector(".image-gallery-index-current")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".image-gallery-index-separator")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".image-gallery-index-total")
    ).toBeInTheDocument();
  });

  it("current span contains correct value", () => {
    const { container } = render(
      <IndexIndicator {...defaultProps} currentIndex={3} />
    );
    const currentSpan = container.querySelector(".image-gallery-index-current");
    expect(currentSpan).toHaveTextContent("4");
  });

  it("total span contains correct value", () => {
    const { container } = render(
      <IndexIndicator {...defaultProps} totalItems={25} />
    );
    const totalSpan = container.querySelector(".image-gallery-index-total");
    expect(totalSpan).toHaveTextContent("25");
  });

  it("separator span contains correct value", () => {
    const { container } = render(
      <IndexIndicator {...defaultProps} indexSeparator=" - " />
    );
    const separatorSpan = container.querySelector(
      ".image-gallery-index-separator"
    );
    expect(separatorSpan).toHaveTextContent("-");
  });

  it("displays first and last correctly", () => {
    render(<IndexIndicator currentIndex={0} totalItems={5} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays last index correctly", () => {
    const { container } = render(
      <IndexIndicator currentIndex={4} totalItems={5} />
    );
    const currentSpan = container.querySelector(".image-gallery-index-current");
    const totalSpan = container.querySelector(".image-gallery-index-total");
    expect(currentSpan).toHaveTextContent("5");
    expect(totalSpan).toHaveTextContent("5");
  });
});
