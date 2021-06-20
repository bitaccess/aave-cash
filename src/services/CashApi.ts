/* eslint-disable @typescript-eslint/camelcase */
import { authedRequest } from './fetch'
import { ClientLimits, MachineInformation } from 'state/user/actions'
import { BTMLocation } from 'pages/LocationPicker/types'
import { CASH_API_URL } from '../constants'

export interface SellParams {
  machine_id: string
  deposit_currency: string
  withdrawal_amount: number
  withdrawal_currency: string
  refund_address: string
}

export interface SellTransaction {
  transaction_id: string
  machine_id: string
  client_id: string
  phone_number: string
  created_at: string
  order_code: string
  trade_type: string
  deposit_address: string
  deposit_amount: number
  deposit_currency: string
  withdrawal_amount: number
  withdrawal_currency: string
  refund_address: string
  price: number
  status: string
  available_actions: string[]
  action_details: {
    deposit: {
      expires_at: string
    }
  }
}

export const sendVerificationCode = async (
  phoneNumber: string,
  operatorId: string
): Promise<{
  code_sent_to: string
  key: string
}> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client/verification-code`, {
    method: 'POST',
    body: {
      phone_number: phoneNumber,
      operator_id: operatorId
    }
  })
  return result
}

export const verifyPhoneNumber = async (
  phoneNumber: string,
  key: string,
  verificationCode: string,
  operatorId: string
): Promise<{
  phone_number: string
  client_id: string
  token: string
}> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client/token`, {
    method: 'POST',
    body: {
      phone_number: phoneNumber,
      key,
      verification_code: verificationCode,
      operator_id: operatorId
    }
  })
  return result
}

export const changeOperator = async (
  operatorId: string,
  accessToken: string
): Promise<{
  phone_number: string
  client_id: string
  token: string
}> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client/token`, {
    method: 'PATCH',
    body: {
      operator_id: operatorId
    },
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const searchLocations = async (query: object): Promise<BTMLocation[]> => {
  const { result } = await authedRequest(`${CASH_API_URL}/location`, {
    method: 'GET',
    qs: {
      ...query
    }
  })
  return result
}

export const createSellTransaction = async (sell: SellParams, accessToken: string): Promise<SellTransaction> => {
  const { result } = await authedRequest(`${CASH_API_URL}/transaction/sell`, {
    method: 'POST',
    body: {
      ...sell
    },
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const getTransactionById = async (txid: string, accessToken: string): Promise<SellTransaction> => {
  const { result } = await authedRequest(`${CASH_API_URL}/transaction/${txid}`, {
    method: 'GET',
    headers: {
      'client-access-token': accessToken
    }
  })
  if (Array.isArray(result)) {
    const nonCancelledTx = result.filter(tx => tx.status !== 'cancelled')[0]
    return nonCancelledTx
  }
  return result
}

export const cancelTransactionById = async (txid: string, accessToken: string): Promise<void> => {
  const { result } = await authedRequest(`${CASH_API_URL}/transaction/${txid}/actions/cancel`, {
    method: 'PUT',
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const getBTMLocationByMachineId = async (
  machineId: string,
  accessToken: string
): Promise<MachineInformation> => {
  const { result } = await authedRequest(`${CASH_API_URL}/location/${machineId}`, {
    method: 'GET',
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const getClient = async (accessToken: string): Promise<object> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client`, {
    method: 'GET',
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const getClientLimits = async (
  operatorId: string,
  machineId: string,
  accessToken: string
): Promise<ClientLimits> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client/limits?machine_id=${machineId}`, {
    method: 'GET',
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const getClientLevelUpUrl = async (accessToken: string): Promise<string> => {
  const { result } = await authedRequest(`${CASH_API_URL}/client/limits/level-up-url`, {
    method: 'GET',
    headers: {
      'client-access-token': accessToken
    }
  })
  return result
}

export const validateWithdrawalAmount = async (
  machineId: string,
  withdrawalAmount: string,
  accessToken: string
): Promise<object> => {
  const { result } = await authedRequest(
    `${CASH_API_URL}/location/${machineId}/sell/withdrawal-amount/${withdrawalAmount}`,
    {
      method: 'GET',
      headers: {
        'client-access-token': accessToken
      }
    }
  )
  return result
}
