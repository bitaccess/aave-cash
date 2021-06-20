import React from 'react'
import styled from 'styled-components'

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 500;
  outline: none;
  border: 1px solid ${({ theme }) => theme.bg2};
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export const TextInput = React.memo(function InnerInput({
  value,
  placeholder,
  onUserInput,
  label,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  label?: string
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  return (
    <StyledInput
      {...rest}
      value={value}
      onChange={event => {
        onUserInput(event.target.value)
      }}
      title={label}
      autoComplete="off"
      autoCorrect="off"
      type="text"
      placeholder={placeholder || ''}
      spellCheck="false"
    />
  )
})

export default TextInput
