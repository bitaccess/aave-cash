import { createAction } from '@reduxjs/toolkit'
import { MachineInformation } from './types'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export interface LevelUpLimits {
  per_txn: number
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

export interface LevelUp {
  improvement: string
  max: LevelUpLimits
  min: LevelUpLimits
  required: string[]
  type: string
}

export interface ClientLimits {
  is_verification_allowed: boolean
  buy_current: number
  sell_current: number
  sell_current_adjusted: number
  no_of_txns_daily: number
  buy_daily_projected_level: number
  sell_daily_projected_level: number
  currency: string
  level_up: LevelUp[]
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('user/updateUserExpertMode')
export const updatePhoneVerification = createAction<{ phoneNumber: string; key: string }>(
  'user/updatePhoneVerification'
)
export const updateUserAfterVerification = createAction<{ clientId: string; token: string }>(
  'user/updateUserAfterVerification'
)
export const updateSelectedBTM = createAction<{ selectedBTM: MachineInformation | undefined }>('user/updateSelectedBTM')
export const updateMachineInformation = createAction<{ machineInformation: MachineInformation | undefined }>(
  'user/updateMachineInformation'
)
export const updateClientLimits = createAction<{ clientLimits: ClientLimits | undefined }>('user/updateClientLimits')
export const updateLevelUpUrl = createAction<{ levelUpUrl: string }>('user/updateLevelUpUrl')
