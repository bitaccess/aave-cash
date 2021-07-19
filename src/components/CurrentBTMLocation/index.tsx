import React from 'react'
import styled from 'styled-components'
import { useSelectedBTM } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { Link } from 'react-router-dom'

const Container = styled.div``

const ActiveLocation = styled.div`
  position: relative;
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #98f5dd;
  text-align: center;
  margin-right: 5px;
  top: 1px;
  &:before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 50%;
    width: 7px;
    height: 7px;
    background-color: rgba(14, 179, 137, 1);
  }
`

export default function CurrentBTMLocation({
  canChangeLocation = true,
  style
}: {
  canChangeLocation?: boolean
  style?: object
}) {
  const currentBTM = useSelectedBTM()
  return (
    <Container style={{ marginBottom: 5, ...style }}>
      <TYPE.subHeader style={{ marginBottom: 10 }}>Selected BTM Location</TYPE.subHeader>
      <div>
        <ActiveLocation />
        <strong>{currentBTM?.name}</strong>
      </div>
      <div>
        <small>{currentBTM?.formatted_address}</small>
      </div>
      {canChangeLocation && (
        <div style={{ marginTop: 3 }}>
          <Link style={{ fontWeight: 500, textDecoration: 'none' }} to="/user/locations">
            <small>Change Location</small>
          </Link>
        </div>
      )}
    </Container>
  )
}
