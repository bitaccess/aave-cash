export const roundDownToMultiple = (value: number, roundTo: number): number => {
  return Math.floor(value / roundTo) * roundTo
}
