import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_updateAuth'

const getComposedAction = () => ({
  account: toEosEntityName('eosio'),
  name: toEosEntityName('updateauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    permission: toEosEntityName('permission'),
    parent: toEosEntityName('parent'),
    auth: {
      threshold: 1,
      accounts: [
        {
          permission: {
            actor: toEosEntityName('accountname'),
            permission: toEosEntityName('owner'),
          },
          weight: 1,
        },
      ],
      keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
      waits: [
        {
          wait_sec: 1,
          weight: 1,
        },
      ],
    },
  },
})

const getDefaultArgs = () => ({
  auth: {
    threshold: 1,
    accounts: [
      {
        permission: {
          actor: 'accountname',
          permission: 'owner',
        },
        weight: 1,
      },
    ],
    keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
    waits: [
      {
        wait_sec: 1,
        weight: 1,
      },
    ],
  },
  authAccount: 'accountname',
  authPermission: 'active',
  parent: 'parent',
  permission: 'permission',
})

test('Compose AccountUpdateAuth object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes AccountUpdateAuth object', () => {
  const expAction = {
    chainActionType: 'AccountUpdateAuth',
    args: {
      auth: {
        threshold: 1,
        accounts: [
          {
            permission: {
              actor: 'accountname',
              permission: 'owner',
            },
            weight: 1,
          },
        ],
        keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
        waits: [
          {
            wait_sec: 1,
            weight: 1,
          },
        ],
      },
      authAccount: 'accountname',
      authPermission: 'active',
      parent: 'parent',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose AccountUpdateAuth', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
