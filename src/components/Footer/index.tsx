import React from 'react'

import styled from 'styled-components'

import { RowFixed } from '../Row'
import { ExternalLink, TYPE } from 'theme'
import pkg from '../../../package.json'

const StyledLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.blue1};
  font-weight: 400;
`

const FooterFrame = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  bottom: 0px;
  position: relative;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const FooterRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

export default function Footer() {
  return (
    <FooterFrame>
      <FooterRow>
        <TYPE.darkGray>
          <TYPE.subHeader>
            Powered by <StyledLink href="https://bitaccess.com">Bitaccess</StyledLink>
          </TYPE.subHeader>
        </TYPE.darkGray>
        <StyledLink style={{ marginLeft: 10 }} href="https://github.com/bitaccess/aave-cash">
          <TYPE.darkGray>
            <TYPE.subHeader>v{pkg.version}</TYPE.subHeader>
          </TYPE.darkGray>
        </StyledLink>
      </FooterRow>
      <FooterRow>
        <TYPE.darkGray>
          <TYPE.subHeader>support@bitaccess.com</TYPE.subHeader>
        </TYPE.darkGray>
      </FooterRow>
    </FooterFrame>
  )
}
