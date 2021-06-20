/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import Modal from '../Modal'
import styled from 'styled-components'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { ButtonPrimary, ButtonGray } from 'components/Button'
// import { RowBetween } from 'components/Row'
import { StyledExternalLink } from 'pages/Home'
import ReactGA from 'react-ga'
import { RowBetween } from 'components/Row'
import { useHistory } from 'react-router-dom'

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
  levelUpUrl,
  userLimit
}: {
  isOpen: boolean
  levelUpUrl: string
  userLimit: number
  onDismiss: (setting: boolean) => void
}) {
  const history = useHistory()
  return (
    <Modal isOpen={isOpen} size="lg" onDismiss={() => onDismiss(false)}>
      <Wrapper>
        <UpperSection>
          <CloseIcon onClick={() => onDismiss(false)}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>
            <div>Increase Limits</div>
          </HeaderRow>
          <ContentWrapper>
            <ol>
              <li>Click the button below to go to an external BTM website</li>
              <li>Select your desired BTM location again</li>
              <li>Go through KYC process until you have the limit you want</li>
              <li>Return to this page and click the "Continue" button below</li>
            </ol>
          </ContentWrapper>
          <BottomWrapper>
            <RowBetween>
              <StyledExternalLink href={levelUpUrl ?? 'https://bitaccess.com'}>
                <ButtonPrimary
                  onClick={() => {
                    ReactGA.event({
                      category: 'Loan',
                      action: `Begin KYC`,
                      label: `Begin KYC with limit: ${userLimit}`
                    })
                  }}
                  borderRadius="0"
                  style={{ marginRight: 10 }}
                >
                  Increase Limits <span style={{ fontSize: '11px' }}> ↗</span>
                </ButtonPrimary>
              </StyledExternalLink>
              <ButtonGray disabled={userLimit <= 0} onClick={() => history.push('/user/borrow')}>
                Continue to Next Step
              </ButtonGray>
            </RowBetween>
          </BottomWrapper>
        </UpperSection>
      </Wrapper>
    </Modal>
  )
}
