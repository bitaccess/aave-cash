import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { transparentize } from 'polished'

const Wrapper = styled(AutoColumn)``

const Grouping = styled(RowBetween)`
  width: 100%;
`

const Circle = styled.div<{ confirmed?: boolean; disabled?: boolean }>`
  min-width: 20px;
  min-height: 20px;
  background-color: ${({ theme, confirmed, disabled }) =>
    disabled ? theme.bg4 : confirmed ? theme.green1 : theme.primary1};
  border-radius: 0px;
  color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 8px;
  font-size: 12px;
`

const CircleRow = styled.div`
  width: calc(100% - 20px);
  display: flex;
  align-items: center;
  position: relative;
`

const Connector = styled.div<{ prevConfirmed?: boolean; disabled?: boolean }>`
  width: 100%;
  height: 2px;
  background-color: ;
  background: linear-gradient(
    90deg,
    ${({ theme, prevConfirmed, disabled }) =>
        disabled ? theme.bg4 : transparentize(0.5, prevConfirmed ? theme.green1 : theme.primary1)}
      0%,
    ${({ theme, prevConfirmed, disabled }) => (disabled ? theme.bg4 : prevConfirmed ? theme.primary1 : theme.bg4)} 80%
  );
  opacity: 0.6;
`

interface ProgressCirclesProps {
  steps: { title: string }[]
  disabled?: boolean
  currentStep: number
}

export default function Steps({ steps, currentStep, disabled = false, ...rest }: ProgressCirclesProps) {
  return (
    <Wrapper justify={'center'} {...rest}>
      <Grouping>
        {steps.map((step, i) => {
          return (
            <>
              <CircleRow key={i}>
                <Circle confirmed={currentStep > i} disabled={disabled || (!steps[i - 1] && i !== 0)}>
                  {currentStep > i ? '✓' : i + 1}
                </Circle>
                <Connector prevConfirmed={currentStep > i - 1} disabled={disabled} />
              </CircleRow>
            </>
          )
        })}
        <Circle disabled={disabled || !steps[steps.length - 1]}>{steps.length + 1}</Circle>
      </Grouping>
    </Wrapper>
  )
}
