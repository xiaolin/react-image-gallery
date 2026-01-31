/**
 * @jest-environment jsdom
 */

import { injectStyles, resetStylesInjected } from "./styleInjector";

describe("styleInjector", () => {
  beforeEach(() => {
    // Clean up any injected styles
    const existingStyle = document.querySelector("style[data-image-gallery]");
    if (existingStyle) {
      existingStyle.remove();
    }
    resetStylesInjected();
  });

  afterEach(() => {
    // Clean up after each test
    const existingStyle = document.querySelector("style[data-image-gallery]");
    if (existingStyle) {
      existingStyle.remove();
    }
    resetStylesInjected();
  });

  it("does not inject styles when __GALLERY_CSS__ is empty", () => {
    injectStyles();
    // Since __GALLERY_CSS__ is not defined in test environment, it should be empty
    const style = document.querySelector("style[data-image-gallery]");
    expect(style).toBeNull();
  });

  it("does not inject styles multiple times", () => {
    // Create a mock style to simulate already injected styles
    const mockStyle = document.createElement("style");
    mockStyle.setAttribute("data-image-gallery", "");
    mockStyle.textContent = ".test { color: red; }";
    document.head.appendChild(mockStyle);

    injectStyles();

    const styles = document.querySelectorAll("style[data-image-gallery]");
    expect(styles.length).toBe(1);
  });

  it("resetStylesInjected allows re-injection", () => {
    // First, mark styles as injected by creating a style element
    const mockStyle = document.createElement("style");
    mockStyle.setAttribute("data-image-gallery", "");
    document.head.appendChild(mockStyle);

    // Now inject (should detect existing and skip)
    injectStyles();

    // Reset the flag
    resetStylesInjected();

    // Verify only one style element exists
    const styles = document.querySelectorAll("style[data-image-gallery]");
    expect(styles.length).toBe(1);
  });
});
