export const roundToDecimals = (value: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};
