// used to mark unsupported tokens, these are hosted lists of unsupported tokens
const AAVE_LIST = 'tokenlist.aave.eth'

export const UNSUPPORTED_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [AAVE_LIST]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [AAVE_LIST]
