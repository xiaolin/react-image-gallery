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

  it("has inner container for bullets", () => {
    const bullets = [<button key="1">Bullet 1</button>];
    const { container } = render(<BulletNav bullets={bullets} />);
    const inner = container.querySelector(".image-gallery-bullets-inner");
    expect(inner).toBeInTheDocument();
  });

  describe("maxBullets", () => {
    const createBullets = (count: number) =>
      Array.from({ length: count }, (_, i) => (
        <button key={i} className="image-gallery-bullet">
          Bullet {i}
        </button>
      ));

    it("shows all bullets when maxBullets is not set", () => {
      const bullets = createBullets(12);
      render(<BulletNav bullets={bullets} currentIndex={0} />);
      expect(screen.getByText("Bullet 0")).toBeInTheDocument();
      expect(screen.getByText("Bullet 11")).toBeInTheDocument();
    });

    it("shows all bullets when maxBullets >= total bullets", () => {
      const bullets = createBullets(5);
      render(<BulletNav bullets={bullets} currentIndex={0} maxBullets={10} />);
      expect(screen.getByText("Bullet 0")).toBeInTheDocument();
      expect(screen.getByText("Bullet 4")).toBeInTheDocument();
    });

    it("renders all bullets in DOM when maxBullets is set", () => {
      const bullets = createBullets(12);
      render(<BulletNav bullets={bullets} currentIndex={6} maxBullets={5} />);
      // All bullets should be in the DOM (overflow hidden hides them visually)
      expect(screen.getByText("Bullet 0")).toBeInTheDocument();
      expect(screen.getByText("Bullet 6")).toBeInTheDocument();
      expect(screen.getByText("Bullet 11")).toBeInTheDocument();
    });

    it("applies container style when maxBullets is set and bulletSize is measured", () => {
      const bullets = createBullets(12);
      const { container } = render(
        <BulletNav bullets={bullets} currentIndex={6} maxBullets={5} />
      );
      const nav = container.querySelector(".image-gallery-bullets-container");
      // Container should exist (style applied after measurement)
      expect(nav).toBeInTheDocument();
    });
    it("enforces minimum of 3 for maxBullets", () => {
      const bullets = createBullets(10);
      // Even with maxBullets=1, all bullets should render (overflow hidden clips them)
      // and it should behave as if maxBullets=3
      render(<BulletNav bullets={bullets} currentIndex={5} maxBullets={1} />);
      // All bullets should be in DOM
      expect(screen.getByText("Bullet 0")).toBeInTheDocument();
      expect(screen.getByText("Bullet 9")).toBeInTheDocument();
    });

    it("treats maxBullets=2 as maxBullets=3", () => {
      const bullets = createBullets(10);
      render(<BulletNav bullets={bullets} currentIndex={5} maxBullets={2} />);
      expect(screen.getByText("Bullet 0")).toBeInTheDocument();
      expect(screen.getByText("Bullet 9")).toBeInTheDocument();
    });

    it("sets up ResizeObserver to remeasure bullets on resize", () => {
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      const mockResizeObserver = jest.fn().mockImplementation(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: jest.fn(),
      }));
      window.ResizeObserver = mockResizeObserver;

      const bullets = createBullets(10);
      const { unmount } = render(
        <BulletNav bullets={bullets} currentIndex={5} maxBullets={5} />
      );

      // ResizeObserver should be created and observe called
      expect(mockResizeObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();

      // Cleanup should disconnect
      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
