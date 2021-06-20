import { Contract } from '@ethersproject/contracts'
import { ChainId, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import ATOKEN_ABI from '../constants/abis/aToken.json'
import LENDING_POOL_ABI from '../constants/abis/lendingPool.json'
import WETH_GATEWAY_ABI from '../constants/abis/wethGateweay.json'
import PRICE_ORACLE_ABI from '../constants/abis/priceOracle.json'
import LENDING_POOL_ADDRESS_PROVIDER_ABI from '../constants/abis/lendingPoolAddressesProvider.json'
import PROTOCOL_DATA_PROVIDER_ABI from '../constants/abis/protocolDataProvider.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { useGetLendingPoolAddress, useGetPriceOracleAddress, useGetUSDCReserveAddress } from 'state/aave/hooks'
import { AAVE_CONTRACT_ADDRESSES } from '../constants'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function usePriceOracleContract(): Contract | null {
  const priceOracleAddress = useGetPriceOracleAddress()
  return useContract(priceOracleAddress, PRICE_ORACLE_ABI)
}

export function useWETHGatewayContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(AAVE_CONTRACT_ADDRESSES.WETH_GATEWAY[chainId ?? ''], WETH_GATEWAY_ABI)
}

export function useLendingPoolAddressProviderContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    AAVE_CONTRACT_ADDRESSES.LENDING_POOL_ADDRESS_PROVIDER[chainId ?? ''],
    LENDING_POOL_ADDRESS_PROVIDER_ABI
  )
}

export function useProtocolDataProviderContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(AAVE_CONTRACT_ADDRESSES.PROTOCOL_DATA_PROVIDER[chainId ?? ''], PROTOCOL_DATA_PROVIDER_ABI)
}

export function useLendingPoolContract(): Contract | null {
  const lendingPoolAddress = useGetLendingPoolAddress()
  return useContract(lendingPoolAddress, LENDING_POOL_ABI, true)
}

export function useATokenContract(address?: string): Contract | null {
  return useContract(address, ATOKEN_ABI)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useUSDCContract(): Contract | null {
  const usdcAddress = useGetUSDCReserveAddress()
  return useTokenContract(usdcAddress, true)
}
