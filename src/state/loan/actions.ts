import { createAction } from '@reduxjs/toolkit'
import { SellTransaction } from 'services/CashApi'
import { LoanState } from './reducer'

export const addLoan = createAction<LoanState>('loan/addLoan')
export const updateCurrentStep = createAction<number>('loan/updateCurrentStep')
export const addSellTransaction = createAction<SellTransaction | undefined>('loan/addSellTransaction')
