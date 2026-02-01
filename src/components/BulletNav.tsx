import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

interface BulletNavProps {
  bullets?: React.ReactNode[];
  slideVertically?: boolean;
  currentIndex?: number;
  maxBullets?: number;
}

/**
 * Bullet navigation component with optional sliding window
 * When maxBullets is set, bullets slide to keep the active bullet centered
 */
const BulletNav = memo<BulletNavProps>(function BulletNav({
  bullets = [],
  slideVertically = false,
  currentIndex = 0,
  maxBullets: maxBulletsProp,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bulletSize, setBulletSize] = useState(0);

  // Enforce minimum of 3 for maxBullets (anything less makes no sense)
  const maxBullets =
    maxBulletsProp !== undefined && maxBulletsProp < 3 ? 3 : maxBulletsProp;

  const bulletsClass = clsx("image-gallery-bullets", {
    "image-gallery-bullets-vertical": slideVertically,
  });

  // Measure bullet size on mount and when bullets change
  useEffect(() => {
    const measureBulletSize = () => {
      if (containerRef.current && maxBullets && bullets.length > 0) {
        const firstBullet = containerRef.current.querySelector(
          ".image-gallery-bullet"
        ) as HTMLElement;
        if (firstBullet) {
          // Get computed style to include margins
          const style = window.getComputedStyle(firstBullet);
          const width = firstBullet.offsetWidth;
          const marginLeft = parseFloat(style.marginLeft) || 0;
          const marginRight = parseFloat(style.marginRight) || 0;
          const height = firstBullet.offsetHeight;
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;

          const size = slideVertically
            ? height + marginTop + marginBottom
            : width + marginLeft + marginRight;
          setBulletSize(size);
        }
      }
    };

    measureBulletSize();

    // Add resize observer to remeasure on window resize
    const resizeObserver = new ResizeObserver(() => {
      measureBulletSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [bullets.length, maxBullets, slideVertically]);

  // Calculate the translation to center the active bullet
  const translateStyle = useMemo(() => {
    if (!maxBullets || maxBullets >= bullets.length || bulletSize === 0) {
      return {};
    }

    const total = bullets.length;
    const half = Math.floor(maxBullets / 2);

    let offset: number;

    if (currentIndex <= half) {
      // Near the beginning - no translation needed
      offset = 0;
    } else if (currentIndex >= total - half - 1) {
      // Near the end - translate to show last maxBullets
      offset = -(total - maxBullets) * bulletSize;
    } else {
      // In the middle - center the current bullet
      offset = -(currentIndex - half) * bulletSize;
    }

    return {
      transform: slideVertically
        ? `translateY(${offset}px)`
        : `translateX(${offset}px)`,
      transition: "transform 0.3s ease-out",
    };
  }, [bullets.length, currentIndex, maxBullets, bulletSize, slideVertically]);

  // Calculate container size to show only maxBullets
  const containerStyle = useMemo(() => {
    if (!maxBullets || maxBullets >= bullets.length || bulletSize === 0) {
      return {};
    }

    const size = maxBullets * bulletSize;
    return slideVertically
      ? { height: `${size}px`, overflow: "hidden" }
      : { width: `${size}px`, overflow: "hidden" };
  }, [maxBullets, bullets.length, bulletSize, slideVertically]);

  if (!bullets || bullets.length === 0) {
    return null;
  }

  return (
    <div className={bulletsClass}>
      <div
        aria-label="Bullet Navigation"
        className="image-gallery-bullets-container"
        role="navigation"
        style={containerStyle}
      >
        <div
          ref={containerRef}
          className="image-gallery-bullets-inner"
          style={translateStyle}
        >
          {bullets}
        </div>
      </div>
    </div>
  );
});

export default BulletNav;
