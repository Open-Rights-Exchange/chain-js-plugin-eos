import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_unlinkAuth'

const getComposedAction = () => ({
  account: toEosEntityName('eosio'),
  name: toEosEntityName('unlinkauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    code: toEosEntityName('contract'),
    type: toEosEntityName('unlinkauth'),
  },
})

const getDefaultArgs = () => ({
  action: 'unlinkauth',
  authAccount: 'accountname',
  authPermission: 'active',
  contract: 'contract',
})

test('Compose a action object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes action object', () => {
  const expAction = {
    chainActionType: 'AccountUnlinkAuth',
    args: {
      action: 'unlinkauth',
      authAccount: 'accountname',
      authPermission: 'active',
      contract: 'contract',
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
