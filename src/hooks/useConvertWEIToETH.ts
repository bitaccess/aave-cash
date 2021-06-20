import { JSBI } from '@uniswap/sdk'

const WEI_PER_ETH = '1000000000000000000'

export default function useConvertWEIToETH(value: string): JSBI {
  return JSBI.divide(JSBI.BigInt(value), JSBI.BigInt(WEI_PER_ETH))
}
