import { createReducer } from '@reduxjs/toolkit'
import { updateVersion } from '../global/actions'
import {
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserExpertMode,
  updatePhoneVerification,
  updateUserAfterVerification,
  updateSelectedBTM,
  updateMachineInformation,
  updateClientLimits,
  updateLevelUpUrl,
  ClientLimits
} from './actions'

import { MachineInformation } from './types'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches

  userExpertMode: boolean
  selectedBTM: MachineInformation | undefined

  clientLimits: ClientLimits | undefined

  machineInformation: MachineInformation | undefined
  timestamp: number
  phoneNumber: string
  key: string
  clientId: string
  accessToken: string
  levelUpUrl: string
}

export const initialState: UserState = {
  userDarkMode: null,
  matchesDarkMode: false,
  userExpertMode: false,
  selectedBTM: undefined,
  machineInformation: undefined,
  clientLimits: undefined,
  timestamp: currentTimestamp(),
  phoneNumber: '',
  key: '',
  clientId: '',
  accessToken: '',
  levelUpUrl: ''
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateVersion, state => {
      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updatePhoneVerification, (state, action) => {
      state.phoneNumber = action.payload.phoneNumber
      state.key = action.payload.key
    })
    .addCase(updateUserAfterVerification, (state, action) => {
      state.clientId = action.payload.clientId
      state.accessToken = action.payload.token
    })
    .addCase(updateSelectedBTM, (state, action) => {
      state.selectedBTM = action.payload.selectedBTM
    })
    .addCase(updateMachineInformation, (state, action) => {
      state.machineInformation = action.payload.machineInformation
    })
    .addCase(updateClientLimits, (state, action) => {
      state.clientLimits = action.payload.clientLimits
    })
    .addCase(updateLevelUpUrl, (state, action) => {
      state.levelUpUrl = action.payload.levelUpUrl
    })
)
