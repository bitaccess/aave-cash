import React, { useEffect, useContext, useState } from 'react'
import { ThemeContext } from 'styled-components'
import styled from 'styled-components'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import {
  useMachineInformation,
  useGetClientLimits,
  useClientLimits,
  useGetClientLevelUpUrl,
  useLevelUpUrl
} from 'state/user/hooks'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { ButtonPrimary, ButtonGray } from '../../components/Button'
import { Link } from 'react-router-dom'
import { Check, X } from 'react-feather'
import { CurrentBTMContainer } from 'pages/Loan'
import CurrentBTMLocation from 'components/CurrentBTMLocation'
import ReactGA from 'react-ga'
import LevelUpModal from 'components/LevelUpModal'

const StepContainer = styled.div`
  margin-top: 10px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 0px;
  padding: 1rem 1rem;
  border: 1px solid ${({ theme }) => theme.bg2};
`

const List = styled.ul`
  list-style: none;
  padding-left: 10px;
  margin-top: 20px;
`

const IconContainer = styled.div`
  display: inline;
  position: relative;
  top: 3px;
  margin-right: 7px;
`

export default function Limits() {
  const theme = useContext(ThemeContext)
  const getClientLimits = useGetClientLimits()
  const machineInformation = useMachineInformation()
  const clientLimits = useClientLimits()
  const userLimit = clientLimits?.sell_current_adjusted || 0
  const levelUp = clientLimits?.level_up
  const hasLimit = userLimit > 0
  const highestRequirements = levelUp?.[levelUp.length - 1] || undefined
  const getLevelUpUrl = useGetClientLevelUpUrl()
  const levelUpUrl = useLevelUpUrl()
  const [isModalOpen, updateIsModalOpen] = useState<boolean>(false)

  const handleModal = (setting: boolean) => {
    updateIsModalOpen(setting)
  }

  useEffect(() => {
    const handleGetClientLimits = async () => {
      machineInformation && (await getClientLimits(machineInformation?.operator_id, machineInformation?.machine_id))
    }
    const handleGetLevelUpUrl = async () => {
      await getLevelUpUrl()
    }
    handleGetLevelUpUrl()
    handleGetClientLimits()
  }, [])

  const IncreaseLimitsButton = hasLimit ? ButtonGray : ButtonPrimary

  return (
    <>
      <TYPE.largeHeader style={{ marginBottom: 30 }}>
        Your Current Limit: {userLimit} {clientLimits?.currency}
      </TYPE.largeHeader>
      <AppBody>
        <CardHeader title="Available KYC Options" />
        <Wrapper id="limits-page">
          {levelUp?.map((level, i) => {
            return (
              <StepContainer key={i}>
                <TYPE.largeHeader>Level {i + 1}</TYPE.largeHeader>
                <TYPE.subHeader style={{ marginTop: 5, textTransform: 'capitalize' }}>
                  Limit: {level.max.per_txn} {machineInformation?.primary_currency}
                </TYPE.subHeader>
                <List>
                  {highestRequirements?.required?.map((req, i) => {
                    const isRequired = level.required.some(r => r === req)
                    return (
                      <li key={`${req}${i}`}>
                        {isRequired ? (
                          <IconContainer>
                            <Check color={theme.green1} size={16} />
                          </IconContainer>
                        ) : (
                          <IconContainer>
                            <X color={theme.red1} size={16} />
                          </IconContainer>
                        )}
                        <TYPE.subHeader style={{ display: 'inline-block' }}>{req}</TYPE.subHeader>
                      </li>
                    )
                  })}
                </List>
              </StepContainer>
            )
          })}
          {hasLimit && (
            <Link
              onClick={() => {
                ReactGA.event({
                  category: 'Loan',
                  action: `Skip KYC`,
                  label: `Skip KYC with limit: ${userLimit}`
                })
              }}
              style={{ textDecoration: 'none' }}
              to="/user/borrow"
            >
              <ButtonPrimary style={{ marginTop: 10 }} borderRadius="0">
                Continue with {userLimit} {clientLimits?.currency} Limit
              </ButtonPrimary>
            </Link>
          )}
          <IncreaseLimitsButton borderRadius="0" style={{ marginTop: 10 }} onClick={() => handleModal(true)}>
            Increase Limits
          </IncreaseLimitsButton>
        </Wrapper>
      </AppBody>
      <LevelUpModal
        levelUpUrl={levelUpUrl ?? ''}
        userLimit={userLimit}
        isOpen={isModalOpen}
        onDismiss={(setting: boolean) => handleModal(setting)}
      />
      <CurrentBTMContainer>
        <CurrentBTMLocation />
      </CurrentBTMContainer>
    </>
  )
}
