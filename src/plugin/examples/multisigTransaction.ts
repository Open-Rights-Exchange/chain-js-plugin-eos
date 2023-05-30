/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { ChainType, PluginChainFactory } from '@open-rights-exchange/chain-js'
import ChainEosV2 from '../ChainEosV2'

require('dotenv').config()

const { env } = process

const { MSIG_ACTIVE_KEY1_PRIVATE, MSIG_ACTIVE_KEY2_PRIVATE } = env

// Reusable Settings
const kylinEndpoints = [
  {
    url: 'https:kylin.eosn.io:443',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  },
  {
    url: 'https://kylin.eos.dfuse.io',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    options: {
      headers: [
        {
          Authorization: 'Bearer ey...',
        },
      ],
    },
  },
]

export const jungle3Endpoints = [
  {
    url: 'https://jungle4.api.eosnation.io',
  },
  {
    url: 'https://jungle.eosphere.io',
  },
  {
    url: 'https://api-jungle.eosarabia.net',
  },
]

const dummyTransferAction = (sender: string, permission: string) => {
  return [
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [
        {
          actor: sender,
          permission,
        },
      ],
      data: {
        from: sender,
        to: 'oreidfunding',
        quantity: '1.0000 EOS',
        memo: '',
      },
    },
  ]
}

async function run() {
  // Create an EOS chain and call a few functions
  const jungle = PluginChainFactory([ChainEosV2], ChainType.EosV2, jungle3Endpoints, {})

  await jungle.connect()

  const transaction = await jungle.new.Transaction()

  const multisigAction = dummyTransferAction('oremsigtest4', 'active')

  await transaction.setTransaction(multisigAction)
  await transaction.prepareToBeSigned()
  await transaction.validate()
  console.log('missing signatures:', transaction.missingSignatures)
  await transaction.sign([MSIG_ACTIVE_KEY1_PRIVATE, MSIG_ACTIVE_KEY2_PRIVATE])

  console.log('missing signatures:', transaction.missingSignatures)
  console.log('Transaction: ', JSON.stringify(transaction.actions))
  const txResponse = await transaction.send()
  console.log('send response:', JSON.stringify(txResponse))
}

;(async () => {
  try {
    await run()
  } catch (error) {
    console.log('Error:', error)
  }
  process.exit()
})()
