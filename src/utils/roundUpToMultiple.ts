export const roundUpToMultiple = (value: number, roundTo: number): number => {
  return Math.ceil(value / roundTo) * roundTo
}
