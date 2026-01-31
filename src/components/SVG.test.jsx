import React from "react";
import { render } from "@testing-library/react";
import SVG from "./SVG";

describe("<SVG />", () => {
  it("renders left icon", () => {
    render(<SVG icon="left" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector("polyline")).toBeInTheDocument();
  });

  it("renders right icon", () => {
    render(<SVG icon="right" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders top icon", () => {
    render(<SVG icon="top" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bottom icon", () => {
    render(<SVG icon="bottom" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders maximize icon", () => {
    render(<SVG icon="maximize" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector("path")).toBeInTheDocument();
  });

  it("renders minimize icon", () => {
    render(<SVG icon="minimize" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector("path")).toBeInTheDocument();
  });

  it("renders play icon", () => {
    render(<SVG icon="play" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector("polygon")).toBeInTheDocument();
  });

  it("renders pause icon", () => {
    render(<SVG icon="pause" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toBeInTheDocument();
    const rects = svg.querySelectorAll("rect");
    expect(rects.length).toBe(2);
  });

  it("uses default strokeWidth of 1", () => {
    render(<SVG icon="left" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("stroke-width", "1");
  });

  it("accepts custom strokeWidth", () => {
    render(<SVG icon="left" strokeWidth={2} />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("stroke-width", "2");
  });

  it("uses default viewBox", () => {
    render(<SVG icon="left" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("accepts custom viewBox", () => {
    render(<SVG icon="left" viewBox="6 0 12 24" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("viewBox", "6 0 12 24");
  });

  it("has correct SVG attributes", () => {
    render(<SVG icon="left" />);
    const svg = document.querySelector(".image-gallery-svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("stroke-linecap", "square");
    expect(svg).toHaveAttribute("stroke-linejoin", "miter");
  });
});
