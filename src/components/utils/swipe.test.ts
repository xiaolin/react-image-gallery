import {
  DEFAULT_FLICK_THRESHOLD,
  DEFAULT_SLIDE_DURATION,
  DEFAULT_SWIPE_THRESHOLD,
} from "../constants";
import {
  calculateSwipeOffset,
  computeSlideTarget,
  computeTargetDisplayIndex,
  computeVelocityDuration,
  getSwipeDirection,
  isFlickSwipe,
  isSufficientSwipe,
  shouldIgnoreSwipeDirection,
} from "./swipe";

describe("isSufficientSwipe", () => {
  it("returns true when offset exceeds threshold", () => {
    expect(isSufficientSwipe(31, DEFAULT_SWIPE_THRESHOLD)).toBe(true);
  });

  it("returns true for negative offset exceeding threshold", () => {
    expect(isSufficientSwipe(-31, DEFAULT_SWIPE_THRESHOLD)).toBe(true);
  });

  it("returns false when offset equals threshold", () => {
    expect(isSufficientSwipe(30, DEFAULT_SWIPE_THRESHOLD)).toBe(false);
  });

  it("returns false when offset is below threshold", () => {
    expect(isSufficientSwipe(10, DEFAULT_SWIPE_THRESHOLD)).toBe(false);
  });

  it("returns false for zero offset", () => {
    expect(isSufficientSwipe(0, DEFAULT_SWIPE_THRESHOLD)).toBe(false);
  });

  it("works with custom threshold", () => {
    expect(isSufficientSwipe(15, 10)).toBe(true);
    expect(isSufficientSwipe(5, 10)).toBe(false);
  });
});

describe("calculateSwipeOffset", () => {
  const width = 800;
  const height = 600;

  describe("horizontal mode", () => {
    it("returns negative percentage for left swipe", () => {
      const offset = calculateSwipeOffset(400, 0, width, height, "Left", false);
      expect(offset).toBe(-50);
    });

    it("returns positive percentage for right swipe", () => {
      const offset = calculateSwipeOffset(
        200,
        0,
        width,
        height,
        "Right",
        false
      );
      expect(offset).toBe(25);
    });

    it("clamps to -100 for left swipe past full width", () => {
      const offset = calculateSwipeOffset(
        1000,
        0,
        width,
        height,
        "Left",
        false
      );
      expect(offset).toBe(-100);
    });

    it("clamps to 100 for right swipe past full width", () => {
      const offset = calculateSwipeOffset(
        1000,
        0,
        width,
        height,
        "Right",
        false
      );
      expect(offset).toBe(100);
    });

    it("returns 0 for zero movement", () => {
      const offset = calculateSwipeOffset(0, 0, width, height, "Left", false);
      expect(offset).toBe(-0); // -1 * 0
    });
  });

  describe("vertical mode", () => {
    it("returns negative percentage for up swipe", () => {
      const offset = calculateSwipeOffset(0, 300, width, height, "Up", true);
      expect(offset).toBe(-50);
    });

    it("returns positive percentage for down swipe", () => {
      const offset = calculateSwipeOffset(0, 150, width, height, "Down", true);
      expect(offset).toBe(25);
    });

    it("clamps to -100 for up swipe past full height", () => {
      const offset = calculateSwipeOffset(0, 900, width, height, "Up", true);
      expect(offset).toBe(-100);
    });

    it("clamps to 100 for down swipe past full height", () => {
      const offset = calculateSwipeOffset(0, 900, width, height, "Down", true);
      expect(offset).toBe(100);
    });
  });

  it("uses gallery width at exactly 100% produces clamped value", () => {
    const offset = calculateSwipeOffset(800, 0, width, height, "Left", false);
    expect(offset).toBe(-100);
  });
});

describe("getSwipeDirection", () => {
  describe("horizontal mode (LTR)", () => {
    it("returns 1 for Left swipe (next slide)", () => {
      expect(getSwipeDirection("Left", false, false)).toBe(1);
    });

    it("returns -1 for Right swipe (previous slide)", () => {
      expect(getSwipeDirection("Right", false, false)).toBe(-1);
    });
  });

  describe("horizontal mode (RTL)", () => {
    it("returns -1 for Left swipe (previous slide in RTL)", () => {
      expect(getSwipeDirection("Left", true, false)).toBe(-1);
    });

    it("returns 1 for Right swipe (next slide in RTL)", () => {
      expect(getSwipeDirection("Right", true, false)).toBe(1);
    });
  });

  describe("vertical mode", () => {
    it("returns 1 for Up swipe (next slide)", () => {
      expect(getSwipeDirection("Up", false, true)).toBe(1);
    });

    it("returns -1 for Down swipe (previous slide)", () => {
      expect(getSwipeDirection("Down", false, true)).toBe(-1);
    });

    it("ignores RTL in vertical mode", () => {
      expect(getSwipeDirection("Up", true, true)).toBe(1);
      expect(getSwipeDirection("Down", true, true)).toBe(-1);
    });
  });
});

describe("isFlickSwipe", () => {
  describe("horizontal mode", () => {
    it("returns true for fast left swipe", () => {
      expect(isFlickSwipe(0.8, DEFAULT_FLICK_THRESHOLD, "Left", false)).toBe(
        true
      );
    });

    it("returns true for fast right swipe", () => {
      expect(isFlickSwipe(0.5, DEFAULT_FLICK_THRESHOLD, "Right", false)).toBe(
        true
      );
    });

    it("returns false for slow swipe", () => {
      expect(isFlickSwipe(0.2, DEFAULT_FLICK_THRESHOLD, "Left", false)).toBe(
        false
      );
    });

    it("returns false at exactly the threshold", () => {
      expect(isFlickSwipe(0.4, DEFAULT_FLICK_THRESHOLD, "Left", false)).toBe(
        false
      );
    });

    it("returns false for up/down swipes in horizontal mode", () => {
      expect(isFlickSwipe(1.0, DEFAULT_FLICK_THRESHOLD, "Up", false)).toBe(
        false
      );
      expect(isFlickSwipe(1.0, DEFAULT_FLICK_THRESHOLD, "Down", false)).toBe(
        false
      );
    });
  });

  describe("vertical mode", () => {
    it("returns true for fast up swipe", () => {
      expect(isFlickSwipe(0.8, DEFAULT_FLICK_THRESHOLD, "Up", true)).toBe(true);
    });

    it("returns true for fast down swipe", () => {
      expect(isFlickSwipe(0.5, DEFAULT_FLICK_THRESHOLD, "Down", true)).toBe(
        true
      );
    });

    it("returns false for left/right swipes in vertical mode", () => {
      expect(isFlickSwipe(1.0, DEFAULT_FLICK_THRESHOLD, "Left", true)).toBe(
        false
      );
      expect(isFlickSwipe(1.0, DEFAULT_FLICK_THRESHOLD, "Right", true)).toBe(
        false
      );
    });
  });

  it("works with custom threshold", () => {
    expect(isFlickSwipe(0.3, 0.2, "Left", false)).toBe(true);
    expect(isFlickSwipe(0.1, 0.2, "Left", false)).toBe(false);
  });
});

describe("computeSlideTarget", () => {
  const canSlide = { left: true, right: true };

  it("advances by +1 on sufficient forward swipe", () => {
    expect(
      computeSlideTarget(
        2,
        1,
        true,
        false,
        false,
        canSlide.left,
        canSlide.right
      )
    ).toBe(3);
  });

  it("goes back by -1 on sufficient backward swipe", () => {
    expect(
      computeSlideTarget(
        2,
        -1,
        true,
        false,
        false,
        canSlide.left,
        canSlide.right
      )
    ).toBe(1);
  });

  it("advances on flick even without sufficient offset", () => {
    expect(
      computeSlideTarget(
        2,
        1,
        false,
        true,
        false,
        canSlide.left,
        canSlide.right
      )
    ).toBe(3);
  });

  it("stays put when neither sufficient nor flick", () => {
    expect(
      computeSlideTarget(
        2,
        1,
        false,
        false,
        false,
        canSlide.left,
        canSlide.right
      )
    ).toBe(2);
  });

  it("stays put when transitioning", () => {
    expect(
      computeSlideTarget(2, 1, true, true, true, canSlide.left, canSlide.right)
    ).toBe(2);
  });

  it("stays put when cannot slide left (backward swipe)", () => {
    expect(computeSlideTarget(0, -1, true, false, false, false, true)).toBe(0);
  });

  it("stays put when cannot slide right (forward swipe)", () => {
    expect(computeSlideTarget(4, 1, true, false, false, true, false)).toBe(4);
  });

  it("allows backward swipe when can slide left", () => {
    expect(computeSlideTarget(2, -1, true, false, false, true, true)).toBe(1);
  });

  it("stays at index 0 with backward swipe and no left slide", () => {
    expect(computeSlideTarget(0, -1, true, true, false, false, true)).toBe(0);
  });
});

describe("computeTargetDisplayIndex", () => {
  describe("infinite mode with multiple slides", () => {
    const totalSlides = 5;
    const totalDisplaySlides = 7; // 5 + 2 clones

    it("returns slideTo + 1 for normal navigation (clone offset)", () => {
      expect(
        computeTargetDisplayIndex(2, totalSlides, totalDisplaySlides, true)
      ).toBe(3);
    });

    it("returns 0 for wrapping past first slide (slideTo < 0)", () => {
      expect(
        computeTargetDisplayIndex(-1, totalSlides, totalDisplaySlides, true)
      ).toBe(0);
    });

    it("returns totalDisplaySlides - 1 for wrapping past last slide", () => {
      expect(
        computeTargetDisplayIndex(5, totalSlides, totalDisplaySlides, true)
      ).toBe(6);
    });

    it("handles first slide (index 0)", () => {
      expect(
        computeTargetDisplayIndex(0, totalSlides, totalDisplaySlides, true)
      ).toBe(1);
    });

    it("handles last slide (index 4)", () => {
      expect(
        computeTargetDisplayIndex(4, totalSlides, totalDisplaySlides, true)
      ).toBe(5);
    });
  });

  describe("non-infinite mode", () => {
    const totalSlides = 5;
    const totalDisplaySlides = 5; // no clones

    it("returns slideTo directly (no clone offset)", () => {
      expect(
        computeTargetDisplayIndex(2, totalSlides, totalDisplaySlides, false)
      ).toBe(2);
    });

    it("returns 0 for negative slideTo", () => {
      expect(
        computeTargetDisplayIndex(-1, totalSlides, totalDisplaySlides, false)
      ).toBe(0);
    });

    it("clamps to last slide for overshooting slideTo", () => {
      expect(
        computeTargetDisplayIndex(5, totalSlides, totalDisplaySlides, false)
      ).toBe(4);
    });

    it("handles first slide", () => {
      expect(
        computeTargetDisplayIndex(0, totalSlides, totalDisplaySlides, false)
      ).toBe(0);
    });

    it("handles last slide", () => {
      expect(
        computeTargetDisplayIndex(4, totalSlides, totalDisplaySlides, false)
      ).toBe(4);
    });
  });

  describe("single slide", () => {
    it("infinite mode with 1 slide uses slideTo directly (no clones)", () => {
      // totalSlides <= 1, so infinite clone logic is skipped
      expect(computeTargetDisplayIndex(0, 1, 1, true)).toBe(0);
    });
  });
});

describe("computeVelocityDuration", () => {
  const galleryDimension = 800;

  it("computes duration from remaining distance and velocity", () => {
    // Swiped 60%, advancing to next slide → 40% remaining
    // remainingPx = 0.4 * 800 = 320, velocity = 1.0 → 320ms
    const duration = computeVelocityDuration(
      60,
      3,
      2,
      1.0,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(320);
  });

  it("uses swipedPercent as remaining when snapping back", () => {
    // Swiped 20%, staying on same slide → remaining = 20%
    // remainingPx = 0.2 * 800 = 160, velocity = 0.5 → 320ms
    const duration = computeVelocityDuration(
      20,
      2,
      2,
      0.5,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(320);
  });

  it("clamps to minimum 80ms for very fast swipes", () => {
    // Swiped 95%, advancing → 5% remaining
    // remainingPx = 0.05 * 800 = 40, velocity = 2.0 → 20ms → clamped to 80ms
    const duration = computeVelocityDuration(
      95,
      3,
      2,
      2.0,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(80);
  });

  it("clamps to slideDuration for very slow swipes", () => {
    // Swiped 10%, advancing → 90% remaining
    // remainingPx = 0.9 * 800 = 720, velocity = 0.1 → 7200ms → clamped to 550ms
    const duration = computeVelocityDuration(
      10,
      3,
      2,
      0.1,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(DEFAULT_SLIDE_DURATION);
  });

  it("returns slideDuration when velocity is 0", () => {
    const duration = computeVelocityDuration(
      50,
      3,
      2,
      0,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(DEFAULT_SLIDE_DURATION);
  });

  it("handles negative finalOffset (treats as absolute)", () => {
    // finalOffset = -60, advancing → remaining = 40%
    const duration = computeVelocityDuration(
      -60,
      1,
      2,
      1.0,
      DEFAULT_SLIDE_DURATION,
      galleryDimension
    );
    expect(duration).toBe(320);
  });

  it("works with custom slideDuration", () => {
    const customDuration = 300;
    // remainingPx = 0.5 * 800 = 400, velocity = 0.5 → 800ms → clamped to 300ms
    const duration = computeVelocityDuration(
      50,
      3,
      2,
      0.5,
      customDuration,
      galleryDimension
    );
    expect(duration).toBe(customDuration);
  });
});

describe("shouldIgnoreSwipeDirection", () => {
  describe("horizontal mode", () => {
    it("does not ignore Left swipe", () => {
      expect(shouldIgnoreSwipeDirection("Left", false)).toBe(false);
    });

    it("does not ignore Right swipe", () => {
      expect(shouldIgnoreSwipeDirection("Right", false)).toBe(false);
    });

    it("ignores Up swipe", () => {
      expect(shouldIgnoreSwipeDirection("Up", false)).toBe(true);
    });

    it("ignores Down swipe", () => {
      expect(shouldIgnoreSwipeDirection("Down", false)).toBe(true);
    });
  });

  describe("vertical mode", () => {
    it("ignores Left swipe", () => {
      expect(shouldIgnoreSwipeDirection("Left", true)).toBe(true);
    });

    it("ignores Right swipe", () => {
      expect(shouldIgnoreSwipeDirection("Right", true)).toBe(true);
    });

    it("does not ignore Up swipe", () => {
      expect(shouldIgnoreSwipeDirection("Up", true)).toBe(false);
    });

    it("does not ignore Down swipe", () => {
      expect(shouldIgnoreSwipeDirection("Down", true)).toBe(false);
    });
  });
});
