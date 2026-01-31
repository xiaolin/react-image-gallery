import React from "react";
import { number, oneOf, string } from "prop-types";

const left = <polyline points="15 18 9 12 15 6" />;
const right = <polyline points="9 18 15 12 9 6" />;
const top = <polyline points="6 15 12 9 18 15" />;
const bottom = <polyline points="6 9 12 15 18 9" />;
const maximize = <path d="M8 3H3v5m18 0V3h-5m0 18h5v-5M3 16v5h5" />;
const minimize = <path d="M8 3v5H3m18 0h-5V3m0 18v-5h5M3 16h5v5" />;
const play = <polygon points="5 3 19 12 5 21 5 3" />;
const pause = (
  <React.Fragment>
    <rect height="16" width="4" x="6" y="4" />
    <rect height="16" width="4" x="14" y="4" />
  </React.Fragment>
);

const iconMapper = {
  left,
  right,
  top,
  bottom,
  maximize,
  minimize,
  play,
  pause,
};

const defaultProps = {
  strokeWidth: 1,
  viewBox: "0 0 24 24",
};

const SVG = (props) => {
  const { strokeWidth, viewBox, icon } = { ...defaultProps, ...props };
  return (
    <svg
      className="image-gallery-svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeWidth={strokeWidth}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconMapper[icon]}
    </svg>
  );
};

SVG.propTypes = {
  icon: oneOf([
    "left",
    "right",
    "top",
    "bottom",
    "maximize",
    "minimize",
    "play",
    "pause",
  ]).isRequired,
  strokeWidth: number,
  viewBox: string,
};

export default SVG;
