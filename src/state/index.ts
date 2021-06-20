import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import loan from './loan/reducer'
import transactions from './transactions/reducer'
import lists from './lists/reducer'
import multicall from './multicall/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists', 'loan']

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    multicall,
    lists,
    loan
  },
  middleware: [...getDefaultMiddleware({ thunk: false, serializableCheck: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
