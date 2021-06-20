import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { addPopup, ApplicationModal, PopupContent, removePopup, setOpenModal } from './actions'
import { useClientIsAuthenticated, useMachineInformation } from 'state/user/hooks'
import useToast from '../../services/toast'
import { Keyable } from 'components/AaveAccountCard'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useRedirectToHomeIfNotConnected(): void {
  const { account } = useActiveWeb3React()
  const history = useHistory()
  useEffect(() => {
    if (!account) {
      return history.push('/')
    }
  }, [account, history])
}

export function useHandleUnauthorizedError(): (error: Keyable) => void {
  const history = useHistory()
  const toast = useToast()
  const machineInformation = useMachineInformation()
  return useCallback(
    (error: Keyable) => {
      if (error.statusCode === 401) {
        toast('error', 'You have been signed out. Please reauthenticate.')
        if (machineInformation?.machine_id) {
          history.push('/user/sign-in')
        } else {
          history.push('/user/locations')
        }
      }
    },
    [history, toast, machineInformation]
  )
}

export function useRedirectToSignInIfNotAuthenticated(): () => Promise<void> {
  const checkIfClientIsAuthenticated = useClientIsAuthenticated()
  const handleUnauthorizedError = useHandleUnauthorizedError()
  return useCallback(async () => {
    const isSignedIn = await checkIfClientIsAuthenticated()
    if (!isSignedIn) {
      handleUnauthorizedError({ statusCode: 401 })
    }
  }, [checkIfClientIsAuthenticated, handleUnauthorizedError])
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter(item => item.show), [list])
}
