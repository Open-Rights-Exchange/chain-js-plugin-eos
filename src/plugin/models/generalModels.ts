import { Models } from '@open-rights-exchange/chain-js'
import { EosPublicKey, EosAccountKeys, EosKeyPair } from './cryptoModels'
/*
import {
  ChainAssetBrand,
  ChainDateBrand,
  ChainEntityNameBrand,
  ChainSettingsCommunicationSettings,
  ChainSymbolBrand,
  ModelsCryptoAes,
} from '../../../models'
*/

// using Enum 'brands' to force a string type to have a particular format
// See - https://spin.atomicobject.com/2017/06/19/strongly-typed-date-string-typescript/
// ... and https://basarat.gitbooks.io/typescript/docs/tips/nominalTyping.html

// EOS Account name has no more than 13 characters
// Last character can't be '.'
// 13th character can only be [1-5] or [a-j]
export type EosEntityName = string & Models.ChainEntityNameBrand
export type EosDate = string & Models.ChainDateBrand // Datetime string in the format YYYY-MM-DDTHH:MM:SS.sss
export type EosAsset = string & Models.ChainAssetBrand
export type EosSymbol = string & Models.ChainSymbolBrand

/** A simple container for account, permission, and public key */
export type EosAuthorization = {
  account: EosEntityName
  permission: EosEntityName
  publicKey?: EosPublicKey
}

/** A container for account, permission name, and full permission stucture */
export type EosAuthorizationPerm = {
  account: EosEntityName
  permission: EosEntityName
  requiredAuthorization?: EosRequiredAuthorization
}

/** Chain configuation for creating a new connection */
export type EosChainSettings = {
  createEscrowContract?: string
  communicationSettings?: Models.ChainSettingsCommunicationSettings
  defaultTransactionSettings?: {
    blocksBehind: number
    expireSeconds: number
  }
  fetch?: any
  monitorType?: EosChainMonitorType
  monitorUrl?: URL
  unusedAccountPublicKey?: string
}

/** Chain urls and related details used to connect to chain */
export type EosChainEndpoint = {
  /** api endpoint url - including http(s):// prefix */
  url: string
  /** Options are name/value pairs used to configure chain endpoint */
  options?: {
    /** Array of headers to be included in HTTP requests to chain endpoint
     *  e.g. options.headers = [{"Authorization":"Bearer..."}] */
    headers?: [{ [key: string]: string }]
  }
  /** Between 0 and 1 - 0 is not responding, 1 is very fast */
  health?: number
}

/** Monitor services listenting to the chain */
export enum EosChainMonitorType {
  NONE,
  DFUSE,
  DEMUX,
}

export type EosPermissionSimplified = {
  name: EosEntityName
  parent: EosEntityName
  publicKey: EosPublicKey
  publicKeyWeight?: number
  threshold?: number
}

export type EosGeneratedKeys = {
  accountKeys: EosAccountKeys
  permissionKeys: EosGeneratedPermissionKeys[]
}

export type EosGeneratedPermissionKeys = {
  permissionName: EosEntityName
  keyPair: EosKeyPair
}

export type EosNewKeysOptions = {
  password: string
  encryptionOptions?: Models.ModelsCryptoAes.AesEncryptionOptions
}

export type EosPermission = {
  name: EosEntityName
  parent: EosEntityName | ''
  firstPublicKey: EosPublicKey
  firstPublicKeyMeetsThreshold: boolean
  requiredAuth: EosRequiredAuthorization
}

export type PermissionMapCache = {
  accountName: EosEntityName
  permissionName: EosEntityName
  authorization: EosRequiredAuthorization
}

/** EOS Data Structure for the Required Authorization for a permission - i.e. includes required accounts, permissions, and weights */
export type EosRequiredAuthorization = {
  threshold: number
  accounts: {
    permission: {
      actor: EosEntityName
      permission: EosEntityName
    }
    /** ChainJS spesific property, generated by fetchAuthorizationsRequired
     * to help missingSignatures to check if signatures satisfies authRequirement of
     * provided accountName/permissions.
     * NOTE: Nested accountName/permissions are not supported
     * (this means accountName/permissions can not contation accounts:[] in its subAuth)
     */
    subAuth?: EosRequiredAuthorization
    weight: number
  }[]
  keys: {
    key: EosPublicKey
    weight: number
  }[]
  waits: {
    waitSec: number
    weight: number
  }[]
}

/**  Multisig options required to create a multisignature account for EOS */
export type EosMultisigCreateAccountOptions = {
  owner: MsigAuthOptions | EosPublicKey
  active: MsigAuthOptions | EosPublicKey
}

export type MsigAuthOptions = {
  threshold: number
  accounts?: MsigChainAccount[]
  keys?: MsigPublicKeys[]
}

export type MsigChainAccount = {
  accountName: EosEntityName
  permission: EosEntityName
  weight: number
}

export type MsigPublicKeys = {
  key: EosPublicKey
  weight: number
}
