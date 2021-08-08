/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Currency, ETHER, CurrencyAmount } from '@uniswap/sdk'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ButtonLight, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { TYPE } from '../../theme'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { useWalletModalToggle, useRedirectToSignInIfNotAuthenticated } from '../../state/application/hooks'
import CurrentBTMLocation from '../../components/CurrentBTMLocation'
import { BottomGrouping, Wrapper } from '../../pages/Loan/styleds'
import { useToken } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import LoanModal from '../../components/LoanModal'
import { rayToNumber } from 'utils'
import {
  useAddLoan,
  useCancelSellTx,
  useCurrentSellTx,
  useValidateWithdrawalAmount,
  useCreateSellTransaction,
  usePollSellTransactionUntilAddressIsAvailale
} from 'state/loan/hooks'
import AppBody from '../AppBody'
import styled from 'styled-components'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import {
  useGetAssetPriceUSD,
  useGetUSDCReserveAddress,
  useGetAssetReserveLTV,
  useGetUserAccountData,
  useGetReserveDataOfAsset,
  useGetAssetPrice
} from 'state/aave/hooks'
import { toBigNumber } from 'utils/BigNumber'
import { useMachineInformation, useGetClientLimits, useClientLimits } from 'state/user/hooks'
import { roundDownToMultiple } from 'utils/roundDownToMultiple'
import { roundUpToMultiple } from 'utils/roundUpToMultiple'
import Loader from 'components/Loader'
import QuestionHelper from 'components/QuestionHelper'
import { MINIMUM_LOAN_AMOUNT } from '../../constants'
import Slider from 'react-input-slider'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import ReactGA from 'react-ga'

export const CurrentBTMContainer = styled.div`
  width: 400px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 0px;
  padding: 1rem;
  padding-top: 2.5rem;
  position: relative;
  z-index: 1;
  top: -50px;
  margin-top: -20px;
  border: 1px solid ${({ theme }) => theme.bg2};
  display: flex;
  flex-direction: column;
  justify-self: center;
  animation: slide 0.8s forwards;
  ${({ theme }) => theme.mediaWidth.upToMedium`width: 95%`};
  @keyframes slide {
    0% {
      top: -50px;
    }
    100% {
      top: 0px;
    }
  }
`

const EditLink = styled.div`
  position: absolute;
  top: 12px;
  right: 15px;
  z-index: 99;
  color: #2172e5;
  cursor: pointer;
`

export default function Loan() {
  const { account, chainId } = useActiveWeb3React()
  const DEFAULT_RECEIVE_ADDRESS = useGetUSDCReserveAddress()
  const toggleWalletModal = useWalletModalToggle()
  const addLoan = useAddLoan()
  const redirectToSignInIfNotAuthenticated = useRedirectToSignInIfNotAuthenticated()
  const machineInformation = useMachineInformation()
  const getClientLimits = useGetClientLimits()
  const clientLimits = useClientLimits()
  const currentSellTx = useCurrentSellTx()
  const cancelTx = useCancelSellTx()
  const createSellTransaction = useCreateSellTransaction()
  const pollSellTxUntilAddressIsAvailable = usePollSellTransactionUntilAddressIsAvailale()
  const validateWithdrawalAmount = useValidateWithdrawalAmount()
  const userAccountData = useGetUserAccountData()

  const USDC = useToken(DEFAULT_RECEIVE_ADDRESS)!

  const [collateralAsset, setCollateralAsset] = useState<Currency>(ETHER!)
  const [receiveAsset, setReceiveAsset] = useState<Currency>(USDC)
  const [collateralAmount, setCollateralAmount] = useState<string>('1')
  const [receiveAmount, setReceiveAmount] = useState<string>('')
  const [borrowAmount, setBorrowAmount] = useState<string>('')
  const [isLoading, updateIsLoading] = useState<boolean>(false)
  const [loanError, setLoanError] = useState<string>('')
  const [isValidated, setIsValidated] = useState<boolean>(false)
  const [isLoanModalOpen, setLoanModalOpen] = useState<boolean>(false)
  const [sellMinimum, updateSellMinimum] = useState<number>(MINIMUM_LOAN_AMOUNT)
  const [currentStep, updateCurrentStep] = useState<number>(0)
  const [healthFactor, setHealthFactor] = useState<number>(0)
  const [minAdditionalCollateral, updateMinAdditionalCollateral] = useState<number | undefined>(undefined)
  const [maxAdditionalCollateral, updateMaxAdditionalCollateral] = useState<number | undefined>(undefined)
  const [collateralAmountETH, updateCollateralAmountETH] = useState<number | undefined>(undefined)
  const [skipDepositStep, updateSkipDepositStep] = useState<boolean>(false)

  const collateralToken = wrappedCurrency(collateralAsset, chainId)!
  const reserveConfigurationData = useGetReserveDataOfAsset(collateralToken?.address)
  const reserveAssetLTV = useGetAssetReserveLTV(collateralToken.address)
  const btmSellRate = machineInformation?.prices_sell_affiliate?.USDC
  const priceUSD = useGetAssetPriceUSD(collateralToken?.address)
  const collateralAssetPriceETH = useGetAssetPrice(collateralToken.address)
  const receiveAssetPriceETH = useGetAssetPrice(USDC?.address)
  const primaryCurrency = machineInformation?.primary_currency
  const collateralMaxBalance = useCurrencyBalance(account ?? undefined, collateralAsset ?? undefined)
  const maxAmount: CurrencyAmount | undefined = maxAmountSpend(collateralMaxBalance)

  const sliderIsDisabled = useMemo(() => {
    return toBigNumber(minAdditionalCollateral).gte(toBigNumber(maxAdditionalCollateral))
  }, [maxAdditionalCollateral, minAdditionalCollateral])

  const handleValidateWithdrawalAmount = async (): Promise<string> => {
    const validation = await validateWithdrawalAmount(receiveAmount, machineInformation?.machine_id ?? '')
    if (!validation?.isAvailable && validation?.newAmount) {
      setReceiveAmount(validation?.newAmount)
      return validation?.newAmount
    }
    return receiveAmount
  }

  const handleLoanModal = (setting: boolean) => {
    setLoanModalOpen(setting)
  }

  const handleValidation = useCallback(() => {
    let validated = true
    setLoanError('')
    if (!collateralAmount || !receiveAmount || !receiveAsset || !collateralAsset) {
      validated = false
    } else if (toBigNumber(receiveAmount).lt(toBigNumber(sellMinimum))) {
      validated = false
      setLoanError(`Minimum you can receive is ${sellMinimum} ${primaryCurrency}`)
    } else if (clientLimits && toBigNumber(receiveAmount).gt(toBigNumber(clientLimits?.sell_current_adjusted))) {
      validated = false
      setLoanError(
        `Maximum you can receive at this machine is ${clientLimits?.sell_current_adjusted} ${primaryCurrency}`
      )
    } else if (toBigNumber(maxAmount?.toSignificant()).isZero() && currentStep > 0) {
      validated = false
      setLoanError(`You do not have any ${collateralAsset.symbol} balance to deposit.`)
    } else if (toBigNumber(collateralAmount).gt(toBigNumber(maxAmount?.toSignificant())) && currentStep > 0) {
      validated = false
      setLoanError(`Cannot deposit more ${collateralAsset.symbol} than you have in your wallet.`)
    } else if (sliderIsDisabled && currentStep > 0) {
      validated = false
      setLoanError(`You do not have enough ${collateralAsset.symbol} balance to create a healthy loan.`)
    }
    setIsValidated(validated)
  }, [
    collateralAmount,
    receiveAmount,
    receiveAsset,
    collateralAsset,
    sellMinimum,
    clientLimits,
    maxAmount,
    currentStep,
    sliderIsDisabled,
    primaryCurrency
  ])

  const handleCalculateHealthFactor = useCallback(() => {
    const { totalCollateralETH, totalDebtETH, currentLiquidationThreshold } = userAccountData
    const { liquidationThreshold: depositLiquidationThreshold } = reserveConfigurationData
    const healthFactor = rayToNumber(totalCollateralETH)
      .times(toBigNumber(currentLiquidationThreshold).div(100))
      .plus(
        toBigNumber(collateralAmount)
          .times(toBigNumber(collateralAssetPriceETH).div(1e18))
          .times(toBigNumber(depositLiquidationThreshold).div(100))
      )
      .div(rayToNumber(totalDebtETH).plus(toBigNumber(borrowAmount).times(toBigNumber(receiveAssetPriceETH).div(1e18))))
      .div(100)
    !healthFactor.isNaN() && setHealthFactor(healthFactor.toNumber())
  }, [
    borrowAmount,
    collateralAmount,
    collateralAssetPriceETH,
    receiveAssetPriceETH,
    reserveConfigurationData,
    userAccountData
  ])

  const handleBorrowAmount = useCallback(
    (value: string) => {
      const borrowValue = toBigNumber(value)
        .div(btmSellRate)
        .plus(30)
      setBorrowAmount(roundDownToMultiple(borrowValue.toNumber(), 1).toString())
    },
    [btmSellRate]
  )

  const handleReceiveInput = (value: string) => {
    setReceiveAmount(value)
    handleBorrowAmount(value)
  }

  const handleCollateralAmountETH = (amount: number) => {
    updateCollateralAmountETH(amount)
  }

  const handleCollateralInput = useCallback(
    (amount?: string, typed?: boolean) => {
      if (typed) {
        !toBigNumber(amount).isNaN() &&
          handleCollateralAmountETH(
            toBigNumber(amount)
              .times(toBigNumber(collateralAssetPriceETH).div(1e18))
              .dp(collateralAsset.decimals)
              .toNumber()
          )
        setCollateralAmount(amount ?? '')
      } else {
        collateralAssetPriceETH
          ? setCollateralAmount(
              toBigNumber(collateralAmountETH)
                .div(toBigNumber(collateralAssetPriceETH).div(1e18))
                .dp(collateralAsset.decimals)
                .toString()
            )
          : setCollateralAmount('')
      }
    },
    [collateralAmountETH, collateralAsset.decimals, collateralAssetPriceETH]
  )

  const handleSetLoanAmount = () => {
    handleCollateralAmountETH(toBigNumber(minAdditionalCollateral).toNumber())
    updateCurrentStep(1)
  }

  const handleSelectCollateral = (currency: Currency) => {
    setCollateralAsset(currency)
  }

  const handleCreateSellTransaction = useCallback(
    async (withdrawalAmount: number) => {
      const sellTx = await createSellTransaction({
        machine_id: machineInformation?.machine_id ?? '',
        deposit_currency: receiveAsset?.symbol || 'USDC',
        withdrawal_amount: withdrawalAmount,
        withdrawal_currency: machineInformation?.primary_currency ?? 'USD',
        refund_address: account ?? ''
      })
      const txId = sellTx?.transaction_id
      const tx = await pollSellTxUntilAddressIsAvailable(txId ?? '')
      return tx.deposit_amount
    },
    [
      account,
      createSellTransaction,
      machineInformation?.machine_id,
      machineInformation?.primary_currency,
      pollSellTxUntilAddressIsAvailable,
      receiveAsset?.symbol
    ]
  )

  const handleCreateLoan = async () => {
    try {
      updateIsLoading(true)
      currentSellTx && (await cancelTx(currentSellTx?.transaction_id))
      const newReceiveAmount = await handleValidateWithdrawalAmount()
      handleReceiveInput(newReceiveAmount)
      const accurateBorrowAmount = await handleCreateSellTransaction(toBigNumber(newReceiveAmount).toNumber())
      const borrowBN = toBigNumber(accurateBorrowAmount)
      const borrowPlusCushion = borrowBN.plus(borrowBN.times(0.1)).toNumber()
      await addLoan({
        depositCurrency: collateralAsset,
        receiveCurrency: receiveAsset,
        depositAmount: collateralAmount,
        receiveAmount: newReceiveAmount,
        borrowAmount: roundUpToMultiple(borrowPlusCushion, 1).toString(),
        receiveTokenAddress: DEFAULT_RECEIVE_ADDRESS,
        depositTokenAddress: collateralToken.address,
        currentStep: 0,
        skippedBorrow: false,
        skippedDeposit: false
      })
      ReactGA.event({
        category: 'Loan',
        action: 'Create Loan',
        label: `Create Loan`
      })
      updateIsLoading(false)
      updateSkipDepositStep(!toBigNumber(collateralAmount).gt(0))
      handleLoanModal(true)
    } catch (err) {
      updateIsLoading(false)
    }
  }

  const handleEditLoanAmount = () => {
    updateCurrentStep(0)
  }

  useEffect(() => {
    if (clientLimits && sellMinimum > clientLimits?.sell_current_adjusted) {
      updateSellMinimum(clientLimits?.sell_current_adjusted)
    }
  }, [clientLimits, sellMinimum])

  useEffect(() => {
    setReceiveAsset(USDC)
  }, [USDC])

  useEffect(() => {
    redirectToSignInIfNotAuthenticated()
    const handleGetClientLimits = async () => {
      machineInformation && (await getClientLimits(machineInformation?.operator_id, machineInformation?.machine_id))
    }
    handleGetClientLimits()
  }, [])

  useEffect(() => {
    handleValidation()
  }, [collateralAmount, collateralAsset, receiveAmount, handleValidation])

  useEffect(() => {
    handleCalculateHealthFactor()
  }, [collateralAsset, collateralAmount, collateralAmountETH, handleCalculateHealthFactor])

  useEffect(() => {
    handleCollateralInput()
  }, [collateralAmountETH, handleCollateralInput])

  useEffect(() => {
    const { totalCollateralETH, totalDebtETH } = userAccountData
    const minAdditionalCollateral = Math.max(
      0,
      rayToNumber(totalDebtETH)
        .plus(toBigNumber(borrowAmount).times(toBigNumber(receiveAssetPriceETH).div(1e18)))
        .div(reserveAssetLTV)
        .minus(rayToNumber(totalCollateralETH))
        .toNumber()
    )
    updateMinAdditionalCollateral(minAdditionalCollateral)
    const maxAdditionalCollateral = toBigNumber(maxAmount?.toSignificant(collateralAsset.decimals))
      .times(toBigNumber(collateralAssetPriceETH).div(1e18))
      .toNumber()
    updateMaxAdditionalCollateral(maxAdditionalCollateral)
  }, [
    userAccountData,
    reserveAssetLTV,
    collateralAsset,
    maxAmount,
    collateralAssetPriceETH,
    borrowAmount,
    receiveAssetPriceETH
  ])

  const STEPS = [
    {
      buttonText: 'Set Loan Amount',
      onClick: handleSetLoanAmount
    },
    {
      buttonText: 'Create Loan',
      onClick: handleCreateLoan
    }
  ]

  return (
    <>
      <TYPE.largeHeader style={{ marginBottom: 30 }}>Create your cash loan</TYPE.largeHeader>
      <AppBody>
        <Wrapper id="borrow-page">
          <AutoColumn gap={'md'}>
            <div style={{ position: 'relative' }}>
              {currentStep > 0 && (
                <EditLink onClick={handleEditLoanAmount}>
                  <TYPE.subHeader style={{ fontWeight: 500 }}>Edit</TYPE.subHeader>
                </EditLink>
              )}
              <CurrencyInputPanel
                value={receiveAmount}
                onUserInput={handleReceiveInput}
                label={'Loan Amount'}
                showMaxButton={false}
                currency={receiveAsset}
                customSymbol={primaryCurrency}
                hideBalance={true}
                disableCurrencySelect={true}
                otherCurrency={collateralAsset}
                id="receive-amount-input"
                isFixedUSDC={true}
                disabled={currentStep > 0}
              />
            </div>
            {currentStep > 0 && (
              <>
                <CurrencyInputPanel
                  label={'Deposit'}
                  value={collateralAmount}
                  showMaxButton={false}
                  currency={collateralAsset}
                  onUserInput={value => {
                    handleCollateralInput(value, true)
                  }}
                  onCurrencySelect={handleSelectCollateral}
                  otherCurrency={receiveAsset}
                  id="collateral-amount-input"
                />
                {reserveAssetLTV.gt(0) && !sliderIsDisabled && (
                  <div style={{ position: 'relative', zIndex: 999 }}>
                    <div style={{ padding: '0rem 0rem', paddingBottom: 4, paddingTop: 15 }}>
                      <TYPE.subHeader>
                        Health Factor: {healthFactor.toFixed(3)}
                        <span style={{ position: 'relative', top: 2 }}>
                          <QuestionHelper
                            text={
                              'Health factor represents the safety of a loan. Keep it above 1 to avoid liquidation.'
                            }
                          />
                        </span>
                      </TYPE.subHeader>
                    </div>
                    <Slider
                      axis="x"
                      xmin={minAdditionalCollateral}
                      xmax={maxAdditionalCollateral}
                      x={collateralAmountETH}
                      xstep={toBigNumber(1)
                        .div(toBigNumber(10).times(collateralAsset.decimals))
                        .toNumber()}
                      disabled={sliderIsDisabled}
                      xreverse={true}
                      onChange={({ x }) => {
                        handleCollateralAmountETH(x)
                      }}
                      styles={{
                        track: {
                          background: 'linear-gradient(90deg, rgba(138,255,71,1) 0%, rgba(255,55,26,1) 100%)',
                          width: '100%'
                        },
                        active: {
                          background: 'transparent'
                        },
                        thumb: {
                          width: 20,
                          height: 20
                        },
                        disabled: {
                          opacity: 1
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </AutoColumn>
          <BottomGrouping>
            {loanError && (
              <TYPE.error style={{ marginBottom: 10 }} error={Boolean(loanError)}>
                {loanError}
              </TYPE.error>
            )}
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : (
              <ButtonPrimary
                padding="15px"
                borderRadius="0"
                onClick={STEPS[currentStep].onClick}
                disabled={!isValidated || isLoading || !priceUSD.gt(0)}
              >
                {!priceUSD.gt(0) ? (
                  'Fetching Rates...'
                ) : !isLoading ? (
                  STEPS[currentStep].buttonText
                ) : (
                  <>
                    <Loader style={{ marginRight: 5 }} stroke="white" /> Creating BTM Order...
                  </>
                )}
              </ButtonPrimary>
            )}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      <LoanModal
        skipDepositStep={skipDepositStep}
        isOpen={isLoanModalOpen}
        onDismiss={(setting: boolean) => handleLoanModal(setting)}
      />
      <CurrentBTMContainer>
        <CurrentBTMLocation />
      </CurrentBTMContainer>
    </>
  )
}
