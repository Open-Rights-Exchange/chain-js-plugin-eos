// import { ModelsCryptoAes, PublicKeyBrand, PrivateKeyBrand, SignatureBrand } from '../../../models'
import { Models } from '@open-rights-exchange/chainjs'

/** a public key string - formatted correctly for EOS */
export type EosPublicKey = string & Models.PublicKeyBrand
/** a private key string - formatted correctly for EOS */
export type EosPrivateKey = string & Models.PrivateKeyBrand
/** a signature string - formatted correcly for EOS */
export type EosSignature = string & Models.SignatureBrand

/** key pair - in the format returned from algosdk */
export type EosKeyPair = {
  publicKey: EosPublicKey
  privateKey: EosPrivateKey
  privateKeyEncrypted?: Models.ModelsCryptoAes.AesEncryptedDataString
}

/** An object containing public and private keys for owner and active permissions */
export type EosAccountKeys = {
  publicKeys: {
    owner: EosPublicKey
    active: EosPublicKey
  }
  privateKeys: {
    owner: EosPrivateKey
    active: EosPrivateKey
  }
  privateKeysEncrypted?: {
    owner: Models.ModelsCryptoAes.AesEncryptedDataString
    active: Models.ModelsCryptoAes.AesEncryptedDataString
  }
}
