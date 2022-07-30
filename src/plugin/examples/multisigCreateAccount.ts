/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ChainType, PluginChainFactory } from '@open-rights-exchange/chain-js'
import { EosNewAccountType, EosMultisigCreateAccountOptions } from '../models'
import { toEosAsset, toEosEntityName, toEosPublicKey } from '../helpers'
import ChainEosV2 from '../ChainEosV2'

require('dotenv').config()

export const { env } = process

// Reusable Settings
export const jungle3Endpoints = [
  {
    url: 'https://jungle3.cryptolions.io',
  },
  {
    url: 'https://jungle.eosphere.io',
  },
  {
    url: 'https://api-jungle.eosarabia.net',
  },
]

export const chainSettings = {
  unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
}

export const multisigOptionsExample: EosMultisigCreateAccountOptions = {
  active: {
    threshold: 2,
    // Uses accountName/permission
    accounts: [
      {
        accountName: toEosEntityName('oremsigtest1'),
        permission: toEosEntityName('active'),
        weight: 1,
      },
      {
        accountName: toEosEntityName('oremsigtest2'),
        permission: toEosEntityName('active'),
        weight: 1,
      },
    ],
  },
  // Uses publicKeys
  owner: {
    threshold: 2,
    keys: [
      {
        key: toEosPublicKey('EOS5roBDJTcKAXSfx8YvqZ2CusFjpWgktmih2GnWovyLZAk6nJeNr'),
        weight: 1,
      },
      {
        key: toEosPublicKey('EOS6XaHANnEXPAVsjqHx1pREHXZ4ygQWYLhnQxMcKEmGft8UpNGHw'),
        weight: 1,
      },
    ],
  },
}

export const createAccountOptions_EosNative = {
  accountNamePrefix: 'ore',
  // accountName: 'oremsigtest4',
  creatorAccountName: 'oreidfunding',
  creatorPermission: 'active',
  newKeysOptions: {
    password: '2233',
    salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
  },
  resourcesOptions: {
    ramBytes: 4000,
    stakeNetQuantity: toEosAsset('1.0000', 'EOS'),
    stakeCpuQuantity: toEosAsset('10.0000', 'EOS'),
    transfer: false,
  },
  multisigOptions: multisigOptionsExample,
}

export const permissionNewKeysOptions = {
  password: '2233',
  salt: env.EOS_KYLIN_PK_SALT_V0, // kylin
}

async function run() {
  const jungle = PluginChainFactory([ChainEosV2], ChainType.EosV2, jungle3Endpoints, chainSettings)
  await jungle.connect()
  // -----> CreateAccount - create native kylin account
  const createAccount = await jungle.new.CreateAccount(createAccountOptions_EosNative)
  createAccount.generateKeysIfNeeded()
  if (createAccount.supportsTransactionToCreateAccount) {
    await createAccount.composeTransaction(EosNewAccountType.Native)
    await createAccount.transaction.sign([env.EOS_JUNGLE_OREIDFUNDING_PRIVATE_KEY])
    const txResponse = await createAccount.transaction.send()
    console.log('createAccount response: ', JSON.stringify(txResponse))
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
