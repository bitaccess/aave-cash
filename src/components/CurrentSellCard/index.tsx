/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { RowBetween } from 'components/Row'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useCurrentSellTx } from 'state/loan/hooks'
import Timer from 'components/Timer'
import QuestionHelper from 'components/QuestionHelper'

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

export default function CurrentLoanCard({ style }: { style?: object }) {
  const sellTx = useCurrentSellTx()
  return (
    <Container style={style}>
      <div>
        <TYPE.main fontWeight={600} style={{ marginBottom: 10 }}>
          Deposit USDC To BTM Sell Address
        </TYPE.main>
        <div>
          <RowBetween>
            <UserInfoRow>Send Amount:</UserInfoRow>
            <UserInfoRow>
              {sellTx?.deposit_amount} {sellTx?.deposit_currency}
            </UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>Deposit Address:</UserInfoRow>
            <UserInfoRow>{sellTx?.deposit_address}</UserInfoRow>
          </RowBetween>
          <RowBetween>
            <UserInfoRow>
              Deposit Deadline
              <span style={{ position: 'relative', top: 2 }}>
                <QuestionHelper
                  text={
                    'The deposit to the BTM address must be received within this 15 minute window. Please set gas levels accordingly.'
                  }
                />
              </span>
              :
            </UserInfoRow>
            <UserInfoRow>
              <Timer seconds={15 * 60} />
            </UserInfoRow>
          </RowBetween>
        </div>
      </div>
    </Container>
  )
}
