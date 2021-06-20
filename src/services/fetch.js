import request from 'request-promise-native'
import crypto from 'crypto'
import publicIp from 'public-ip'
import { CASH_API_KEY, CASH_API_SECRET } from '../constants/index'

const createHmacSignature = (secretKey, requestMethod, bodyString, contentType, dateString) => {
  const bodyHash = bodyString
    ? crypto
        .createHash('md5')
        .update(bodyString, 'utf8')
        .digest('hex')
    : ''
  const sigString = `${requestMethod}\n${bodyHash}\n${contentType}\n${dateString}`
  return crypto
    .createHmac('sha256', secretKey)
    .update(sigString, 'utf8')
    .digest('base64')
}

export const authedRequest = async (url, options = {}) => {
  const requestMethod = (options.method || 'GET').toUpperCase()
  const bodyString = options.body ? JSON.stringify(options.body) : ''
  const contentType = 'application/json'
  const dateString = new Date().toISOString()
  const signature = createHmacSignature(CASH_API_SECRET, requestMethod, bodyString, contentType, dateString)
  const ipAddress = await publicIp.v4()
  return request(url, {
    timeout: 30 * 1000,
    ...options,
    method: requestMethod,
    json: true,
    headers: {
      ...options.headers,
      Authorization: `HMAC ${CASH_API_KEY}:${signature}`,
      'x-date': dateString,
      'content-type': contentType,
      'client-ip-address': ipAddress
    }
  })
}

export const fetch = (url, options = {}) => {
  const requestMethod = (options.method || 'GET').toUpperCase()
  return request(url, {
    ...options,
    method: requestMethod,
    json: true,
    headers: {
      ...options.headers
    }
  })
}
