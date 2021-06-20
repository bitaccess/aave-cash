/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { AutoRow } from 'components/Row'
import styled from 'styled-components'
import CurrentBTMLocation from 'components/CurrentBTMLocation'
import CurrentLoanCard from 'components/CurrentLoanCard'
import useTheme from 'hooks/useTheme'
import { TYPE } from 'theme'
import { StyledExternalLink } from 'pages/Home'

const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 0px;
  display: flex;
  flex-direction: column;
  justify-self: center;
`

export default function LoanSummaryCard({ style }: { style?: object }) {
  const theme = useTheme()
  return (
    <Container style={style}>
      <AutoRow style={{ textAlign: 'center', marginBottom: 15 }}>
        <TYPE.mediumHeader style={{ margin: '0 auto', marginBottom: 5 }}>
          Your loan has been processed!
        </TYPE.mediumHeader>
        <TYPE.subHeader>
          Shortly you will receive a text message with more information. You can withdraw your cash at the BTM location
          below:
        </TYPE.subHeader>
      </AutoRow>
      <div>
        <div>
          <AutoRow style={{ marginBottom: 0 }}>
            <CurrentBTMLocation
              canChangeLocation={false}
              style={{ backgroundColor: theme.bg1, border: `1px solid ${theme.bg2}`, padding: '1rem', width: '100%' }}
            />
          </AutoRow>
          <AutoRow>
            <CurrentLoanCard showExpiry={false} showWarning={false} />
          </AutoRow>
          <AutoRow style={{ marginTop: 20 }}>
            <TYPE.subHeader style={{ margin: '0 auto', textAlign: 'center' }}>
              Reminder: You can repay the loan whenever you want through{' '}
              <StyledExternalLink style={{ display: 'inline-block' }} href="https://app.aave.com">
                https://app.aave.com
              </StyledExternalLink>
            </TYPE.subHeader>
          </AutoRow>
        </div>
      </div>
    </Container>
  )
}
