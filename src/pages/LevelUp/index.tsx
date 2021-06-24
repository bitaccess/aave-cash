import React, { useEffect, useState } from 'react'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import { useClientLimits, useLevelUpUrl, useGetClientLevelUpUrl } from 'state/user/hooks'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import { useHistory } from 'react-router-dom'
import ReactGA from 'react-ga'

export default function LevelUp() {
  const history = useHistory()
  const getLevelUpUrl = useGetClientLevelUpUrl()
  const levelUpUrl = useLevelUpUrl()
  const clientLimits = useClientLimits()
  const userLimit = clientLimits?.sell_current_adjusted || 0
  const [isButtonDisabled, updateIsButtonDisabled] = useState<boolean>(userLimit === 0)

  const handleEventMessage = (event: { data: { payload: any; type: string } }) => {
    const data = event.data || {}
    switch (data.type) {
      case 'level-up-exit':
        break
      case 'level-up-success':
        ReactGA.event({
          category: 'Limits',
          action: `Increase Limits`,
          label: `Increased limit with current limit of: ${userLimit}`
        })
        updateIsButtonDisabled(false)
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (userLimit > 0) {
      updateIsButtonDisabled(false)
    }
  }, [userLimit])

  useEffect(() => {
    window.addEventListener('message', handleEventMessage)
    const handleGetLevelUpUrl = async () => {
      await getLevelUpUrl()
    }
    handleGetLevelUpUrl()
    return () => {
      window.removeEventListener('message', () => {
        return
      })
    }
  }, [])

  return (
    <>
      <TYPE.largeHeader style={{ marginBottom: 30 }}>Increase your limits</TYPE.largeHeader>
      <AppBody style={{ minWidth: '85vw', minHeight: '600px' }}>
        <CardHeader title="BTM KYC" />
        <Wrapper id="levelup-page">
          {levelUpUrl && (
            <iframe
              src={levelUpUrl}
              id="leveup-iframe"
              height="600px"
              width="100%"
              frameBorder="0"
              title="level-up-flow"
              style={{ border: 0 }}
            />
          )}
          <ButtonPrimary
            disabled={isButtonDisabled}
            borderRadius="0"
            style={{ marginTop: 10 }}
            onClick={() => history.push('/user/borrow')}
          >
            Continue To Create A Loan
          </ButtonPrimary>
        </Wrapper>
      </AppBody>
    </>
  )
}
