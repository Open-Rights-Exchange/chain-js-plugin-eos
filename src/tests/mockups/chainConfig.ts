import { Models } from '@open-rights-exchange/chain-js'
import keys from './keys'

export enum ChainNetwork {
  EosKylin = 'eos_kylin',
  EosJungle = 'eos_jungle',
}

export interface IChainSettings {
  chainType: Models.ChainType
  endpoints: [Models.ChainEndpoint]
  chainSettings: any
  account_MSIG: string
  account1: string
  account2: string
  symbol: string
  permission1: any
  permission2: any
  privateKey_singleSign: string
  privateKeys_MSIG: string[]
  transferAmount: string
  precision: number
}

export type IAllChainSettings = {
  [chainNetwork in ChainNetwork]: IChainSettings
}

export const chainConfig: IAllChainSettings = {
  eos_jungle: {
    chainType: Models.ChainType.EosV2,
    endpoints: [{ url: 'https://jungle3.cryptolions.io:443' }],
    account_MSIG: keys.eos_jungle_fromAccountName_MSIG,
    account1: keys.eos_jungle_fromAccountName,
    account2: keys.eos_jungle_toAccountName,
    chainSettings: {},
    symbol: 'EOS',
    permission1: 'app1qyajfzqr' as any,
    permission2: 'app1qyajfzqr' as any,
    privateKey_singleSign: keys.eos_jungle_privateKey,
    privateKeys_MSIG: [keys.eos_jungle_msig_1_privateKey, keys.eos_jungle_msig_2_privateKey],
    transferAmount: '0.0001',
    precision: 4,
  },
  eos_kylin: {
    chainType: Models.ChainType.EosV2,
    endpoints: [{ url: 'https://kylin.eosn.io:443' }],
    account_MSIG: keys.eos_kylin_fromAccountName_MSIG,
    account1: keys.eos_kylin_fromAccountName,
    account2: keys.eos_kylin_toAccountName,
    chainSettings: {},
    symbol: 'EOS',
    permission1: 'app1qyajfzqr' as any,
    permission2: 'app1qyajfzqr' as any,
    privateKey_singleSign: keys.eos_kylin_privateKey,
    privateKeys_MSIG: [keys.eos_kylin_msig_1_privateKey, keys.eos_kylin_msig_2_privateKey],
    transferAmount: '0.0001',
    precision: 4,
  },
}
