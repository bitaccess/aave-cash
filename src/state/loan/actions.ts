import { createAction } from '@reduxjs/toolkit'
import { SellTransaction } from 'services/CashApi'
import { LoanState } from './reducer'

export const addLoan = createAction<LoanState>('loan/addLoan')
export const updateCurrentStep = createAction<number>('loan/updateCurrentStep')
export const addSellTransaction = createAction<SellTransaction | undefined>('loan/addSellTransaction')
export const updateSkippedDeposit = createAction<boolean>('loan/updateSkippedDeposit')
export const updateSkippedBorrow = createAction<boolean>('loan/updateSkippedBorrow')
