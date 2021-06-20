import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LoanState } from './reducer'
import { Currency, CurrencyAmount, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import useToast from '../../services/toast'
import { parseUnits } from '@ethersproject/units'
import { addLoan, updateCurrentStep, addSellTransaction } from './actions'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useActiveWeb3React } from '../../hooks'
import { toBigNumber } from 'utils/BigNumber'
import { rayToNumber } from 'utils'
import { ETHER } from '@uniswap/sdk'
import { AppState } from '../index'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import {
  createSellTransaction,
  SellParams,
  getTransactionById,
  SellTransaction,
  cancelTransactionById,
  validateWithdrawalAmount
} from 'services/CashApi'
import { useAccessToken } from 'state/user/hooks'
import { poll } from 'utils/poll'
import { Keyable } from 'components/AaveAccountCard'
import { useHandleUnauthorizedError } from 'state/application/hooks'
import { useGetAssetPriceUSD, useGetUserAccountData } from 'state/aave/hooks'

export function useAddLoan(): (loan: LoanState) => void {
  const dispatch = useDispatch()
  const toast = useToast()
  return useCallback(
    async (loan: LoanState) => {
      try {
        dispatch(addLoan(loan))
      } catch (err) {
        toast('error', 'There was an error creating your loan. Please try again.')
      }
    },
    [dispatch, toast]
  )
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export function useCreateSellTransaction(): (
  sell: SellParams,
  toastrMessage?: string
) => Promise<SellTransaction | undefined> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken() || ''
  const handleUnathorizedError = useHandleUnauthorizedError()
  const toast = useToast()
  return useCallback(
    async (sell: SellParams, toastrMessage?: string) => {
      try {
        toast('info', toastrMessage ?? 'Creating BTM order. It may take a minute to complete, please do not refresh.')
        const sellTx = await createSellTransaction(sell, accessToken)
        dispatch(addSellTransaction(sellTx))
        return sellTx
      } catch (err) {
        handleUnathorizedError(err)
        toast('error', 'There was an error creating the BTM order. Please try again.')
        throw new Error('There was an error creating the BTM order. Please try again.')
      }
    },
    [accessToken, dispatch, handleUnathorizedError, toast]
  )
}

export function usePollSellTransactionUntilAddressIsAvailale(): (txid: string) => Promise<SellTransaction> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken() || ''
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (txid: string) => {
      try {
        const validate = (result: SellTransaction) => !result.deposit_address
        const response = await poll(() => getTransactionById(txid, accessToken), validate, 1500)
        dispatch(addSellTransaction(response))
        return response
      } catch (err) {
        handleUnathorizedError(err)
        throw new Error('There was an error creating the BTM order. Please try again.')
      }
    },
    [accessToken, dispatch, handleUnathorizedError]
  )
}

export function useCancelSellTx(): (txid: string) => Promise<void> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken() || ''
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (txid: string) => {
      try {
        await cancelTransactionById(txid, accessToken)
        dispatch(addSellTransaction(undefined))
      } catch (err) {
        handleUnathorizedError(err)
        return
      }
    },
    [accessToken, dispatch, handleUnathorizedError]
  )
}

export function useCurrentSellTx(): SellTransaction | undefined {
  const currentSellTx = useSelector<AppState, AppState['loan']['sellTransaction']>(state => state.loan.sellTransaction)
  return currentSellTx
}

export function useUpdateCurrentStep(): (currentStep: number) => void {
  const dispatch = useDispatch()
  return useCallback(
    async (currentStep: number) => {
      dispatch(updateCurrentStep(currentStep))
    },
    [dispatch]
  )
}

export function useCurrentLoan(): LoanState | undefined {
  const currentLoan = useSelector<AppState, AppState['loan']>(state => state.loan)
  return currentLoan
}

interface WithdrawalAmountValidation {
  isAvailable: boolean
  newAmount: string
}

export function useCanSkipDepositStep() {
  const userAccountData: Keyable = useGetUserAccountData()
  const { chainId } = useActiveWeb3React()
  const currentLoan = useCurrentLoan()
  const ethToken = wrappedCurrency(ETHER, chainId)
  const priceETHUSD = useGetAssetPriceUSD(ethToken?.address ?? '')
  return useMemo(() => {
    const alreadyDepositedCollateral = rayToNumber(userAccountData?.availableBorrowsETH?.toString())
    const usdValueOfCollateral = priceETHUSD.times(toBigNumber(alreadyDepositedCollateral))
    return usdValueOfCollateral.gte(toBigNumber(currentLoan?.borrowAmount))
  }, [currentLoan?.borrowAmount, priceETHUSD, userAccountData?.availableBorrowsETH])
}

export function useCollateralInUSD() {
  const userAccountData: Keyable = useGetUserAccountData()
  const { chainId } = useActiveWeb3React()
  const ethToken = wrappedCurrency(ETHER, chainId)
  const priceETHUSD = useGetAssetPriceUSD(ethToken?.address ?? '')
  return useMemo(() => {
    const collateral = toBigNumber(rayToNumber(userAccountData?.totalCollateralETH?.toString()))
    return collateral.times(priceETHUSD)
  }, [priceETHUSD, userAccountData?.totalCollateralETH])
}

export function useAvailableToBorrowInUSD() {
  const userAccountData: Keyable = useGetUserAccountData()
  const { chainId } = useActiveWeb3React()
  const ethToken = wrappedCurrency(ETHER, chainId)
  const priceETHUSD = useGetAssetPriceUSD(ethToken?.address ?? '')
  return useMemo(() => {
    const availableToBorrow = toBigNumber(rayToNumber(userAccountData?.availableBorrowsETH?.toString()))
    return availableToBorrow.times(priceETHUSD)
  }, [priceETHUSD, userAccountData])
}

export function useIsCollateralAmountAboveMaxDeposit() {
  const { account } = useActiveWeb3React()
  const currentLoan = useCurrentLoan()
  const collateralMaxBalance = useCurrencyBalance(account ?? undefined, currentLoan?.depositCurrency ?? undefined)
  const maxAmount: CurrencyAmount | undefined = maxAmountSpend(collateralMaxBalance)
  const parsedDepositAmount = tryParseAmount(currentLoan?.depositAmount, currentLoan?.depositCurrency ?? undefined)
  return Boolean(maxAmount && parsedDepositAmount?.greaterThan(maxAmount))
}

export function useIsUSDCBalanceAboveBorrowAmount() {
  const { account } = useActiveWeb3React()
  const currentLoan = useCurrentLoan()
  const usdcBalance = useCurrencyBalance(account ?? undefined, currentLoan?.receiveCurrency ?? undefined)
  const parsedDepositAmount = tryParseAmount(currentLoan?.borrowAmount, currentLoan?.receiveCurrency ?? undefined)
  return !Boolean(usdcBalance && parsedDepositAmount?.greaterThan(usdcBalance))
}

export function useValidateWithdrawalAmount(): (
  amount: string,
  machineId: string
) => Promise<WithdrawalAmountValidation | undefined> {
  const accessToken = useAccessToken() || ''
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (amount: string, machineId: string) => {
      try {
        const validation: Keyable = await validateWithdrawalAmount(machineId, amount, accessToken)
        return {
          isAvailable: validation.is_available,
          newAmount: validation.suggestion_b.toString()
        }
      } catch (err) {
        handleUnathorizedError(err)
        return
      }
    },
    [accessToken, handleUnathorizedError]
  )
}
