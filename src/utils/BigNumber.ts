import BigNumber from 'bignumber.js'

BigNumber.set({ ROUNDING_MODE: 4 })

const ZERO = new BigNumber(0)
const ONE = new BigNumber(1)
const TEN = new BigNumber(10)
const HUNDRED = new BigNumber(100)
const THOUSAND = new BigNumber(1000)

export { BigNumber, ZERO, ONE, TEN, HUNDRED, HUNDRED as ONE_HUNDRED, THOUSAND }

export type Numerical = BigNumber | number | string

export function toBigNumber(value: Numerical = 0): BigNumber {
  if (value === '0x') {
    value = 0
  }
  if (!(value instanceof BigNumber)) {
    try {
      const bn = new BigNumber(String(value))
      return bn
    } catch (e) {
      return ZERO
    }
  }
  return value
}

export function isBigNumber(value: any): boolean {
  return value instanceof BigNumber
}

export function toNumber(value: Numerical = 0): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    value = toBigNumber(value)
  }
  if (value instanceof BigNumber) {
    return value.toNumber()
  }
  return 0
}

export function toMainDenomination(value: Numerical, decimals: number): BigNumber {
  value = toBigNumber(value)
  const power = TEN.pow(decimals)
  return value.div(power)
}

export function toSmallestDenomination(value: Numerical, decimals: number): BigNumber {
  value = toBigNumber(value)
  const power = TEN.pow(decimals)
  return value.times(power)
}

export function toPrecision(amount: Numerical, decimals: number): BigNumber {
  amount = toBigNumber(amount)
  const power = TEN.pow(decimals)
  return amount.times(power).div(power)
}

export function toUnit(amount: Numerical, rate: Numerical, decimals: number, rateFrom: boolean): BigNumber {
  amount = toBigNumber(amount)
  rate = toBigNumber(rate)
  const conversion = rateFrom ? amount.div(rate) : amount.times(rate)
  return toPrecision(conversion, decimals)
}

export function toPercentage(amount: Numerical, total: Numerical): BigNumber {
  amount = toBigNumber(amount)
  total = toBigNumber(total)
  return amount.div(total).times(100)
}
