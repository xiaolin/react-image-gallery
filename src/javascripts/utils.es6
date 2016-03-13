export default {
  clamp (number, max, min = 0) {
    if (max < min) {throw "Max value of range must be bigger than min value";}
    Math.min(Math.max(min, number), max);
  }
};
