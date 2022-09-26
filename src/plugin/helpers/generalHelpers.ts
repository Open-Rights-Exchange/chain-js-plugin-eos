// import { isNullOrEmpty } from '../../../helpers'
import { Errors, Helpers } from '@open-rights-exchange/chain-js'

import { EosActionAuthorizationStruct, EosAuthorizationStruct, EosPublicKey, MsigAuthOptions } from '../models'
import { isValidEosPublicKey } from './cryptoModelHelpers'

const EOS_BASE = 31 // Base 31 allows us to leave out '.', as it's used for account scope

/** Returns a UNIX timestamp, that is EOS base32 encoded  */

/**  Returns valid EOS base32, which is different than the standard JS base32 implementation */
export function eosBase32(base32String: string): string {
  return base32String.replace(/0/g, 'v').replace(/6/g, 'w').replace(/7/g, 'x').replace(/8/g, 'y').replace(/9/g, 'z')
}

export function timestampEosBase32(): string {
  return eosBase32(Date.now().toString(EOS_BASE))
}

/** Returns a random string, that is EOS base32 encoded  */

export function randomEosBase32(): string {
  return eosBase32(Math.random().toString(EOS_BASE).substr(2))
}

/**
 * Returns an EosActionAuthorizationStruct if there is only 1 in the array, otherwise returns null
 */
export function getFirstAuthorizationIfOnlyOneExists(
  authorization: EosActionAuthorizationStruct[],
): EosActionAuthorizationStruct {
  const lengthRequirement = 1
  if (!Helpers.isNullOrEmpty(authorization) && authorization.length === lengthRequirement) {
    const [firstAuthorization] = authorization

    return firstAuthorization
  }

  return null
}

export function publicKeyToAuth(publicKey: EosPublicKey): EosAuthorizationStruct {
  if (!isValidEosPublicKey(publicKey)) {
    Errors.throwNewError('Invalid Option - Provided active publicKey isnt valid')
  }
  return {
    threshold: 1,
    keys: [
      {
        key: publicKey,
        weight: 1,
      },
    ],
    accounts: Array<any>(),
    waits: Array<any>(),
  }
}

export function msigOptionToAuth(msigOption: MsigAuthOptions): EosAuthorizationStruct {
  const { threshold, accounts, keys } = msigOption
  return {
    threshold,
    keys: keys || [],
    accounts:
      accounts?.map(account => {
        return {
          permission: {
            actor: account.accountName,
            permission: account.permission,
          },
          weight: account.weight,
        }
      }) || [],
    waits: Array<any>(),
  }
}

export function isArrayAndNotEmpty(value: any): boolean {
  return Array.isArray(value) && value.length > 0
}
