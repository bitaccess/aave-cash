import React, { useMemo, useState } from 'react'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import { ButtonPrimary, ButtonOutlined } from '../../components/Button'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useVerifyPhoneNumber, useResendPhoneVerification } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { AutoRow } from '../../components/Row'
import { PinCode } from 'baseui/pin-code'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const CODE_LENGTH = 6
const RESEND_INTERVAL = 60

export default function VerifyPhone() {
  const { account } = useActiveWeb3React()
  const [values, setValues] = useState(['', '', '', '', '', ''])
  const [isValidCode, updateIsValidCode] = useState(false)
  const [isValidatingCode, updateIsValidatingCode] = useState(false)
  const [canResendCode, updateCanResendCode] = useState(false)
  const [isSendingText, updateIsSendingText] = useState(false)
  const verifyPhoneNumber = useVerifyPhoneNumber()
  const requestPhoneVerification = useResendPhoneVerification()

  const handleSendVerificationCode = async () => {
    updateIsSendingText(true)
    await requestPhoneVerification()
    updateIsSendingText(false)
    updateCanResendCode(false)
  }

  const handleValidateCode = async () => {
    updateIsValidatingCode(true)
    await verifyPhoneNumber(values.join(''))
    updateIsValidatingCode(false)
  }

  useMemo(() => {
    updateIsValidCode(values.length == CODE_LENGTH && !values.some(n => isNaN(parseInt(n))))
  }, [values])

  return (
    <>
      {account && (
        <>
          <TYPE.largeHeader style={{ marginBottom: 30 }}>Verify your phone number</TYPE.largeHeader>
          <AppBody>
            <CardHeader title="Verification Code" />
            <Wrapper id="verifyphone-page">
              <AutoRow style={{ marginBottom: 10, marginTop: 10 }} justify="center">
                <PinCode
                  placeholder=""
                  autoFocus={true}
                  values={values}
                  onChange={({ values }) => {
                    setValues(values)
                  }}
                />
              </AutoRow>
              <AutoRow>
                <ButtonPrimary
                  padding="15px"
                  borderRadius="0"
                  style={{ marginTop: 10 }}
                  onClick={handleValidateCode}
                  disabled={!isValidCode || isValidatingCode}
                >
                  {!isValidatingCode ? 'Verify Code' : <Loader stroke="white" />}
                </ButtonPrimary>
                <ButtonOutlined
                  onClick={handleSendVerificationCode}
                  disabled={!canResendCode || isSendingText}
                  padding="15px"
                  borderRadius="0"
                  style={{ marginTop: 10 }}
                >
                  {!canResendCode && (
                    <CountdownCircleTimer
                      isPlaying
                      onComplete={() => {
                        updateCanResendCode(true)
                        return [false, 0] // repeat animation in 1.5 seconds
                      }}
                      duration={RESEND_INTERVAL}
                      size={30}
                      strokeWidth={2}
                      colors={[
                        ['#004777', 0.33],
                        ['#F7B801', 0.33],
                        ['#A30000', 0.33]
                      ]}
                    >
                      {({ remainingTime }) => <span style={{ fontSize: 10, fontWeight: 600 }}>{remainingTime}</span>}
                    </CountdownCircleTimer>
                  )}

                  <span style={{ display: 'inline-block', marginLeft: 10 }}>
                    {!isSendingText ? 'Resend Code' : <Loader stroke="black" />}
                  </span>
                </ButtonOutlined>
              </AutoRow>
            </Wrapper>
          </AppBody>
        </>
      )}
    </>
  )
}
