import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import { ButtonGray, ButtonPrimary } from '../../components/Button'
import { useActiveWeb3React } from '../../hooks'
import { darken } from 'polished'
import { useWalletModalToggle } from '../../state/application/hooks'
import AppBody from '../AppBody'
import { ExternalLink, TYPE } from '../../theme'
import { AutoRow } from '../../components/Row'

const activeClassName = 'ACTIVE'

export const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  width: 100%;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

export default function Home() {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  return (
    <>
      <TYPE.largeHeader style={{ marginBottom: 30 }}>Take out a cash loan with your crypto</TYPE.largeHeader>
      <AppBody>
        <CardHeader title="Get Started" />
        <Wrapper id="swap-page">
          {!account ? (
            <>
              <ButtonPrimary onClick={toggleWalletModal} borderRadius="0">
                Connect to a wallet
              </ButtonPrimary>
              <Link style={{ textDecoration: 'none' }} to="/how-it-works">
                <ButtonGray borderRadius="0" style={{ marginTop: 10 }}>
                  How does it work?
                </ButtonGray>
              </Link>
            </>
          ) : (
            <>
              <Link style={{ textDecoration: 'none' }} to="/user/locations">
                <ButtonPrimary borderRadius="0">Take out a new loan</ButtonPrimary>
              </Link>
              <StyledExternalLink href="https://app.aave.com">
                <ButtonGray borderRadius="0" style={{ marginTop: 10 }}>
                  View my AAVE loans <span style={{ fontSize: '11px' }}>↗</span>
                </ButtonGray>
              </StyledExternalLink>
              <AutoRow style={{ marginTop: account ? 30 : 20 }} justify="center">
                <Link to="/how-it-works">How does it work?</Link>
              </AutoRow>
            </>
          )}
        </Wrapper>
      </AppBody>
    </>
  )
}
