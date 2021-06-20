export interface LocationPayload {
  isNearby: boolean
  locations: BTMLocation[]
  country: string
  state: string
  city: string
}

export interface BTMLocation {
  active: boolean
  address: string
  city: string
  country: string
  customId: string
  formattedAddress: string
  latitude: string
  locationName: string
  longitude: string
  machineName: string
  openingSchedules: object[]
  placeId: string
  state: string
  subtype: string
  type: string
}

export interface GoogleLocation {
  location: { lat: number; lng: number }
  gmaps?: object
}
