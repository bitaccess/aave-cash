import React from 'react'
import TextInput from 'components/TextInput'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'
import styled from 'styled-components'
import useOnclickOutside from 'react-cool-onclickoutside'

export const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 0px;
  padding: 1rem;
  position: absolute;
  top: 62px;
  z-index: 9;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`

const Dropdown = styled(Container)``

export const ListItem = styled.p<{
  selected?: boolean
}>`
  margin: 0px;
  background-color: ${({ selected, theme }) => (selected ? theme.bg2 : theme.bg1)};
  padding: 10px 5px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
  }
`
export const CloseButton = styled.div`
  position: absolute;
  right: 20px;
  top: 13px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  font-size: 18px;
  line-height: 35px;
  text-align: center;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
  }
`

export const GeoInput = React.memo(function InnerInput({
  onSelectLocation,
  placeholder,
  label,
  ...rest
}: {
  onSelectLocation: (geoValues: { location: { lat: number; lng: number }; viewport: any }) => void
  label?: string
  fontSize?: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300
  })

  const ref = useOnclickOutside(() => {
    clearSuggestions()
  })

  const handleInput = (value: string) => {
    setValue(value)
  }

  const handleSelect = ({ description }: { description: string }) => () => {
    setValue(description, false)
    clearSuggestions()
    getGeocode({ address: description })
      .then(results => {
        return results[0]
      })
      .then(async (result: any) => {
        onSelectLocation({
          location: await getLatLng(result),
          viewport: result.geometry.viewport
        })
      })
      .catch(error => {
        console.log('😱 Error: ', error)
      })
  }

  const renderSuggestions = () =>
    data.map(suggestion => {
      const {
        place_id: placeId,
        structured_formatting: { main_text: mainText, secondary_text: secondaryText }
      } = suggestion

      return (
        <ListItem key={placeId} onClick={handleSelect(suggestion)}>
          <strong>{mainText}</strong> <small>{secondaryText}</small>
        </ListItem>
      )
    })

  return (
    <div ref={ref} style={{ display: 'flex', flex: 1, position: 'relative' }}>
      <TextInput
        {...rest}
        onUserInput={handleInput}
        value={value}
        label={label}
        placeholder={placeholder}
        disabled={!ready}
      />
      {value && <CloseButton onClick={() => handleInput('')}>✕</CloseButton>}
      {status === 'OK' && <Dropdown>{renderSuggestions()}</Dropdown>}
    </div>
  )
})

export default GeoInput
