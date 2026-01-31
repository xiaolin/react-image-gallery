/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Bundle Verification Tests
 *
 * These tests verify that the BUILT bundles (what users get via npm install)
 * are correctly configured and importable.
 *
 * Why ES module AND UMD?
 * - ES module (image-gallery.es.js): For modern bundlers (Webpack, Vite, Rollup)
 *   that support `import` syntax. Enables tree-shaking.
 * - UMD (image-gallery.umd.js): For CommonJS (`require()`) and script tags.
 *   Works in Node.js and older environments.
 *
 * What this tests:
 * 1. Build files exist at expected paths
 * 2. ES module has proper export syntax
 * 3. UMD module has proper export pattern
 * 4. Both bundles export a valid React component
 * 5. CSS files exist and contain required styles
 * 6. package.json is correctly configured for npm
 */

import fs from "fs";
import path from "path";
import React from "react";
import { render } from "@testing-library/react";

// Root path for the project
const ROOT = path.resolve(__dirname, "../..");

interface PackageJson {
  main: string;
  module: string;
  exports: {
    ".": {
      import: string;
      require: string;
    };
  };
  files: string[];
  peerDependencies: Record<string, string>;
  dependencies?: Record<string, string>;
}

describe("Bundle Verification Tests", () => {
  describe("Build Files Exist", () => {
    it("ES module build exists at build/image-gallery.es.js", () => {
      const filePath = path.join(ROOT, "build/image-gallery.es.js");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("UMD build exists at build/image-gallery.umd.js", () => {
      const filePath = path.join(ROOT, "build/image-gallery.umd.js");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("CSS build exists at build/image-gallery.css", () => {
      const filePath = path.join(ROOT, "build/image-gallery.css");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("Source CSS exists at styles/image-gallery.css", () => {
      const filePath = path.join(ROOT, "styles/image-gallery.css");
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe("ES Module Bundle (import syntax)", () => {
    let esContent: string;

    beforeAll(() => {
      esContent = fs.readFileSync(
        path.join(ROOT, "build/image-gallery.es.js"),
        "utf8"
      );
    });

    it("contains ES module export syntax", () => {
      // ES modules use `export` keyword
      expect(esContent).toMatch(/export\s*\{/);
    });

    it("exports ImageGallery as default", () => {
      expect(esContent).toContain("as default");
    });

    it("imports React (peer dependency)", () => {
      // Should reference React as external dependency
      expect(esContent).toMatch(/from\s*["']react["']/);
    });

    it("does not bundle React (externalized)", () => {
      // React should be external, not bundled inline
      // A bundled React would have thousands of lines of React internals
      // The bundle should be relatively small
      const bundleSize = Buffer.byteLength(esContent, "utf8");
      // Should be under 200KB (React alone is ~100KB minified)
      expect(bundleSize).toBeLessThan(200 * 1024);
    });

    it("can be dynamically imported and exports a React component", async () => {
      // Dynamic import of the actual build
      // @ts-expect-error - Build output doesn't have declaration file
      const module = await import("../../build/image-gallery.es.js");

      expect(module.default).toBeDefined();
      // React.forwardRef components have $$typeof
      expect(module.default.$$typeof).toBeDefined();
    });

    it("renders correctly when imported from build", async () => {
      // @ts-expect-error - Build output doesn't have declaration file
      const module = await import("../../build/image-gallery.es.js");
      const ImageGallery = module.default;

      const items = [
        { original: "test1.jpg", thumbnail: "thumb1.jpg" },
        { original: "test2.jpg", thumbnail: "thumb2.jpg" },
      ];

      const { container } = render(<ImageGallery items={items} />);

      expect(container.querySelector(".image-gallery")).toBeInTheDocument();
      // With infinite mode (default), 2 items + 2 clones = 4 slides
      expect(container.querySelectorAll(".image-gallery-slide").length).toBe(4);
    });
  });

  describe("UMD Bundle (require syntax)", () => {
    let umdContent: string;

    beforeAll(() => {
      umdContent = fs.readFileSync(
        path.join(ROOT, "build/image-gallery.umd.js"),
        "utf8"
      );
    });

    it("contains UMD wrapper pattern", () => {
      // UMD modules typically check for CommonJS, AMD, or global
      expect(
        umdContent.includes("exports") || umdContent.includes("module")
      ).toBe(true);
    });

    it("references React as external dependency", () => {
      // Should reference React externally
      const hasReact =
        umdContent.includes("react") || umdContent.includes("React");
      expect(hasReact).toBe(true);
    });

    it("does not bundle React (externalized)", () => {
      const bundleSize = Buffer.byteLength(umdContent, "utf8");
      expect(bundleSize).toBeLessThan(200 * 1024);
    });

    it("can be required and exports a React component", () => {
      const ImageGallery = require("../../build/image-gallery.umd.js");

      // UMD might export as default or directly
      const Component = ImageGallery.default || ImageGallery;
      expect(Component).toBeDefined();
      expect(Component.$$typeof).toBeDefined();
    });

    it("renders correctly when required from build", () => {
      const ImageGallery = require("../../build/image-gallery.umd.js");
      const Component = ImageGallery.default || ImageGallery;

      const items = [
        { original: "test1.jpg", thumbnail: "thumb1.jpg" },
        { original: "test2.jpg", thumbnail: "thumb2.jpg" },
      ];

      const { container } = render(<Component items={items} />);

      expect(container.querySelector(".image-gallery")).toBeInTheDocument();
      // With infinite mode (default), 2 items + 2 clones = 4 slides
      expect(container.querySelectorAll(".image-gallery-slide").length).toBe(4);
    });
  });

  describe("CSS Bundle", () => {
    let buildCss: string;
    let sourceCss: string;

    beforeAll(() => {
      buildCss = fs.readFileSync(
        path.join(ROOT, "build/image-gallery.css"),
        "utf8"
      );
      sourceCss = fs.readFileSync(
        path.join(ROOT, "styles/image-gallery.css"),
        "utf8"
      );
    });

    it("build CSS is minified (smaller than source)", () => {
      expect(buildCss.length).toBeLessThan(sourceCss.length);
    });

    it("build CSS contains essential class selectors", () => {
      expect(buildCss).toContain(".image-gallery");
      expect(buildCss).toContain(".image-gallery-slide");
      expect(buildCss).toContain(".image-gallery-thumbnail");
      expect(buildCss).toContain(".image-gallery-icon");
    });

    it("source CSS contains CSS custom properties for theming", () => {
      expect(sourceCss).toContain("--ig-primary-color");
      expect(sourceCss).toContain("--ig-white");
      expect(sourceCss).toContain("--ig-black");
      expect(sourceCss).toContain("--ig-thumbnail-size");
    });
  });

  describe("package.json Configuration", () => {
    let pkg: PackageJson;

    beforeAll(() => {
      pkg = JSON.parse(
        fs.readFileSync(path.join(ROOT, "package.json"), "utf8")
      ) as PackageJson;
    });

    it("main field points to UMD build (CommonJS entry)", () => {
      expect(pkg.main).toBe("./build/image-gallery.umd.js");
    });

    it("module field points to ES build (ES module entry)", () => {
      expect(pkg.module).toBe("./build/image-gallery.es.js");
    });

    it("exports field configures both import and require", () => {
      expect(pkg.exports).toBeDefined();
      expect(pkg.exports["."]).toBeDefined();
      expect(pkg.exports["."].import).toBe("./build/image-gallery.es.js");
      expect(pkg.exports["."].require).toBe("./build/image-gallery.umd.js");
    });

    it("files array includes build and styles directories", () => {
      expect(pkg.files).toContain("build");
      expect(pkg.files).toContain("styles");
    });

    it("peerDependencies includes React", () => {
      expect(pkg.peerDependencies).toBeDefined();
      expect(pkg.peerDependencies.react).toBeDefined();
    });

    it("does not bundle React as a dependency", () => {
      // React should be a peerDependency, not a regular dependency
      expect(pkg.dependencies?.react).toBeUndefined();
    });
  });

  describe("Import Path Verification (what users type)", () => {
    it('ES import: import ImageGallery from "react-image-gallery" works', async () => {
      // Simulates: import ImageGallery from "react-image-gallery"
      // This resolves to pkg.module -> ./build/image-gallery.es.js
      // @ts-expect-error - Build output doesn't have declaration file
      const module = await import("../../build/image-gallery.es.js");
      expect(module.default).toBeDefined();
    });

    it('CommonJS: require("react-image-gallery") works', () => {
      // Simulates: const ImageGallery = require("react-image-gallery")
      // This resolves to pkg.main -> ./build/image-gallery.umd.js

      const ImageGallery = require("../../build/image-gallery.umd.js");
      expect(ImageGallery.default || ImageGallery).toBeDefined();
    });

    it("CSS import path exists: react-image-gallery/styles/image-gallery.css", () => {
      // Simulates: import "react-image-gallery/styles/image-gallery.css"
      const cssPath = path.join(ROOT, "styles/image-gallery.css");
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    it("CSS import path exists: react-image-gallery/build/image-gallery.css", () => {
      // Simulates: import "react-image-gallery/build/image-gallery.css"
      const cssPath = path.join(ROOT, "build/image-gallery.css");
      expect(fs.existsSync(cssPath)).toBe(true);
    });
  });
});
