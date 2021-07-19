import { Keyable } from 'components/AaveAccountCard'

export interface MachineInformation {
  machine_id: string
  alt_id: string
  operator_id: string
  operator_name: string
  name: string
  address_1: string
  address_2: string
  city: string
  state: string
  postal_code: string
  country: string
  country_code: string
  formatted_address: string
  coordinates: Coordinates
  timezone: string
  hours_of_operation: HoursOfOperation
  customer_support_email: string
  customer_support_phone: string
  customer_support_website: string
  address_tags: string
  supported_languages: string
  supported_cryptocurrencies: string
  primary_currency: string
  prices_buy: Keyable
  prices_buy_affiliate: Keyable
  prices_sell: Keyable
  prices_sell_affiliate: Keyable
  fees_buy: Keyable
  fees_buy_affiliate: Keyable
  fees_sell: Keyable
  fees_sell_affiliate: Keyable
  machine_actions: MachineActions
  last_reported_at: string
  last_updated_at: string
  machine_status: MachineStatus
  is_accepting_promo_codes: boolean
  is_test_machine: boolean
}
export interface Coordinates {
  latitude: number
  longitude: number
}
export interface HoursOfOperation {
  Sunday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Monday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Tuesday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Wednesday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Thursday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Friday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
  Saturday: SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday
}
export interface SundayOrMondayOrTuesdayOrWednesdayOrThursdayOrFridayOrSaturday {
  open: string
  close: string
}
export interface MachineActions {
  buy: boolean
  sell: boolean
  verify: boolean
}
export interface MachineStatus {
  is_scheduled_open: boolean
  is_temporarily_closed: boolean
  is_online: boolean
  is_buy_available: boolean
  is_sell_available: boolean
  is_verify_available: boolean
}
