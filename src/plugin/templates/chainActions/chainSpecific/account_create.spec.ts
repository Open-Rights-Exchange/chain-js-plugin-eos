import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_deleteAuth'

const getComposedAction = () => ({
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

const getDefaultArgs = () => ({
  accountName: 'accountname',
  creatorAccountName: 'creatoracc',
  creatorPermission: 'active',
  publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
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
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
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
  expect(actAction).toEqual(expAction)
})
