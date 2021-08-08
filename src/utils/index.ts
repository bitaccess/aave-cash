import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber as BigNumberEthers } from '@ethersproject/bignumber'
import { ChainId, JSBI, Percent, Token, Currency, ETHER } from '@uniswap/sdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { toBigNumber, BigNumber } from './BigNumber'
import padLeft from 'pad-left'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.'
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumberEthers): BigNumberEthers {
  return value.mul(BigNumberEthers.from(10000).add(BigNumberEthers.from(1000))).div(BigNumberEthers.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function raytoPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(1000000000000000000000000000))
}

export function rayToNumber(num: number): BigNumber {
  return toBigNumber(num).div(10e17)
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function removeEmpty(obj: object) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))
}

export function convertDateString(dateString: string): string {
  return new Date(Date.parse(dateString)).toLocaleString()
}

function formatTimePart(part: number): string {
  return padLeft(part.toString(), 2, '0')
}

export function secondsToTime(secs: number): { hours: string; minutes: string; seconds: string } {
  const hours = formatTimePart(Math.floor(secs / (60 * 60)))
  const divisorForMinutes = secs % (60 * 60)
  const minutes = formatTimePart(Math.floor(divisorForMinutes / 60))
  const divisorForSeconds = divisorForMinutes % 60
  const seconds = formatTimePart(Math.floor(divisorForSeconds))
  let timeObj: { hours: string; minutes: string; seconds: string } = { hours, minutes, seconds }
  // no negative
  if (parseInt(seconds) < 0) {
    timeObj = { hours: '0', minutes: '00', seconds: '00' }
  }
  return timeObj
}

export function calcDistance(coor1: any, coor2: any) {
  const x = coor2.coordinates.latitude - coor1.coordinates.latitude
  const y = coor2.coordinates.longitude - coor1.coordinates.longitude
  return Math.sqrt(x * x + y * y)
}

export function sortBTMLocationsByDistance(coordinates: any, point: any) {
  const sorter = (a: any, b: any) => calcDistance(a, point) - calcDistance(b, point)
  return coordinates.sort(sorter)
}
