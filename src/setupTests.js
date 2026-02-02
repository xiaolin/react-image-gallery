/* global jest */
// Jest DOM setup
import "@testing-library/jest-dom";

// Mock the styleInjector to prevent actual DOM manipulation in tests
jest.mock("src/components/styleInjector", () => ({
  injectStyles: jest.fn(),
  resetStylesInjected: jest.fn(),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
