import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_create'

const getComposedAction = () => [
  {
    account: 'eosio',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      active: {
        accounts: Array<any>(),
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        threshold: 1,
        waits: Array<any>(),
      },
      creator: 'creatoracc',
      name: 'accountname',
      owner: {
        accounts: Array<any>(),
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        threshold: 1,
        waits: Array<any>(),
      },
    },
    name: 'newaccount',
  },
  {
    account: 'eosio',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      bytes: 3072,
      payer: 'creatoracc',
      receiver: 'accountname',
    },
    name: 'buyrambytes',
  },
  {
    account: 'eosio',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      from: 'creatoracc',
      receiver: 'accountname',
      stake_cpu_quantity: '1.0000 EOS',
      stake_net_quantity: '1.0000 EOS',
      transfer: false,
    },
    name: 'delegatebw',
  },
]

const getDefaultArgs = () => ({
  accountName: 'accountname',
  creatorAccountName: 'creatoracc',
  creatorPermission: 'active',
  authOwner: {
    threshold: 1,
    keys: [
      {
        key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
        weight: 1,
      },
    ],
    accounts: Array<any>(),
    waits: Array<any>(),
  },
  authActive: {
    threshold: 1,
    keys: [
      {
        key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
        weight: 1,
      },
    ],
    accounts: Array<any>(),
    waits: Array<any>(),
  },
  ramBytes: 3072,
  stakeNetQuantity: '1.0000 EOS',
  stakeCpuQuantity: '1.0000 EOS',
  transfer: false,
})

test('Compose AccountCreate object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes AccountCreate object', () => {
  const expAction = {
    chainActionType: 'AccountCreate',
    args: {
      accountName: 'accountname',
      creatorAccountName: 'creatoracc',
      creatorPermission: 'active',
      authOwner: {
        threshold: 1,
        keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
      authActive: {
        threshold: 1,
        keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
    },
    partial: false,
  }

  const actAction = decomposeAction({
    account: toEosEntityName('eosio'),
    name: toEosEntityName('newaccount'),
    authorization: [
      {
        actor: toEosEntityName('creatoracc'),
        permission: toEosEntityName('active'),
      },
    ],
    data: {
      creator: toEosEntityName('creatoracc'),
      name: toEosEntityName('accountname'),
      owner: {
        threshold: 1,
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
      active: {
        threshold: 1,
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
    },
  })
  console.log('actAction:', JSON.stringify(actAction))
  expect(actAction).toEqual(expAction)
})
