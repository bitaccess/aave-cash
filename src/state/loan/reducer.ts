import { createReducer } from '@reduxjs/toolkit'
import { Currency } from '@uniswap/sdk'
import { SellTransaction } from 'services/CashApi'
import { addLoan, updateCurrentStep, addSellTransaction, updateSkippedDeposit, updateSkippedBorrow } from './actions'

export interface LoanState {
  depositCurrency: Currency | undefined | null
  receiveCurrency: Currency | undefined | null
  depositAmount: string
  receiveAmount: string
  borrowAmount: string
  receiveTokenAddress: string
  depositTokenAddress: string
  currentStep: number
  skippedDeposit?: boolean
  skippedBorrow?: boolean
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
  skippedDeposit: false,
  skippedBorrow: false,
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
      state.skippedBorrow = action.payload.skippedBorrow ?? false
      state.skippedDeposit = action.payload.skippedDeposit ?? false
    })
    .addCase(updateCurrentStep, (state, action) => {
      state.currentStep = action.payload
    })
    .addCase(updateSkippedDeposit, (state, action) => {
      state.skippedDeposit = action.payload
    })
    .addCase(updateSkippedBorrow, (state, action) => {
      state.skippedBorrow = action.payload
    })
    .addCase(addSellTransaction, (state, action) => {
      state.sellTransaction = action.payload
    })
)
