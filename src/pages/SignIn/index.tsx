import React, { useMemo, useState } from 'react'
import { Wrapper } from 'pages/Loan/styleds'
import CardHeader from '../../components/CardHeader'
import { ButtonPrimary } from '../../components/Button'
import { AutoRow } from '../../components/Row'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useRequestPhoneVerification } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import { PhoneInput, COUNTRIES } from 'baseui/phone-input'
import { isValidPhoneNumber as validatePhoneNumber } from 'libphonenumber-js'

export default function SignIn() {
  const { account } = useActiveWeb3React()
  const [country, setCountry] = useState(COUNTRIES.US)
  const [text, setText] = useState('')
  const [isValidPhoneNumber, updatePhoneNumberValidity] = useState(false)
  const [isSendingText, updateIsSendingText] = useState(false)
  const requestPhoneVerification = useRequestPhoneVerification()

  useMemo(() => {
    const isValid = validatePhoneNumber(`${country.dialCode}${text}`, country.id)
    updatePhoneNumberValidity(isValid)
  }, [text, country])

  const handleSendVerificationCode = async () => {
    updateIsSendingText(true)
    await requestPhoneVerification(`${country.dialCode}${text}`)
    updateIsSendingText(false)
  }

  return (
    <>
      {account && (
        <>
          <TYPE.largeHeader style={{ marginBottom: 30 }}>Authenticate with your phone number</TYPE.largeHeader>
          <AppBody>
            <CardHeader title="Phone Number" />
            <Wrapper id="signin-page">
              <AutoRow>
                <PhoneInput
                  text={text}
                  country={country}
                  onTextChange={event => {
                    setText(event.currentTarget.value)
                  }}
                  onCountryChange={(event: any) => {
                    setCountry(event.option)
                  }}
                  overrides={{
                    CountrySelect: {
                      props: {
                        overrides: {
                          Popover: {
                            props: {
                              overrides: {
                                Body: {
                                  style: {
                                    position: 'absolute',
                                    zIndex: 9
                                  }
                                }
                              }
                            }
                          },
                          Dropdown: {
                            props: {
                              style: {
                                position: 'absolute',
                                zIndex: 9,
                                top: '0px'
                              }
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </AutoRow>
              <AutoRow>
                <ButtonPrimary
                  padding="15px"
                  borderRadius="0"
                  style={{ marginTop: 10 }}
                  onClick={handleSendVerificationCode}
                  disabled={!isValidPhoneNumber || isSendingText}
                >
                  {!isSendingText ? 'Send Verification Code' : <Loader stroke="white" />}
                </ButtonPrimary>
              </AutoRow>
            </Wrapper>
          </AppBody>
        </>
      )}
    </>
  )
}
