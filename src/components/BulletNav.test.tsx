import React from "react";
import { render, screen } from "@testing-library/react";
import BulletNav from "./BulletNav";

describe("<BulletNav />", () => {
  it("renders nothing when bullets is empty", () => {
    const { container } = render(<BulletNav bullets={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when bullets is undefined", () => {
    const { container } = render(<BulletNav />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bullets container when bullets provided", () => {
    const bullets = [
      <button key="1">Bullet 1</button>,
      <button key="2">Bullet 2</button>,
    ];
    render(<BulletNav bullets={bullets} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    render(<BulletNav bullets={bullets} />);
    expect(screen.getByLabelText("Bullet Navigation")).toBeInTheDocument();
  });

  it("has correct base class name", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    const { container } = render(<BulletNav bullets={bullets} />);
    expect(container.firstChild).toHaveClass("image-gallery-bullets");
  });

  it("has vertical class when slideVertically is true", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    const { container } = render(
      <BulletNav bullets={bullets} slideVertically={true} />
    );
    expect(container.firstChild).toHaveClass("image-gallery-bullets-vertical");
  });

  it("does not have vertical class when slideVertically is false", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    const { container } = render(
      <BulletNav bullets={bullets} slideVertically={false} />
    );
    expect(container.firstChild).not.toHaveClass(
      "image-gallery-bullets-vertical"
    );
  });

  it("renders all provided bullets", () => {
    const bullets = [
      <button key="1">Bullet 1</button>,
      <button key="2">Bullet 2</button>,
      <button key="3">Bullet 3</button>,
    ];
    render(<BulletNav bullets={bullets} />);
    expect(screen.getByText("Bullet 1")).toBeInTheDocument();
    expect(screen.getByText("Bullet 2")).toBeInTheDocument();
    expect(screen.getByText("Bullet 3")).toBeInTheDocument();
  });

  it("has bullets container inside navigation", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    render(<BulletNav bullets={bullets} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("image-gallery-bullets-container");
  });
});
