import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import {
  useProtocolDataProviderContract,
  usePriceOracleContract,
  useLendingPoolContract,
  useWETHGatewayContract,
  useLendingPoolAddressProviderContract,
  useUSDCContract
} from '../../hooks/useContract'
import { Result, useSingleCallResult } from '../multicall/hooks'
import { useActiveWeb3React } from '../../hooks'
import { Currency, CurrencyAmount } from '@uniswap/sdk'
import { toBigNumber, BigNumber } from 'utils/BigNumber'
import { useTransactionAdder } from 'state/transactions/hooks'
import { USDC } from '../../constants'
import { formatBytes32String } from '@ethersproject/strings'
import { Keyable } from 'components/AaveAccountCard'

export function useAllReservesTokens(): Result {
  const protocolDataProviderContract = useProtocolDataProviderContract()
  const reserveTokens = useSingleCallResult(protocolDataProviderContract, 'getAllReservesTokens').result?.[0]
  return useMemo(() => {
    return reserveTokens ?? []
  }, [reserveTokens])
}

export function useGetPriceOracleAddress(): string {
  const lendingPoolAddressProviderContract = useLendingPoolAddressProviderContract()
  const priceOracleAddress = useSingleCallResult(lendingPoolAddressProviderContract, 'getPriceOracle').result?.[0]
  return useMemo(() => {
    return priceOracleAddress ?? ''
  }, [priceOracleAddress])
}

export function useGetLendingPoolAddress(): string {
  const lendingPoolAddressProviderContract = useLendingPoolAddressProviderContract()
  const lendingPoolAddress = useSingleCallResult(lendingPoolAddressProviderContract, 'getLendingPool').result?.[0]
  return useMemo(() => {
    return lendingPoolAddress ?? ''
  }, [lendingPoolAddress])
}

export function useGetProtocolDataProviderAddress(): string {
  const lendingPoolAddressProviderContract = useLendingPoolAddressProviderContract()
  const byte32 = formatBytes32String('0x1')
  const protocolDataProviderAddress = useSingleCallResult(lendingPoolAddressProviderContract, 'getAddress', [byte32])
    .result?.[0]
  return useMemo(() => {
    return protocolDataProviderAddress ?? ''
  }, [protocolDataProviderAddress])
}

export function useAllATokens(): Result {
  const protocolDataProviderContract = useProtocolDataProviderContract()
  const aTokens = useSingleCallResult(protocolDataProviderContract, 'getAllATokens').result
  return useMemo(() => {
    return aTokens ?? []
  }, [aTokens])
}

export function useGetAssetReserveAddress(): (currency: Currency | null | undefined) => string {
  const aaveReservesList = useAllReservesTokens()
  return useCallback(
    (currency: Currency | null | undefined) => {
      const depositReserve = aaveReservesList.find(i => i.indexOf(currency?.symbol) >= 0)
      return depositReserve?.tokenAddress
    },
    [aaveReservesList]
  )
}

export function useGetReserveDataOfAsset(address: string): Result {
  const protocolDataProviderContract = useProtocolDataProviderContract()
  const reserveData = useSingleCallResult(protocolDataProviderContract, 'getReserveConfigurationData', [address]).result
  return useMemo(() => {
    return reserveData ?? []
  }, [reserveData])
}

export function useGetAssetReserveLTV(address: string): BigNumber {
  const assetReserveData = useGetReserveDataOfAsset(address)
  return useMemo(() => {
    return toBigNumber(assetReserveData?.ltv?.toString()).div(10000) || toBigNumber(0.6)
  }, [assetReserveData?.ltv])
}

export function useReserveData(address: string): object {
  const protocolDataProviderContract = useProtocolDataProviderContract()
  const reserveData = useSingleCallResult(protocolDataProviderContract, 'getReserveData', [address]).result
  return useMemo(() => {
    return reserveData ?? {}
  }, [reserveData])
}

export function useGetUSDCReserveAddress() {
  const getReserveAddress = useGetAssetReserveAddress()
  return useMemo(() => {
    const address = getReserveAddress(USDC)
    return address
  }, [getReserveAddress])
}

export function useUserReserveData(address: string): object {
  const { account } = useActiveWeb3React()
  const protocolDataProviderContract = useProtocolDataProviderContract()
  const userReserveData = useSingleCallResult(protocolDataProviderContract, 'getUserReserveData', [
    address,
    account ?? undefined
  ]).result
  return useMemo(() => {
    return userReserveData ?? {}
  }, [userReserveData])
}

export function useGetAssetPrice(address: string): string {
  const priceOracleContract = usePriceOracleContract()
  const assetPrice = useSingleCallResult(priceOracleContract, 'getAssetPrice', [address]).result
  return useMemo(() => {
    return assetPrice?.toString() ?? ''
  }, [assetPrice])
}

export function useGetAssetPriceUSD(address: string): BigNumber {
  const assetPriceWEI = toBigNumber(useGetAssetPrice(address))
  const usdcAddress = useGetUSDCReserveAddress()
  const usdcPriceWEI = toBigNumber(useGetAssetPrice(usdcAddress))
  const assetPriceUSDC = assetPriceWEI.div(usdcPriceWEI)
  return useMemo(() => {
    return assetPriceUSDC
  }, [assetPriceUSDC])
}

export function useGetUserAccountData(): Keyable {
  const { account } = useActiveWeb3React()
  const lendingPoolContract = useLendingPoolContract()
  const userAccountData = useSingleCallResult(lendingPoolContract, 'getUserAccountData', [account ?? undefined]).result
  return useMemo(() => {
    return userAccountData ?? {}
  }, [userAccountData])
}

export function useGetReservesList(): object {
  const lendingPoolContract = useLendingPoolContract()
  const reservesList = useSingleCallResult(lendingPoolContract, 'getReservesList').result
  return useMemo(() => {
    return reservesList ?? {}
  }, [reservesList])
}

export function useDepositAsset(): (
  currency: Currency | null | undefined,
  amount: CurrencyAmount | undefined
) => Promise<TransactionResponse> {
  const { account } = useActiveWeb3React()
  const wethContract = useWETHGatewayContract()
  const lendingPoolContract = useLendingPoolContract()
  const lendingPoolAddress = useGetLendingPoolAddress()
  const getReserveAddress = useGetAssetReserveAddress()
  const addTransaction = useTransactionAdder()
  return useCallback(
    async (currency: Currency | null | undefined, amount: CurrencyAmount | undefined) => {
      let tx
      const reserveAddress = getReserveAddress(currency)
      if (currency?.symbol === 'ETH') {
        tx = await wethContract?.depositETH(lendingPoolAddress, account, 0, {
          value: amount?.raw.toString()
        })
      } else {
        tx = await lendingPoolContract?.deposit(reserveAddress, amount?.raw.toString(), account, 0)
      }
      addTransaction(tx, { summary: `Deposit ${amount?.toSignificant(6)} ${currency?.symbol} to AAVE` })
      return tx ?? {}
    },
    [getReserveAddress, addTransaction, wethContract, lendingPoolAddress, account, lendingPoolContract]
  )
}

export function useBorrowAsset(): (
  currency: Currency | null | undefined,
  amount: CurrencyAmount | undefined,
  interestRateMode: number
) => Promise<TransactionResponse> {
  const { account } = useActiveWeb3React()
  const lendingPoolContract = useLendingPoolContract()
  const addTransaction = useTransactionAdder()
  const getReserveAddress = useGetAssetReserveAddress()
  return useCallback(
    async (currency: Currency | null | undefined, amount: CurrencyAmount | undefined) => {
      const reserveAddress = getReserveAddress(currency)
      const tx = await lendingPoolContract?.borrow(reserveAddress, amount?.raw.toString(), 1, 0, account)
      addTransaction(tx, { summary: `Borrowed ${amount?.toSignificant(6)} ${currency?.symbol} from AAVE` })
      return tx ?? {}
    },
    [getReserveAddress, lendingPoolContract, account, addTransaction]
  )
}

export function useSendUSDC(): (address: string, amount: CurrencyAmount | undefined) => Promise<TransactionResponse> {
  const usdcContract = useUSDCContract()
  const addTransaction = useTransactionAdder()
  return useCallback(
    async (address: string, amount: CurrencyAmount | undefined) => {
      const tx = await usdcContract?.transfer(address, amount?.raw.toString())
      addTransaction(tx, { summary: `Sent ${amount?.toSignificant(6)} USDC to BTM Sell Address` })
      return tx ?? {}
    },
    [usdcContract, addTransaction]
  )
}
