/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { AutoRow, RowBetween } from 'components/Row'
import styled from 'styled-components'
import { useAllReservesTokens, useReserveData } from 'state/aave/hooks'
import { TYPE } from 'theme'
import Loader from 'components/Loader'
import { useMachineInformation } from 'state/user/hooks'
import { useCurrentLoan, useIsUSDCBalanceAboveBorrowAmount } from 'state/loan/hooks'
import { raytoPercent, convertDateString } from 'utils'
import useTheme from '../../hooks/useTheme'
import { ButtonLightGreen } from 'components/Button'
import QuestionHelper from 'components/QuestionHelper'

interface Keyable {
  [key: string]: any
}

const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 0px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.bg2};
  display: flex;
  flex-direction: column;
  justify-self: center;
`
const UserInfoRow = styled.div`
  padding: 5px 0px;
`

export default function CurrentLoanCard({
  style,
  showWarning = true,
  currentStep,
  onHandleSkipBorrowStep,
  isLoading = false,
  showExpiry = true
}: {
  style?: object
  showWarning?: boolean
  currentStep?: number
  onHandleSkipBorrowStep?: () => void
  isLoading?: boolean
  showExpiry?: boolean
}) {
  const theme = useTheme()
  const currentLoan = useCurrentLoan()
  const reservesList = useAllReservesTokens()
  const receiveReserveAsset = reservesList.find(i => i.indexOf(currentLoan?.receiveCurrency?.symbol) >= 0)
  const reserveData: Keyable = useReserveData(receiveReserveAsset?.tokenAddress)
  const machineInformation = useMachineInformation()
  const usdcBalanceAboveBorrowAmount = useIsUSDCBalanceAboveBorrowAmount()

  return (
    <Container style={style}>
      <div>
        <TYPE.main fontWeight={600} style={{ marginBottom: 10 }}>
          Loan Info
        </TYPE.main>
        <div>
          <RowBetween>
            <UserInfoRow>Deposit:</UserInfoRow>
            <UserInfoRow>
              {currentLoan?.depositAmount} {currentLoan?.depositCurrency?.symbol}
            </UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>Borrow:</UserInfoRow>
            <UserInfoRow>
              {currentLoan?.borrowAmount} {currentLoan?.receiveCurrency?.symbol}
            </UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>Receive:</UserInfoRow>
            <UserInfoRow>
              {currentLoan?.receiveAmount} {machineInformation?.primary_currency}
            </UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>Borrow Interest Rate:</UserInfoRow>
            <UserInfoRow>
              {!reserveData.stableBorrowRate ? (
                <Loader stroke={theme.bg5} />
              ) : (
                raytoPercent(reserveData?.stableBorrowRate?.toString()).toFixed(2)
              )}
              % APY
            </UserInfoRow>
          </RowBetween>
          {currentLoan && currentLoan.sellTransaction && showExpiry && (
            <RowBetween>
              <UserInfoRow>
                Deposit Deadline
                <span style={{ position: 'relative', top: 2 }}>
                  <QuestionHelper
                    text={
                      'The deposit to the BTM address must be received before this date and time. Please set gas levels accordingly.'
                    }
                  />
                </span>
                :
              </UserInfoRow>
              <UserInfoRow>
                {convertDateString(currentLoan?.sellTransaction?.action_details?.deposit?.expires_at)}
              </UserInfoRow>
            </RowBetween>
          )}
          {usdcBalanceAboveBorrowAmount && (currentStep === 0 || currentStep === 1) && (
            <>
              <ButtonLightGreen
                style={{ marginTop: 10, marginBottom: 5 }}
                padding="10px"
                onClick={onHandleSkipBorrowStep}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader style={{ marginRight: 5 }} stroke={theme.bg5} /> Fetching Deposit Details...
                  </>
                ) : (
                  ` Skip ${currentStep === 0 ? 'Deposit & Borrow Steps' : `Borrow Step`}`
                )}
              </ButtonLightGreen>
              <TYPE.small>
                <TYPE.darkGray>
                  * You have enough USDC in your wallet to cover your {currentLoan?.borrowAmount}{' '}
                  {currentLoan?.receiveCurrency?.symbol} BTM order. You can skip to the 3rd step if would like.
                </TYPE.darkGray>
              </TYPE.small>
            </>
          )}
          {showWarning && !usdcBalanceAboveBorrowAmount && (
            <AutoRow style={{ marginTop: 5 }}>
              <TYPE.small>
                <TYPE.darkGray>
                  * The USDC borrowed from AAVE will be sent to the BTM's sell wallet address. After it has arrived your
                  cash can be withdrawn at the BTM location you have chosen.
                </TYPE.darkGray>
              </TYPE.small>
            </AutoRow>
          )}
        </div>
      </div>
    </Container>
  )
}
