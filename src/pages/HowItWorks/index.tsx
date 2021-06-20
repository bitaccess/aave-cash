import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import { ButtonPrimary } from '../../components/Button'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { RowBetween } from '../../components/Row'

const StepContainer = styled(RowBetween)`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border-radius: 0px;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.bg2};
  margin-bottom: 7px;
  text-align: left;
  justify-content: start;
`

const Number = styled.div`
  max-width: 20px;
  height: 100%;
  justify-content: center;
  flex: 100%;
  display: flex;
  text-align: center;
  line-height: 50px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};
  margin-right: 15px;
`

export default function HowItWorks() {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const STEPS = [
    'Deposit crypto to the AAVE protocol as collateral',
    'Borrow USDC from AAVE',
    'Send USDC to BTM sell address',
    'Pick up your cash at the most convenient BTM location for you'
  ]

  return (
    <>
      <TYPE.largeHeader style={{ marginBottom: 30 }}>Take out a cash loan with your crypto</TYPE.largeHeader>
      <AppBody>
        <CardHeader title="How It Works" />
        <Wrapper id="swap-page">
          {STEPS.map((step, i) => {
            return (
              <StepContainer style={{ marginBottom: i == STEPS.length - 1 ? '10px' : '' }} key={i}>
                <Number>
                  <TYPE.small>{i + 1}</TYPE.small>
                </Number>
                <TYPE.main>{step}</TYPE.main>
              </StepContainer>
            )
          })}
          {account ? (
            <Link style={{ textDecoration: 'none' }} to="/user/locations">
              <ButtonPrimary borderRadius="0">Get Started</ButtonPrimary>
            </Link>
          ) : (
            <ButtonPrimary onClick={toggleWalletModal}>Connect to a wallet</ButtonPrimary>
          )}
        </Wrapper>
      </AppBody>
    </>
  )
}
