/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { useHistory } from 'react-router'
import Modal from '../Modal'
import styled from 'styled-components'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ButtonPrimary, ButtonGray } from 'components/Button'
import ProgressBar from 'components/ProgressBar'
import CurrentLoanCard from 'components/CurrentLoanCard'
import AaveAccountCard from 'components/AaveAccountCard'
import CurrentSellCard from 'components/CurrentSellCard'
import LoanSummaryCard from 'components/LoanSummaryCard'
import Confetti from 'components/Confetti'
import { TYPE } from 'theme'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { RowBetween } from 'components/Row'
import { useCurrentLoan, useUpdateCurrentStep, useCancelSellTx, useCurrentSellTx } from 'state/loan/hooks'
import { tryParseAmount } from '../../state/loan/hooks'
import { useActiveWeb3React } from 'hooks'
import { toBigNumber } from 'utils/BigNumber'
import { useDepositAsset, useGetLendingPoolAddress, useBorrowAsset, useSendUSDC } from 'state/aave/hooks'
import Loader from 'components/Loader'
import { useSelectedBTM } from 'state/user/hooks'
import {
  useAvailableToBorrowInUSD,
  useIsCollateralAmountAboveMaxDeposit,
  usePollSellTransactionUntilAddressIsAvailale,
  useCreateSellTransaction
} from 'state/loan/hooks'
import { useIsTransactionSuccessful } from 'state/transactions/hooks'
import ReactGA from 'react-ga'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const UpperSection = styled.div`
  position: relative;
  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }
  h5:last-child {
    margin-bottom: 0px;
  }
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 0rem 2rem;
  margin-bottom: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const BottomWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0.5rem`};
`

const HeaderRow = styled.div`
  padding: 1rem 1rem;
  font-weight: 500;
  flex-wrap: wrap;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

export default function LoanModal({
  isOpen,
  onDismiss,
  skipDepositStep
}: {
  isOpen: boolean
  skipDepositStep: boolean
  onDismiss: (setting: boolean) => void
}) {
  const borrowToastrMessage = 'Fetching USDC deposit details. Please do not refresh.'
  const { account } = useActiveWeb3React()
  const currentLoan = useCurrentLoan()
  const lendingPoolAddress = useGetLendingPoolAddress()
  const history = useHistory()
  const cancelTx = useCancelSellTx()
  const currentSellTx = useCurrentSellTx()
  const machineInformation = useSelectedBTM()
  const availableBorrowAmountUSD = useAvailableToBorrowInUSD()
  const updateLoanStateCurrentStep = useUpdateCurrentStep()
  const createSellTransaction = useCreateSellTransaction()
  const pollSellTxUntilAddressIsAvailable = usePollSellTransactionUntilAddressIsAvailale()
  const [isSendingTx, updateIsSendingTx] = useState(false)
  const [isCreatingSellTx, updateIsCreatingSellTx] = useState(false)
  const [currentStep, updateCurrentStep] = useState<0 | 1 | 2 | 3 | number>(0)
  const [depositTx, updateDepositTx] = useState<TransactionResponse | undefined>(undefined)
  const [borrowTx, updateBorrowTx] = useState<TransactionResponse | undefined>(undefined)
  const [sendTx, updateSendTx] = useState<TransactionResponse | undefined>(undefined)
  const isBorrowTxSuccessful = useIsTransactionSuccessful(borrowTx?.hash)
  const isSendTxSuccessful = useIsTransactionSuccessful(sendTx?.hash)
  const isDepositTxSuccessful = useIsTransactionSuccessful(depositTx?.hash)
  const [showOptionToMoveToNextStep, updateShowOptionToMoveToNextStep] = useState<boolean>(false)
  const timer = useRef<any>(null)

  const parsedDepositAmount = tryParseAmount(currentLoan?.depositAmount, currentLoan?.depositCurrency ?? undefined)
  const parsedBorrowAmount = tryParseAmount(currentLoan?.borrowAmount, currentLoan?.receiveCurrency ?? undefined)
  const [approval, approveCallback] = useApproveCallback(parsedDepositAmount, lendingPoolAddress)

  const collateralAmountAboveMaxDeposit = useIsCollateralAmountAboveMaxDeposit()

  const depositAsset = useDepositAsset()
  const borrowUSDC = useBorrowAsset()
  const sendUSDC = useSendUSDC()

  const handleUpdateCurrentStep = useCallback(
    (step: 0 | 1 | 2 | 3 | number) => {
      updateCurrentStep(step)
      updateLoanStateCurrentStep(step)
    },
    [updateCurrentStep, updateLoanStateCurrentStep]
  )

  const handleCreateTimer = () => {
    timer.current = setTimeout(() => {
      updateShowOptionToMoveToNextStep(true)
    }, 180000)
  }

  const handleDestroyTimer = () => {
    clearTimeout(timer.current)
    updateShowOptionToMoveToNextStep(false)
  }

  const handleDepositAsset = async () => {
    updateIsSendingTx(true)
    handleCreateTimer()
    try {
      const depositTxResponse = await depositAsset(currentLoan?.depositCurrency, parsedDepositAmount)
      ReactGA.event({
        category: 'Loan',
        action: `Deposit Collateral`,
        label: `Deposit ${currentLoan?.depositCurrency?.symbol || 'UKNOWN'}`
      })
      updateDepositTx(depositTxResponse)
    } catch (err) {
      handleDestroyTimer()
      updateIsSendingTx(false)
    }
  }

  const handleEndTransaction = useCallback(
    (nextStep?: number) => {
      handleDestroyTimer()
      updateIsSendingTx(false)
      if (nextStep) {
        handleUpdateCurrentStep(nextStep)
      }
    },
    [handleUpdateCurrentStep]
  )

  const handleCreateSellTransactionAndNextStep = useCallback(
    async (toastrMessage?: string) => {
      updateIsCreatingSellTx(true)
      try {
        currentSellTx && (await cancelTx(currentSellTx?.transaction_id))
        const sellTx =
          currentLoan &&
          (await createSellTransaction(
            {
              machine_id: machineInformation?.machine_id ?? '',
              deposit_currency: currentLoan?.receiveCurrency?.symbol || 'USDC',
              withdrawal_amount: toBigNumber(currentLoan?.receiveAmount).toNumber(),
              withdrawal_currency: machineInformation?.primary_currency ?? 'USD',
              refund_address: account ?? ''
            },
            toastrMessage
          ))
        const txId = sellTx?.transaction_id
        await pollSellTxUntilAddressIsAvailable(txId ?? '')
        updateIsCreatingSellTx(false)
        updateIsSendingTx(false)
        handleUpdateCurrentStep(2)
      } catch (err) {
        handleEndTransaction()
      }
    },
    [
      account,
      cancelTx,
      createSellTransaction,
      currentLoan,
      currentSellTx,
      handleEndTransaction,
      handleUpdateCurrentStep,
      machineInformation?.machine_id,
      machineInformation?.primary_currency,
      pollSellTxUntilAddressIsAvailable
    ]
  )

  const handleBorrowUSDC = async () => {
    if (borrowTx) {
      // if sell fails and user retries
      handleCreateSellTransactionAndNextStep(borrowToastrMessage)
      return
    }
    updateIsSendingTx(true)
    handleCreateTimer()
    try {
      const borrowTxResponse = await borrowUSDC(currentLoan?.receiveCurrency, parsedBorrowAmount, 1)
      ReactGA.event({
        category: 'Loan',
        action: `Borrow USDC`,
        label: `Borrow ${parsedBorrowAmount?.toFixed(2)} USDC`
      })
      updateBorrowTx(borrowTxResponse)
    } catch (err) {
      handleDestroyTimer()
      updateIsSendingTx(false)
    }
  }

  const handleSendUSDCToOperator = async () => {
    updateIsSendingTx(true)
    handleCreateTimer()
    const parsedSellDeposit = tryParseAmount(
      currentLoan?.sellTransaction?.deposit_amount.toString(),
      currentLoan?.receiveCurrency ?? undefined
    )
    try {
      const sendTxResponse = await sendUSDC(currentLoan?.sellTransaction?.deposit_address ?? '', parsedSellDeposit)
      ReactGA.event({
        category: 'Loan',
        action: `Send USDC`,
        label: `Send ${parsedSellDeposit?.toFixed(2)} USDC`
      })
      updateSendTx(sendTxResponse)
    } catch (err) {
      handleDestroyTimer()
      updateIsSendingTx(false)
    }
  }

  const borrowAmountIsAvailable = useMemo(() => {
    return availableBorrowAmountUSD.gt(currentLoan?.borrowAmount ?? '')
  }, [availableBorrowAmountUSD, currentLoan?.borrowAmount])

  const handleSkipDepositStep = useCallback(() => {
    handleUpdateCurrentStep(1)
  }, [handleUpdateCurrentStep])

  const handleSkipBorrowStep = useCallback(() => {
    handleCreateSellTransactionAndNextStep(borrowToastrMessage)
  }, [handleCreateSellTransactionAndNextStep])

  const handleBorrowSuccess = () => {
    handleDestroyTimer()
    handleCreateSellTransactionAndNextStep(borrowToastrMessage)
  }

  const TRANSACTION_STEPS = [
    {
      tx: depositTx,
      success: isDepositTxSuccessful,
      onError: () => handleEndTransaction(),
      onSuccess: () => handleEndTransaction(1)
    },
    {
      tx: borrowTx,
      success: isBorrowTxSuccessful,
      onError: () => handleEndTransaction(),
      onSuccess: handleBorrowSuccess
    },
    {
      tx: sendTx,
      success: isSendTxSuccessful,
      onError: () => handleEndTransaction(),
      onSuccess: () => handleEndTransaction(3)
    }
  ]

  const handleTransactionChanges = () => {
    const currentTransaction = TRANSACTION_STEPS[currentStep]
    const { success, tx, onSuccess, onError } = currentTransaction
    if (typeof success !== 'undefined' && !success && tx) {
      onError()
    } else if (success && tx) {
      onSuccess()
    }
  }

  useEffect(() => {
    if (skipDepositStep) {
      handleSkipDepositStep()
    }
  }, [skipDepositStep, handleSkipDepositStep])

  useEffect(() => {
    handleTransactionChanges()
  }, [isDepositTxSuccessful, depositTx, isBorrowTxSuccessful, borrowTx, sendTx, isSendTxSuccessful])

  useEffect(() => {
    handleUpdateCurrentStep(0)
  }, [currentLoan?.depositAmount, currentLoan?.depositCurrency, currentLoan?.receiveAmount])

  const BUTTON_BY_STEP: { buttonText: string; onClick: any; disabled: boolean }[] = [
    {
      buttonText: !collateralAmountAboveMaxDeposit
        ? 'Deposit Collateral to Aave'
        : `Increase your ${currentLoan?.depositCurrency?.symbol} balance to cover deposit amount`,
      onClick: handleDepositAsset,
      disabled: collateralAmountAboveMaxDeposit
    },
    {
      buttonText: `Borrow ${currentLoan?.receiveCurrency?.symbol} from AAVE`,
      onClick: handleBorrowUSDC,
      disabled: !borrowAmountIsAvailable
    },
    {
      buttonText: `Send ${currentLoan?.receiveCurrency?.symbol} to BTM Sell Address`,
      onClick: handleSendUSDCToOperator,
      disabled: false
    },
    {
      buttonText: 'Finish',
      onClick: () => history.push('/'),
      disabled: false
    }
  ]

  const DepositButton = approval === ApprovalState.APPROVED || currentStep > 0 ? ButtonPrimary : ButtonGray

  return (
    <Modal isOpen={isOpen} size="lg" onDismiss={() => onDismiss(false)}>
      <Wrapper>
        <UpperSection>
          <CloseIcon onClick={() => onDismiss(false)}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>
            <div>Deposit {currentLoan?.depositCurrency?.symbol} & Receive Cash</div>
            <ProgressBar
              currentStep={currentStep}
              steps={[`Deposit ${currentLoan?.depositCurrency?.symbol}`, 'Borrow USDC', 'Send USDC', 'Pick Up Cash']}
            />
          </HeaderRow>
          <ContentWrapper>
            {currentStep < 2 ? (
              <>
                <CurrentLoanCard
                  showExpiry={false}
                  isLoading={isCreatingSellTx}
                  onHandleSkipBorrowStep={handleSkipBorrowStep}
                  currentStep={currentStep}
                  style={{ marginBottom: 10 }}
                />
                <AaveAccountCard onHandleSkipDepositStep={handleSkipDepositStep} currentStep={currentStep} />
              </>
            ) : currentStep === 2 ? (
              <CurrentSellCard />
            ) : (
              <LoanSummaryCard />
            )}
          </ContentWrapper>
          <BottomWrapper>
            <RowBetween>
              {approval !== ApprovalState.APPROVED && currentStep === 0 && (
                <ButtonPrimary
                  style={{ marginRight: 10 }}
                  padding="15px"
                  borderRadius="0"
                  onClick={approveCallback}
                  disabled={approval === ApprovalState.PENDING || approval === ApprovalState.UNKNOWN}
                  altDisabledStyle={true}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Loader stroke="white" />
                  ) : (
                    <TYPE.white>Approve {currentLoan?.depositCurrency?.symbol}</TYPE.white>
                  )}
                </ButtonPrimary>
              )}
              <DepositButton
                padding="15px"
                borderRadius="0"
                onClick={BUTTON_BY_STEP[currentStep].onClick}
                disabled={
                  (approval !== ApprovalState.APPROVED && currentStep === 0) ||
                  isSendingTx ||
                  BUTTON_BY_STEP[currentStep].disabled
                }
                altDisabledStyle={true}
              >
                {isSendingTx ? (
                  <Loader stroke="white" />
                ) : (
                  <TYPE.white>{BUTTON_BY_STEP[currentStep].buttonText}</TYPE.white>
                )}
              </DepositButton>
            </RowBetween>
            {showOptionToMoveToNextStep && (
              <TYPE.subHeader
                style={{ marginTop: 10, textAlign: 'center', color: '#2172E5', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => {
                  handleDestroyTimer()
                  handleUpdateCurrentStep(currentStep + 1)
                }}
              >
                Click here to continue if you sped up your transaction or it is already confirmed
              </TYPE.subHeader>
            )}
          </BottomWrapper>
        </UpperSection>
        <Confetti start={currentStep === 3} />
      </Wrapper>
    </Modal>
  )
}
