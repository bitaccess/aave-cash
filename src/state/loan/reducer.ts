import { createReducer } from '@reduxjs/toolkit'
import { Currency } from '@uniswap/sdk'
import { SellTransaction } from 'services/CashApi'
import { addLoan, updateCurrentStep, addSellTransaction } from './actions'

export interface LoanState {
  depositCurrency: Currency | undefined | null
  receiveCurrency: Currency | undefined | null
  depositAmount: string
  receiveAmount: string
  borrowAmount: string
  receiveTokenAddress: string
  depositTokenAddress: string
  currentStep: number
  sellTransaction?: SellTransaction | undefined
}

export const initialState: LoanState = {
  depositCurrency: undefined,
  receiveCurrency: undefined,
  depositAmount: '',
  receiveAmount: '',
  receiveTokenAddress: '',
  borrowAmount: '',
  depositTokenAddress: '',
  currentStep: 0,
  sellTransaction: undefined
}

export default createReducer(initialState, builder =>
  builder
    .addCase(addLoan, (state, action) => {
      state.depositCurrency = action.payload.depositCurrency
      state.receiveCurrency = action.payload.receiveCurrency
      state.borrowAmount = action.payload.borrowAmount
      state.depositAmount = action.payload.depositAmount
      state.receiveAmount = action.payload.receiveAmount
      state.receiveTokenAddress = action.payload.receiveTokenAddress
      state.depositTokenAddress = action.payload.depositTokenAddress
    })
    .addCase(updateCurrentStep, (state, action) => {
      state.currentStep = action.payload
    })
    .addCase(addSellTransaction, (state, action) => {
      state.sellTransaction = action.payload
    })
)
