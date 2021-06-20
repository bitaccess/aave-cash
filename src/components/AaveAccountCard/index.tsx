import React from 'react'
import { RowBetween } from 'components/Row'
import styled from 'styled-components'
import { useGetUserAccountData } from 'state/aave/hooks'
import { TYPE } from 'theme'
import Loader from 'components/Loader'
import {
  useCurrentLoan,
  useCanSkipDepositStep,
  useCollateralInUSD,
  useAvailableToBorrowInUSD,
  useIsUSDCBalanceAboveBorrowAmount
} from 'state/loan/hooks'
import { useMachineInformation } from 'state/user/hooks'
import { ButtonLightGreen } from 'components/Button'
import useTheme from '../../hooks/useTheme'

export interface Keyable {
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
  onHandleSkipDepositStep,
  currentStep
}: {
  onHandleSkipDepositStep?: () => void
  currentStep?: number
}) {
  const theme = useTheme()
  const userAccountData: Keyable = useGetUserAccountData()
  const currentLoan = useCurrentLoan()
  const canSkipDepositStep = useCanSkipDepositStep()
  const collateralInUSD = useCollateralInUSD()
  const availableToBorrowInUSD = useAvailableToBorrowInUSD()
  const machineInformation = useMachineInformation()
  const usdcBalanceAboveBorrowAmount = useIsUSDCBalanceAboveBorrowAmount()

  return (
    <Container>
      <div>
        <TYPE.main fontWeight={600} style={{ marginBottom: 10 }}>
          AAVE Account Info
        </TYPE.main>
        <div>
          <RowBetween>
            <UserInfoRow>Total Available Collateral (USD):</UserInfoRow>
            <UserInfoRow>
              {!userAccountData.totalCollateralETH ? <Loader stroke={theme.bg5} /> : collateralInUSD.toFixed(2)} USD
            </UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>Max Available to Borrow (USD):</UserInfoRow>
            <UserInfoRow>
              {!userAccountData.availableBorrowsETH ? <Loader stroke={theme.bg5} /> : availableToBorrowInUSD.toFixed(2)}{' '}
              USD
            </UserInfoRow>
          </RowBetween>
          {canSkipDepositStep && !usdcBalanceAboveBorrowAmount && currentStep === 0 && (
            <>
              <ButtonLightGreen
                style={{ marginTop: 10, marginBottom: 5 }}
                padding="10px"
                onClick={onHandleSkipDepositStep}
              >
                Skip Deposit Step
              </ButtonLightGreen>
              <TYPE.small>
                <TYPE.darkGray>
                  * You have enough collateral already deposited to cover your {currentLoan?.receiveAmount}{' '}
                  {machineInformation?.primary_currency} loan. You can skip to the next step if you would like.
                </TYPE.darkGray>
              </TYPE.small>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
