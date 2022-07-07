import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_linkAuth'

const getComposedAction = () => ({
  account: toEosEntityName('eosio'),
  name: toEosEntityName('linkauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    code: toEosEntityName('contract'),
    type: toEosEntityName('linkauth'),
    requirement: toEosEntityName('permission'),
  },
})

const getDefaultArgs = () => ({
  action: 'linkauth',
  authAccount: 'accountname',
  authPermission: 'active',
  contract: 'contract',
  permission: 'permission',
})

test('Compose a action object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes action object', () => {
  const expAction = {
    chainActionType: 'AccountLinkAuth',
    args: {
      action: 'linkauth',
      authAccount: 'accountname',
      authPermission: 'active',
      contract: 'contract',
      permission: 'permission',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
