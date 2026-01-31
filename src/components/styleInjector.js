/**
 * Style injection utility for react-image-gallery
 * This allows the component to work with zero CSS setup from consumers.
 * The CSS is bundled at build time and injected automatically.
 *
 * CSS Custom Properties available for theming:
 * --ig-primary-color: Primary color (default: #337ab7)
 * --ig-white: White color (default: #fff)
 * --ig-black: Black color (default: #000)
 * --ig-background-overlay: Background overlay color (default: rgba(0,0,0,0.4))
 * --ig-thumbnail-size: Thumbnail size (default: 100px)
 * --ig-thumbnail-size-small: Thumbnail size on small screens (default: 81px)
 * --ig-thumbnail-border-width: Thumbnail border width (default: 4px)
 * --ig-thumbnail-border-width-small: Thumbnail border width on small screens (default: 3px)
 * --ig-bullet-size: Bullet size (default: 5px)
 * --ig-bullet-size-small: Bullet size on small screens (default: 3px)
 */

/* global __GALLERY_CSS__ */

let stylesInjected = false;

// CSS will be defined at build time via DefinePlugin
const GALLERY_CSS =
  typeof __GALLERY_CSS__ !== "undefined" ? __GALLERY_CSS__ : "";

export function injectStyles() {
  if (stylesInjected || typeof document === "undefined") {
    return;
  }

  // Don't inject if CSS wasn't bundled (development mode)
  if (!GALLERY_CSS) {
    return;
  }

  // Check if styles already exist (user may have imported CSS manually)
  if (document.querySelector("style[data-image-gallery]")) {
    stylesInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-image-gallery", "");
  style.textContent = GALLERY_CSS;
  document.head.appendChild(style);
  stylesInjected = true;
}

export function resetStylesInjected() {
  // For testing purposes
  stylesInjected = false;
}
