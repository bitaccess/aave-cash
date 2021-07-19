import styled from 'styled-components'
import { Box } from 'rebass/styled-components'

export const Row = styled(Box)<{
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? 'center'};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify && justify};

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`

export const Wrapper = styled.div`
  position: relative;
  padding: 1rem;
  height: 100%;
  width: 100%;
`

export const InfoWindowTitle = styled.h2`
  padding-left: 10px;
  color: #000;
`

export const InfoWindowContent = styled.div`
  font-size: 14px;
  padding: 0px 10px 0px 10px;
`

export const InfoWindowAddress = styled.p`
  color: #444;
`

export const SelectButtonContainer = styled.div`
  margin: 20px 0 10px 0;
  text-align: center;
`

export const SelectButton = styled.button<{ selected: boolean }>`
  background-color: ${({ selected }) => (!selected ? '#dd6b20' : '#1aba62')};
  border: 1px solid ${({ selected }) => (!selected ? '#dd6b20' : '#1aba62')};
  border-radius: 2px;
  color: #f1f1f1;
  cursor: pointer;
  height: 34px;
  letter-spacing: 1px;
  line-height: 4px;
  padding: 15px 10px;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%;
  font-weight: 600;
  &:hover {
    background-color: ${({ selected }) => (!selected ? '#c9621c' : '#15a154')};
    border-color: ${({ selected }) => (!selected ? '#c9621c' : '#15a154')};
  }
`

export const containerStyle = {
  width: '100%',
  height: '100%'
}

export const LocationsContainer = styled(Column)`
  width: 250px;
  height: 100%;
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

export const SidebarContainer = styled(Column)`
  overflow-y: scroll;
  height: calc(100% - 110px);
`

export const MapComponentContainer = styled(Column)`
  height: calc(100% - 90px);
`

export const LocationsWrapper = styled(AutoRow)`
  height: 100%;
  flex-wrap: wrap;
  margin-top: 20px;
  margin-bottom: 30px;
  flex-direction: row;
`
