import { EosEntityName, EosAsset, EosNewKeysOptions, EosMultisigCreateAccountOptions } from './generalModels'
import { EosPublicKey } from './cryptoModels'
import { EosAuthorizationStruct } from './eosStructures'

/** Type of account to create */
export enum EosNewAccountType {
  /** Native account for chain tyep (EOS, Ethereum, etc.) */
  Native = 'Native',
  /** Native account on ORE chain */
  NativeOre = 'NativeOre',
  /** Native account created by calling a proxy (escrow) contract that actually creates the account */
  CreateEscrow = 'CreateEscrow',
  /** Virtual account - if supported by chain */
  VirtualNested = 'VirtualNested',
}

export type EosPublicKeys = {
  owner?: EosPublicKey
  active?: EosPublicKey
}

export type EosCreateAccountAuthorizations = {
  owner?: EosAuthorizationStruct
  active?: EosAuthorizationStruct
}

export type EosAccountResources = {
  cpuMicrosecondsAvailable: number
  netBytesAvailable: number
  ramBytesAvailable: number
}

export type EosCreateAccountOptions = {
  accountName?: EosEntityName // Optional - aka oreAccountName
  accountNamePrefix?: string // Default 'ore'
  creatorAccountName: EosEntityName
  creatorPermission: EosEntityName // Default = 'active'
  /**  Both publicKeys and authorizations can not exist. Owner and Active authorizations has to be provided for creating new account,
   * publicKeys can be provided for simplicity, when there is no need to specify threshold, weight and actors for authorization.
   * to generate new keys (using newKeysOptions), leave authorizations and both publicKeys as null */
  publicKeys?: EosPublicKeys
  /** Can not be provided together publicKeys. */
  multisigOptions?: EosMultisigCreateAccountOptions
  newKeysOptions?: EosNewKeysOptions
  oreOptions?: {
    tier?: number // default = 1
    referralAccountName?: EosEntityName // default = ''  // aka referral
  }
  createEscrowOptions?: {
    contractName: EosEntityName // default = 'createescrow'
    appName: string // aka 'origin' field
  }
  createVirtualNestedOptions?: {
    parentAccountName: EosEntityName
    rootPermission?: EosEntityName
    actionsToLink?: {
      contract: EosEntityName
      action: string
    }[]
  }
  resourcesOptions?: {
    ramBytes: number
    stakeNetQuantity: EosAsset
    stakeCpuQuantity: EosAsset
    transfer: boolean
  }
}
