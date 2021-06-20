import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'

const Container = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  margin: 10px 0px;
`

const StepListItem = styled.li<{ active: boolean; completed: boolean; i: number; numberOfSteps: number }>`
  list-style: none;
  display: inline-block;
  width: ${({ numberOfSteps }) => `calc(100% / ${numberOfSteps})`};
  position: relative;
  text-align: center;
  cursor: default;
  &:before {
    content: '${({ i, completed }) => (!completed ? i : '✓')}';
    width: 30px;
    height: 30px;
    line-height: 30px;
    border: 1px solid ${({ active, completed, theme }) => (active ? theme.black : completed ? '#000' : '#ddd')};
    color: ${({ active, completed, theme }) => (active ? theme.white : completed ? theme.white : '#000')}
    border-radius: 100%;
    display: block;
    text-align: center;
    margin: 0 auto 10px auto;
    background-color: ${({ active, completed, theme }) => (active ? theme.black : completed ? '#000' : '#fff')};
    position: relative;
    z-index: 2;
  }
  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: #000;
    top: 15px;
    left: -50%;
    z-index : 1;
  }
  &:first-child:after {
    content: none;
    z-index : 1;
  }
`

export default function ProgressBar({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <Container>
      <ul style={{ paddingLeft: 0, width: '100%' }}>
        {steps.map((step, i) => {
          return (
            <StepListItem
              key={step}
              i={i + 1}
              numberOfSteps={steps.length}
              completed={currentStep > i}
              active={currentStep === i}
            >
              <TYPE.small>{step}</TYPE.small>
            </StepListItem>
          )
        })}
      </ul>
    </Container>
  )
}
