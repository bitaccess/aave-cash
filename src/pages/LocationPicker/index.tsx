/* eslint-disable @typescript-eslint/camelcase */
import React, { useState } from 'react'
import { ButtonPrimary } from '../../components/Button'
import Column from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import { useSelectBTM, useGetBTMLocationByMachineId } from '../../state/user/hooks'
import { MachineInformation } from '../../state/user/types'
import AppBody from '../AppBody'
import { TYPE } from '../../theme'
import useToast from '../../services/toast'
import styled from 'styled-components'
import { GOOGLE_MAPS_API_KEY } from '../../constants'
import ReactGA from 'react-ga'
import Map from 'components/Map'
import Loader from 'components/Loader'

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

export default function LocationPicker() {
  const { account } = useActiveWeb3React()
  const selectBTM = useSelectBTM()
  const toast = useToast()
  const getBTMLocationByMachineId = useGetBTMLocationByMachineId()
  const [selectedLocation, updateSelectedLocation] = useState<MachineInformation | undefined>(undefined)
  const [isSelectingLocation, updateIsSelectingLocation] = useState<boolean>(false)

  const onSelectLocation = (location: MachineInformation) => {
    updateSelectedLocation(location)
  }

  const handleSelectBTMAndGoToNextStep = async () => {
    updateIsSelectingLocation(true)
    try {
      await getBTMLocationByMachineId(selectedLocation?.machine_id ?? '')
      await selectBTM(selectedLocation)
      ReactGA.event({
        category: 'Loan',
        action: `Select Location`,
        label: `Selected machine: ${selectedLocation?.machine_id ?? 'UNKNOWN'}`
      })
      updateIsSelectingLocation(false)
    } catch (err) {
      toast('error', 'There was an error selecting this location. Please try again.')
      updateIsSelectingLocation(false)
    }
  }
  return (
    <>
      {account && (
        <>
          <TYPE.largeHeader style={{ marginBottom: 30 }}>Choose a BTM location to receive your cash</TYPE.largeHeader>
          <AppBody size="lg">
            <div style={{ height: 600 }}>
              <Map
                googleMapsAPIKey={GOOGLE_MAPS_API_KEY ?? ''}
                onSelectLocation={onSelectLocation}
                extraQueryString={'machine_status.is_sell_available=true'}
              />
            </div>
            <ButtonPrimary disabled={!selectedLocation || isSelectingLocation} onClick={handleSelectBTMAndGoToNextStep}>
              {!isSelectingLocation ? (
                selectedLocation ? (
                  `Select ${selectedLocation?.name} BTM Location`
                ) : (
                  'Choose BTM Location'
                )
              ) : (
                <Loader stroke="white" />
              )}
            </ButtonPrimary>
          </AppBody>
        </>
      )}
    </>
  )
}
