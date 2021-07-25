//formatting functions

export const roundToMillion = (n: number) => {
  let result = (n / 1_000_000).toFixed(1);

  return result === "0.0" ? "<0.1" : result;
};
