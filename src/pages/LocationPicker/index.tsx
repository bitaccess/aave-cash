/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, useState, useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Wrapper } from '../../pages/Loan/styleds'
import { ButtonPrimary } from '../../components/Button'
import { AutoRow } from '../../components/Row'
import Column from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useSelectBTM, useGetBTMLocationByMachineId } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { ListItem } from 'components/GeoInput'
import { TYPE } from '../../theme'
import GeoInput from '../../components/GeoInput'
import Loader from '../../components/Loader'
import useToast from '../../services/toast'
import { CheckCircle } from 'react-feather'
import { BTMLocation, LocationPayload, GoogleLocation } from './types'
import styled from 'styled-components'
import queryString from 'querystring'
import { MAP_IFRAME_URL, SHOW_TEST_BTM_LOCATIONS } from '../../constants'
import ReactGA from 'react-ga'

export const LocationsContainer = styled(Column)`
  width: 250px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`
export const MapContainer = styled(Column)`
  flex: 1;
  height: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 100%
  `};
`

const LocationsWrapper = styled(AutoRow)`
  flex-wrap: wrap;
  margin-top: 20px;
  margin-bottom: 30px;
  flex-direction: row;
`

export default function LocationPicker() {
  const { account } = useActiveWeb3React()
  const selectBTM = useSelectBTM()
  const toast = useToast()
  const getBTMLocationByMachineId = useGetBTMLocationByMachineId()
  const [isLoading, updateIsLoading] = useState(false)
  const [isSelectingBTM, updateIsSelectingBTM] = useState(false)
  const [locations, updateLocations] = useState<BTMLocation[]>([])
  const [options, updateOptions] = useState({
    select: true,
    only: 'btm',
    subtype: 'cloud',
    alwaysUpdate: 'true',
    testLocation: SHOW_TEST_BTM_LOCATIONS
  })
  const [selectedLocation, updateSelectedLocation] = useState<BTMLocation | undefined>(undefined)
  const theme = useContext(ThemeContext)
  const mapUrl = `${MAP_IFRAME_URL}?${queryString.stringify(options)}`

  const handleSelectBTM = async () => {
    updateIsSelectingBTM(true)
    const btmMachine = await getBTMLocationByMachineId(selectedLocation?.machineName ?? '')
    if (!btmMachine?.machine_status.is_sell_available || btmMachine?.supported_cryptocurrencies.indexOf('USDC') < 0) {
      toast('error', 'This location does not support loan transactions. Please select another.')
      updateSelectedLocation(undefined)
      updateIsSelectingBTM(false)
      return
    }
    await selectBTM(selectedLocation, btmMachine.operator_id)
    ReactGA.event({
      category: 'Loan',
      action: `Select Location`,
      label: `Selected machine: ${selectedLocation?.machineName ?? 'UNKNOWN'}`
    })
    updateIsSelectingBTM(false)
  }

  const handleLocationsList = (data: LocationPayload) => {
    updateSelectedLocation(undefined)
    const isNearby = data.isNearby
    const noSlice = !isNearby || data.country || data.state || data.city
    let locs: BTMLocation[] = data.locations || []
    if (!noSlice) locs = locs.slice(0, 25)
    updateLocations(locs)
    updateIsLoading(false)
  }

  const handleListingSelect = (location: BTMLocation) => {
    updateSelectedLocation(location)
  }

  const handleEventMessage = (event: { data: { payload: any; type: string } }) => {
    const data = event.data || {}
    switch (data.type) {
      case 'locations':
        updateIsLoading(true)
        handleLocationsList(data.payload)
        break
      case 'location-info':
        handleListingSelect(data.payload)
        break
      default:
        break
    }
  }

  const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
    input !== null && input.tagName === 'IFRAME'

  const handleOnChangeAddress = (geoValues: GoogleLocation) => {
    updateIsLoading(true)
    if (geoValues.location) {
      const lat = geoValues.location.lat
      const lng = geoValues.location.lng
      const frame = document.getElementById('locations-iframe')
      try {
        if (isIFrame(frame) && frame.contentWindow) {
          frame.contentWindow.postMessage(
            {
              type: 'set-lat-lng',
              payload: { lat, lng }
            },
            '*'
          )
          frame.contentWindow.focus()
        }
      } catch (e) {
        console.error(e.message || e)
        updateOptions(Object.assign({}, options, { lat, lng }))
      }
    }
  }

  useEffect(() => {
    updateIsLoading(true)
    window.addEventListener('message', handleEventMessage)
    return () => {
      window.removeEventListener('message', () => {
        return
      })
    }
  }, [])

  return (
    <>
      {account && (
        <>
          <TYPE.largeHeader style={{ marginBottom: 30 }}>Choose a BTM location to receive your cash</TYPE.largeHeader>
          <AppBody size="lg">
            <Wrapper id="location-picker">
              <AutoRow style={{ position: 'relative' }}>
                <GeoInput
                  style={{ padding: '20px 10px 20px 10px' }}
                  placeholder="Search BTM locations by address, state, country, postal"
                  onSelectLocation={handleOnChangeAddress}
                  fontSize={'16px'}
                />
              </AutoRow>
              <LocationsWrapper align="start">
                <LocationsContainer>
                  <TYPE.main style={{ paddingLeft: 5 }}>Nearby BTMs</TYPE.main>
                  <div style={{ maxHeight: 480, overflowY: 'scroll' }}>
                    {locations.length > 0 && !isLoading ? (
                      locations.map((btm: BTMLocation) => {
                        const selected = selectedLocation && selectedLocation.placeId === btm.placeId
                        if (btm.locationName && btm.locationName !== 'Bitaccess BTM') {
                          return (
                            <ListItem key={btm.placeId} selected={selected} onClick={() => handleListingSelect(btm)}>
                              <div>
                                <strong>
                                  {btm.locationName}{' '}
                                  {selected && (
                                    <CheckCircle
                                      style={{ position: 'relative', top: 2 }}
                                      color={theme.green1}
                                      size={16}
                                    />
                                  )}
                                </strong>
                              </div>
                              <div style={{ marginTop: 3 }}>
                                <small>{btm.formattedAddress}</small>
                              </div>
                            </ListItem>
                          )
                        } else {
                          return false
                        }
                      })
                    ) : (locations.length == 0 && isLoading) || isLoading ? (
                      <div style={{ paddingLeft: 5, marginTop: 10 }}>
                        <Loader stroke={theme.bg5} />
                      </div>
                    ) : (
                      <p style={{ paddingLeft: 5 }}>No nearby locations.</p>
                    )}
                  </div>
                </LocationsContainer>
                <MapContainer>
                  <div style={{ width: '100%', height: 500 }}>
                    <iframe
                      id="locations-iframe"
                      src={mapUrl}
                      height="100%"
                      width="100%"
                      frameBorder="0"
                      title="btm-locations"
                      style={{ border: 0 }}
                    />
                  </div>
                </MapContainer>
              </LocationsWrapper>
              <AutoRow>
                <ButtonPrimary
                  padding="15px"
                  borderRadius="0"
                  style={{ marginTop: 10 }}
                  disabled={!selectedLocation || isSelectingBTM}
                  onClick={handleSelectBTM}
                >
                  {!isSelectingBTM ? (
                    `Choose ${selectedLocation ? selectedLocation.locationName : ''} BTM Location`
                  ) : (
                    <Loader stroke="white" />
                  )}
                </ButtonPrimary>
              </AutoRow>
            </Wrapper>
          </AppBody>
        </>
      )}
    </>
  )
}
