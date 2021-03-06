import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'

const StyledCardHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function CardHeader({ title }: { title: string }) {
  return (
    <StyledCardHeader>
      <RowBetween>
        <TYPE.black fontWeight={500}>{title}</TYPE.black>
      </RowBetween>
    </StyledCardHeader>
  )
}
