import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import {
  sendVerificationCode,
  verifyPhoneNumber,
  getBTMLocationByMachineId,
  getClient,
  getClientLimits,
  searchLocations,
  changeOperator,
  getClientLevelUpUrl
} from '../../services/CashApi'
import useToast from '../../services/toast'
import { useHandleUnauthorizedError } from 'state/application/hooks'
import { AppDispatch, AppState } from '../index'
import {
  updateUserDarkMode,
  updateUserExpertMode,
  updatePhoneVerification,
  updateUserAfterVerification,
  updateSelectedBTM,
  updateMachineInformation,
  ClientLimits,
  updateClientLimits,
  updateLevelUpUrl
} from './actions'
import { MachineInformation } from 'state/user/types'

export function useAccessToken(): string | undefined {
  const accessToken = useSelector<AppState, AppState['user']['accessToken']>(state => state.user.accessToken)
  return accessToken
}

export function useGetClientLimits(): (
  operatorId: string,
  machineId: string,
  tokenOverride?: string
) => Promise<ClientLimits | undefined> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken()
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (operatorId: string, machineId: string, tokenOverride?: string) => {
      try {
        const res = await getClientLimits(operatorId, machineId, tokenOverride ?? accessToken ?? '')
        dispatch(updateClientLimits({ clientLimits: res }))
        return res
      } catch (err) {
        handleUnathorizedError(err)
        return
      }
    },
    [accessToken, dispatch, handleUnathorizedError]
  )
}

export function useSelectedBTM(): MachineInformation | undefined {
  const selectedBTM = useSelector<AppState, AppState['user']['selectedBTM']>(state => state.user.selectedBTM)
  return selectedBTM
}

export function useMachineInformation(): MachineInformation | undefined {
  const machineInformation = useSelector<AppState, AppState['user']['machineInformation']>(
    state => state.user.machineInformation
  )
  return machineInformation
}

export function useGetClientLevelUpUrl(): () => Promise<string | undefined> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken()
  const handleUnathorizedError = useHandleUnauthorizedError()
  const selectedBTM = useSelectedBTM()
  return useCallback(async () => {
    try {
      const res = await getClientLevelUpUrl(selectedBTM?.machine_id ?? '', accessToken ?? '')
      dispatch(updateLevelUpUrl({ levelUpUrl: res }))
      return res
    } catch (err) {
      handleUnathorizedError(err)
      return
    }
  }, [accessToken, dispatch, handleUnathorizedError, selectedBTM?.machine_id])
}

export function useLevelUpUrl(): string | undefined {
  const levelUpUrl = useSelector<AppState, AppState['user']['levelUpUrl']>(state => state.user.levelUpUrl)
  return levelUpUrl
}

export function useClientLimits(): ClientLimits | undefined {
  const clientLimits = useSelector<AppState, AppState['user']['clientLimits']>(state => state.user.clientLimits)
  return clientLimits
}

export function useGetBTMLocationByMachineId(): (machineId: string) => Promise<MachineInformation | undefined> {
  const dispatch = useDispatch()
  const accessToken = useAccessToken()
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (machineId: string) => {
      try {
        const res = await getBTMLocationByMachineId(machineId, accessToken ?? '')
        dispatch(updateMachineInformation({ machineInformation: res }))
        return res
      } catch (err) {
        handleUnathorizedError(err)
        return
      }
    },
    [accessToken, dispatch, handleUnathorizedError]
  )
}

export function useResetBTMMachineInformation(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => {
    dispatch(updateMachineInformation({ machineInformation: undefined }))
  }, [dispatch])
}

export function useDoesBTMLocationSupportSelling(): (machineId: string) => Promise<boolean> {
  const getBTMLocationByMachineId = useGetBTMLocationByMachineId()
  return useCallback(
    async (machineId: string) => {
      const location = await getBTMLocationByMachineId(machineId)
      return location?.machine_status.is_sell_available || false
    },
    [getBTMLocationByMachineId]
  )
}

export function useSearchBTMLocations(): (query: object) => Promise<MachineInformation[] | undefined> {
  const handleUnathorizedError = useHandleUnauthorizedError()
  return useCallback(
    async (query: object) => {
      try {
        const locations = await searchLocations(query)
        return locations
      } catch (err) {
        handleUnathorizedError(err)
        return []
      }
    },
    [handleUnathorizedError]
  )
}

export function useClientIsAuthenticated(): () => Promise<boolean> {
  const accessToken = useAccessToken() || ''
  return useCallback(async () => {
    try {
      await getClient(accessToken)
      return true
    } catch (err) {
      return false
    }
  }, [accessToken])
}

export function useRequestPhoneVerification(): (phoneNumber: string) => Promise<void> {
  const dispatch = useDispatch()
  const history = useHistory()
  const handleUnathorizedError = useHandleUnauthorizedError()
  const toast = useToast()
  const selectedBTM = useSelectedBTM()
  return useCallback(
    async (phoneNumber: string) => {
      try {
        const res = await sendVerificationCode(phoneNumber, selectedBTM?.operator_id ?? '')
        dispatch(updatePhoneVerification({ phoneNumber: res.code_sent_to, key: res.key }))
        history.push('/user/sign-in/verify')
        toast('success', 'Successfully sent verification code.')
      } catch (err) {
        handleUnathorizedError(err)
        toast('error', 'Unable to send verification code. Please try again.')
      }
    },
    [dispatch, handleUnathorizedError, history, selectedBTM?.operator_id, toast]
  )
}

export function useResendPhoneVerification(): () => Promise<void> {
  const previousPhoneNumber = useSelector<AppState, AppState['user']['phoneNumber']>(state => state.user.phoneNumber)
  const requestPhoneVerification = useRequestPhoneVerification()
  if (!previousPhoneNumber) {
    // error
  }
  return () => requestPhoneVerification(previousPhoneNumber)
}

export function useHandleRouteLimitsOrBorrow(): (
  operatorId: string,
  machineId: string,
  tokenOverride?: string
) => Promise<void> {
  const getClientLimits = useGetClientLimits()
  const history = useHistory()
  return useCallback(
    async (operatorId: string, machineId: string, tokenOverride?: string) => {
      const clientLimits = await getClientLimits(operatorId, machineId, tokenOverride)
      if (clientLimits?.level_up && clientLimits?.level_up.length > 0) {
        history.push('/user/limits')
      } else {
        history.push('/user/borrow')
      }
    },
    [getClientLimits, history]
  )
}

export function useVerifyPhoneNumber(): (verificationCode: string) => void {
  const dispatch = useDispatch()
  const toast = useToast()
  const phoneNumber = useSelector<AppState, AppState['user']['phoneNumber']>(state => state.user.phoneNumber)
  const key = useSelector<AppState, AppState['user']['key']>(state => state.user.key)
  const selectedBTM = useSelectedBTM()
  const handleRouteLimitsOrBorrow = useHandleRouteLimitsOrBorrow()
  return useCallback(
    async (verificationCode: string) => {
      const operatorId = selectedBTM?.operator_id ?? ''
      const machineId = selectedBTM?.machine_id ?? ''
      try {
        const res = await verifyPhoneNumber(phoneNumber, key, verificationCode, selectedBTM?.operator_id ?? '')
        dispatch(updateUserAfterVerification({ clientId: res.client_id, token: res.token }))
        await handleRouteLimitsOrBorrow(operatorId, machineId, res.token)
        toast('success', 'Successfully verified your phone number.')
      } catch (err) {
        toast('error', JSON.stringify(err.error.message) || 'Unable to verify code. Please try again.')
      }
    },
    [selectedBTM?.operator_id, selectedBTM?.machine_id, phoneNumber, key, dispatch, handleRouteLimitsOrBorrow, toast]
  )
}

export function useChangeOperator(): (operatorId: string, machineId: string) => void {
  const toast = useToast()
  const dispatch = useDispatch()
  const accessToken = useAccessToken() || ''
  const handleRouteLimitsOrBorrow = useHandleRouteLimitsOrBorrow()
  return useCallback(
    async (operatorId: string, machineId: string) => {
      const res = await changeOperator(operatorId, accessToken)
      dispatch(updateUserAfterVerification({ clientId: res.client_id, token: res.token }))
      await handleRouteLimitsOrBorrow(operatorId, machineId, res.token)
      toast('success', 'BTM location successfully selected.')
    },
    [accessToken, dispatch, handleRouteLimitsOrBorrow, toast]
  )
}

export function useSelectBTM(): (btm: MachineInformation | undefined) => void {
  const dispatch = useDispatch()
  const history = useHistory()
  const toast = useToast()
  const clientIsAuthenticated = useClientIsAuthenticated()
  const changeOperator = useChangeOperator()
  return useCallback(
    async (btm: MachineInformation | undefined) => {
      dispatch(updateSelectedBTM({ selectedBTM: btm }))
      const isClientAuthenticated = await clientIsAuthenticated()
      if (isClientAuthenticated) {
        await changeOperator(btm?.operator_id ?? '', btm?.machine_id ?? '')
      } else {
        toast('success', 'BTM location successfully selected.')
        history.push('/user/sign-in')
      }
    },
    [changeOperator, clientIsAuthenticated, dispatch, history, toast]
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>(state => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}
