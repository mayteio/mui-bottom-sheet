/**
 * Find the closest value in an array to a given value
 * @param goal target value
 * @param numbers array of numbers to search through
 */
export const closest = (goal: number, numbers: number[]) =>
  numbers.reduce((prev, pos) =>
    Math.abs(pos - goal) < Math.abs(prev - goal) ? pos : prev
  );
