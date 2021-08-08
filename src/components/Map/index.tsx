import React, { useMemo, memo, useCallback, useState } from 'react'
import { GoogleMap, InfoBox, Marker, useJsApiLoader } from '@react-google-maps/api'
import GeoInput from '../GeoInput'
import { CheckCircle } from 'react-feather'
import { ListItem } from '../GeoInput'
import Loader from '../Loader'
import { TYPE } from '../../theme'
import { sortBTMLocationsByDistance } from 'utils'
import { customMapStyles, darkModeCustomMapStyles } from './constants'
import { CASH_API_URL } from 'constants/index'
import MarkerIcon from '../../assets/images/bitaccess-marker.png'
import { useDarkModeManager } from '../../state/user/hooks'
import {
  Wrapper,
  AutoRow,
  InfoWindowContent,
  InfoWindowTitle,
  InfoWindowAddress,
  MapContainer,
  LocationsContainer,
  LocationsWrapper,
  containerStyle,
  SelectButtonContainer,
  SidebarContainer,
  MapComponentContainer
} from './styles'
import { MachineInformation } from 'state/user/types'

const libraries: any = ['places']

function Map({
  googleMapsAPIKey,
  defaultLat = 43.39647429559406,
  defaultLng = -95.74972745054829,
  onSelectLocation,
  showSidebar = true,
  extraQueryString
}: {
  googleMapsAPIKey: string
  defaultLat?: number
  defaultLng?: number
  onSelectLocation: (location: any) => any
  showSidebar?: boolean
  extraQueryString?: string
}) {
  const [darkMode] = useDarkModeManager()

  const [map, setMap] = useState<any>(null)
  const [locations, setLocations] = useState([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [sidebarLocations, setSidebarLocations] = useState([])
  const [clicked, setClicked] = useState<string | undefined>(undefined)
  const [selectedLocation, setSelectedLocation] = useState<MachineInformation | undefined>(undefined)
  const [showInfoFor, setShowInfoFor] = useState<string | undefined>(undefined)
  const [position, setPosition] = useState({
    lat: defaultLat,
    lng: defaultLng
  })

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsAPIKey,
    libraries
  })

  const parseMapCoordinates = (coordinates: { latitude: number; longitude: number }) => ({
    lat: coordinates.latitude,
    lng: coordinates.longitude
  })

  const onCloseClickInfoWindow = () => {
    setClicked(undefined)
    setShowInfoFor(undefined)
  }

  const onSelect = useCallback(
    (location: MachineInformation, fromInfoBox?: boolean) => {
      // unselect
      if (selectedLocation && location.machine_id == selectedLocation.machine_id) {
        setSelectedLocation(undefined)
        setClicked(undefined)
        onSelectLocation(undefined)
        return
      }
      const coordinates = parseMapCoordinates(location.coordinates)
      setSelectedLocation(location)
      setShowInfoFor(location.machine_id)
      setClicked(location.machine_id)
      if (!fromInfoBox) {
        map.setCenter(new window.google.maps.LatLng(coordinates.lat, coordinates.lng))
        setMap(map)
      }
      onSelectLocation(location)
    },
    [map, onSelectLocation, selectedLocation]
  )

  const fetchLocations = useCallback(async () => {
    setIsLoadingLocations(true)
    try {
      const response = await window
        .fetch(`${CASH_API_URL}/location${extraQueryString ? `?${extraQueryString}` : ''}`)
        .then(r => r.json())
      setLocations(response.result)
      setSidebarLocations(response.result)
      setIsLoadingLocations(false)
    } catch (err) {
      setIsLoadingLocations(false)
      console.error(err)
    }
  }, [extraQueryString, setIsLoadingLocations])

  const fetchNearbyLocations = useCallback(
    async (latitude: number, longitude: number) => {
      const sortedLocations = [...locations]
      setSidebarLocations(sortBTMLocationsByDistance(sortedLocations, { coordinates: { latitude, longitude } }))
    },
    [locations]
  )

  const onLoad = useCallback(map => {
    fetchLocations()
    map.setCenter(new window.google.maps.LatLng(defaultLat, defaultLng))
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const onMouseOverMarker = useCallback(
    (_event: any, location: any) => {
      if (!clicked) setShowInfoFor(location.machine_id)
    },
    [clicked]
  )

  const onMouseOutMarker = useCallback(() => {
    if (!clicked) setShowInfoFor(undefined)
  }, [clicked])

  const onClickMarker = useCallback((event: any, location: any) => {
    setClicked(location.machine_id)
    setShowInfoFor(location.machine_id)
    onSelect(location, true)
  }, [])

  const handleGeoInputSelection = useCallback(
    (geoValues: any) => {
      if (geoValues.location) {
        const { lat, lng } = geoValues.location
        fetchNearbyLocations(lat, lng)
        map.setCenter(new window.google.maps.LatLng(lat, lng))
        map.setZoom(7)
        setMap(map)
      }
    },
    [fetchNearbyLocations, map]
  )

  const handleDragEnd = useCallback(() => {
    if (!showSidebar) return
    const center = map.getCenter().toJSON()
    setPosition(center)
    fetchNearbyLocations(center.lat, center.lng)
  }, [fetchNearbyLocations, map, showSidebar])

  const MapComponent = useMemo(() => {
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: !darkMode ? customMapStyles : darkModeCustomMapStyles,
          gestureHandling: 'greedy',
          mapTypeControl: true
        }}
        onDragEnd={handleDragEnd}
      >
        {locations &&
          locations.map((l: any, i) => {
            const setListener = () => {
              const selectButton: any = document.getElementById(`select-${l.name}`)
              selectButton?.addEventListener('click', () => {
                onSelect(l, true)
              })
            }
            return (
              <Marker
                key={i}
                icon={MarkerIcon}
                onClick={e => onClickMarker(e, l)}
                onMouseOver={e => onMouseOverMarker(e, l)}
                onMouseOut={() => onMouseOutMarker()}
                position={parseMapCoordinates(l.coordinates)}
              >
                {showInfoFor === l.machine_id && (
                  <InfoBox
                    onCloseClick={onCloseClickInfoWindow}
                    options={{
                      boxStyle: {
                        opacity: 1,
                        width: '280px',
                        backgroundColor: '#fff',
                        paddingLeft: 10,
                        borderRadius: 4,
                        border: 'none',
                        boxShadow: '0px 6px 12px rgba(0,0,0,.1)'
                      },
                      closeBoxMargin: '10px 10px 2px 2px',
                      infoBoxClearance: new google.maps.Size(1, 1),
                      pixelOffset: new google.maps.Size(-120, 0),
                      isHidden: false,
                      enableEventPropagation: false,
                      zIndex: 9999
                    }}
                  >
                    <>
                      {setListener()}
                      <InfoWindowTitle>{l.name}</InfoWindowTitle>
                      <InfoWindowContent>
                        <InfoWindowAddress>{l.formatted_address}</InfoWindowAddress>
                        <SelectButtonContainer>
                          <TYPE.subHeader>
                            {selectedLocation && l.machine_id === selectedLocation.machine_id
                              ? '[selected]'
                              : '[click marker to select]'}
                          </TYPE.subHeader>
                        </SelectButtonContainer>
                      </InfoWindowContent>
                    </>
                  </InfoBox>
                )}
              </Marker>
            )
          })}
      </GoogleMap>
    )
  }, [
    darkMode,
    handleDragEnd,
    locations,
    onClickMarker,
    onLoad,
    onMouseOutMarker,
    onMouseOverMarker,
    onSelect,
    onUnmount,
    position,
    selectedLocation,
    showInfoFor
  ])

  return (
    <>
      {isLoaded ? (
        <Wrapper>
          <AutoRow style={{ position: 'relative' }}>
            <GeoInput
              onSelectLocation={handleGeoInputSelection}
              style={{ padding: '20px 10px 20px 10px', marginBottom: 10 }}
              placeholder="Search BTM locations by address, state, country, postal"
              fontSize={'16px'}
            />
          </AutoRow>
          <LocationsWrapper align="start">
            {showSidebar && (
              <LocationsContainer>
                <TYPE.main style={{ paddingLeft: 5 }}>Nearby BTMs</TYPE.main>
                <SidebarContainer>
                  {sidebarLocations && sidebarLocations.length > 0 && !isLoadingLocations ? (
                    sidebarLocations.map((btm: any) => {
                      const selected = selectedLocation && selectedLocation.machine_id === btm.machine_id
                      if (btm.name && btm.name !== 'Bitaccess BTM') {
                        return (
                          <ListItem key={btm.machine_id} selected={selected} onClick={() => onSelect(btm)}>
                            <div>
                              <strong style={{ position: 'relative' }}>
                                {btm.name}{' '}
                                {selected && (
                                  <CheckCircle
                                    style={{ position: 'relative', top: 1, right: 0 }}
                                    color={'#27AE60'}
                                    size={16}
                                  />
                                )}
                              </strong>
                            </div>
                            <div style={{ marginTop: 3 }}>
                              <small>{btm.formatted_address}</small>
                            </div>
                          </ListItem>
                        )
                      } else {
                        return false
                      }
                    })
                  ) : (sidebarLocations && sidebarLocations.length == 0 && !isLoadingLocations) ||
                    isLoadingLocations ? (
                    <div style={{ paddingLeft: 5, marginTop: 10 }}>
                      <Loader stroke={darkMode ? '#fff' : '#777'} />
                    </div>
                  ) : (
                    <p style={{ paddingLeft: 5 }}>No nearby locations.</p>
                  )}
                </SidebarContainer>
              </LocationsContainer>
            )}
            <MapContainer>
              <MapComponentContainer>{MapComponent}</MapComponentContainer>
            </MapContainer>
          </LocationsWrapper>
        </Wrapper>
      ) : (
        <></>
      )}
    </>
  )
}

export default memo(Map)
