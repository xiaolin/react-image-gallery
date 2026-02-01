import {
  calculateMomentum,
  calculateMomentumDistance,
  calculateTransitionDuration,
  clampTranslate,
  getMomentumDirection,
} from "./thumbnailMomentum";

describe("thumbnailMomentum", () => {
  describe("calculateMomentumDistance", () => {
    it("calculates momentum distance based on velocity and multiplier", () => {
      expect(calculateMomentumDistance(1, 150)).toBe(150);
      expect(calculateMomentumDistance(2, 150)).toBe(300);
      expect(calculateMomentumDistance(0.5, 150)).toBe(75);
    });

    it("uses default multiplier of 150 when not specified", () => {
      expect(calculateMomentumDistance(1)).toBe(150);
      expect(calculateMomentumDistance(2)).toBe(300);
    });

    it("handles zero velocity", () => {
      expect(calculateMomentumDistance(0, 150)).toBe(0);
    });

    it("handles high velocity values", () => {
      expect(calculateMomentumDistance(5, 150)).toBe(750);
    });
  });

  describe("getMomentumDirection", () => {
    describe("horizontal thumbnail bar (bottom/top)", () => {
      it("returns positive for Right swipe", () => {
        expect(getMomentumDirection("Right", false)).toBe(1);
      });

      it("returns negative for Left swipe", () => {
        expect(getMomentumDirection("Left", false)).toBe(-1);
      });

      it("returns negative for Up swipe (not primary direction)", () => {
        expect(getMomentumDirection("Up", false)).toBe(-1);
      });

      it("returns negative for Down swipe (not primary direction)", () => {
        expect(getMomentumDirection("Down", false)).toBe(-1);
      });
    });

    describe("vertical thumbnail bar (left/right)", () => {
      it("returns positive for Down swipe", () => {
        expect(getMomentumDirection("Down", true)).toBe(1);
      });

      it("returns negative for Up swipe", () => {
        expect(getMomentumDirection("Up", true)).toBe(-1);
      });

      it("returns negative for Left swipe (not primary direction)", () => {
        expect(getMomentumDirection("Left", true)).toBe(-1);
      });

      it("returns negative for Right swipe (not primary direction)", () => {
        expect(getMomentumDirection("Right", true)).toBe(-1);
      });
    });
  });

  describe("clampTranslate", () => {
    it("clamps positive values to 0 (start boundary)", () => {
      expect(clampTranslate(100, 500)).toBe(0);
      expect(clampTranslate(50, 500)).toBe(0);
    });

    it("clamps negative values to -maxScroll", () => {
      expect(clampTranslate(-600, 500, 20)).toBe(-500);
      expect(clampTranslate(-1000, 500, 20)).toBe(-500);
    });

    it("allows values within valid range", () => {
      expect(clampTranslate(-100, 500, 20)).toBe(-100);
      expect(clampTranslate(-250, 500, 20)).toBe(-250);
      expect(clampTranslate(0, 500, 20)).toBe(0);
    });

    it("allows translate of exactly 0 at start", () => {
      expect(clampTranslate(0, 500)).toBe(0);
    });

    it("uses default emptySpaceMargin of 0 (strict bounds)", () => {
      expect(clampTranslate(100, 500)).toBe(0);
    });
  });

  describe("calculateTransitionDuration", () => {
    it("increases duration based on velocity", () => {
      expect(calculateTransitionDuration(0, 450)).toBe(450);
      expect(calculateTransitionDuration(1, 450)).toBe(550);
      expect(calculateTransitionDuration(1.5, 450)).toBe(600); // capped at 600
    });

    it("caps duration at maxDuration", () => {
      expect(calculateTransitionDuration(5, 450, 600)).toBe(600);
      expect(calculateTransitionDuration(10, 450, 600)).toBe(600);
    });

    it("uses default values when not specified", () => {
      expect(calculateTransitionDuration(0)).toBe(450);
      expect(calculateTransitionDuration(1)).toBe(550);
    });

    it("respects custom maxDuration", () => {
      expect(calculateTransitionDuration(5, 450, 800)).toBe(800);
      expect(calculateTransitionDuration(2, 450, 500)).toBe(500);
    });
  });

  describe("calculateMomentum", () => {
    const baseConfig = {
      velocity: 1,
      direction: "Left",
      isVertical: false,
      currentTranslate: 0,
      scrollSize: 800,
      wrapperSize: 400,
      slideDuration: 450,
    };

    it("calculates momentum for left swipe on horizontal bar", () => {
      const result = calculateMomentum(baseConfig);

      // velocity 1 * multiplier 150 * direction -1 = -150
      // currentTranslate 0 + momentum -150 = -150
      expect(result.targetTranslate).toBe(-150);
    });

    it("calculates momentum for right swipe on horizontal bar", () => {
      const result = calculateMomentum({
        ...baseConfig,
        direction: "Right",
        currentTranslate: -200,
      });

      // velocity 1 * multiplier 150 * direction 1 = 150
      // currentTranslate -200 + momentum 150 = -50
      expect(result.targetTranslate).toBe(-50);
    });

    it("calculates momentum for up swipe on vertical bar", () => {
      const result = calculateMomentum({
        ...baseConfig,
        direction: "Up",
        isVertical: true,
      });

      // velocity 1 * multiplier 150 * direction -1 = -150
      expect(result.targetTranslate).toBe(-150);
    });

    it("calculates momentum for down swipe on vertical bar", () => {
      const result = calculateMomentum({
        ...baseConfig,
        direction: "Down",
        isVertical: true,
        currentTranslate: -200,
      });

      // velocity 1 * multiplier 150 * direction 1 = 150
      // currentTranslate -200 + momentum 150 = -50
      expect(result.targetTranslate).toBe(-50);
    });

    it("clamps to start boundary when swiping too far right", () => {
      const result = calculateMomentum({
        ...baseConfig,
        velocity: 2,
        direction: "Right",
        currentTranslate: 0,
      });

      // Would be 0 + 300 = 300, but clamped to 0 (start boundary)
      expect(result.targetTranslate).toBe(0);
    });

    it("clamps to end boundary when swiping too far left", () => {
      const result = calculateMomentum({
        ...baseConfig,
        velocity: 3,
        direction: "Left",
        currentTranslate: -300,
      });

      // maxScroll = 800 - 400 = 400
      // Would be -300 + (-450) = -750, but clamped to -400
      expect(result.targetTranslate).toBe(-400);
    });

    it("scales transition duration with velocity", () => {
      const lowVelocity = calculateMomentum({ ...baseConfig, velocity: 0.5 });
      const highVelocity = calculateMomentum({ ...baseConfig, velocity: 2 });

      expect(lowVelocity.transitionDuration).toBe(500); // 450 + 0.5 * 100
      expect(highVelocity.transitionDuration).toBe(600); // 450 + 200, capped at 600
    });

    it("generates correct transition style string", () => {
      const result = calculateMomentum(baseConfig);

      expect(result.transitionStyle).toBe(
        "all 550ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      );
    });

    it("uses custom momentumMultiplier", () => {
      const result = calculateMomentum({
        ...baseConfig,
        momentumMultiplier: 200,
      });

      // velocity 1 * multiplier 200 * direction -1 = -200
      expect(result.targetTranslate).toBe(-200);
    });

    it("allows custom emptySpaceMargin if explicitly set", () => {
      const result = calculateMomentum({
        ...baseConfig,
        velocity: 2,
        direction: "Right",
        currentTranslate: 0,
        emptySpaceMargin: 50,
      });

      // Would be 0 + 300 = 300, but clamped to custom emptySpaceMargin (50)
      expect(result.targetTranslate).toBe(50);
    });

    it("handles zero velocity (no momentum)", () => {
      const result = calculateMomentum({
        ...baseConfig,
        velocity: 0,
        currentTranslate: -100,
      });

      // No momentum added, stays at current position
      expect(result.targetTranslate).toBe(-100);
      expect(result.transitionDuration).toBe(450);
    });

    it("handles case where thumbnails fit within wrapper (no scrolling needed)", () => {
      const result = calculateMomentum({
        ...baseConfig,
        scrollSize: 300, // smaller than wrapper
        wrapperSize: 400,
      });

      // maxScroll would be negative, so no clamping occurs on the negative side
      // but still clamped to emptySpaceMargin on positive side
      expect(result.targetTranslate).toBe(-150);
    });
  });
});
