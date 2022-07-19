import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './account_deleteAuth'

const getComposedAction = () => ({
  account: toEosEntityName('eosio'),
  name: toEosEntityName('deleteauth'),
  authorization: [{ actor: toEosEntityName('authaccount'), permission: toEosEntityName('active') }],
  data: { account: toEosEntityName('accountname'), permission: toEosEntityName('permission') },
})

const getDefaultArgs = () => ({
  account: 'accountname',
  authAccount: 'authaccount',
  authPermission: 'active',
  permission: 'permission',
})

test('Compose AccountDeleteAuth object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes AccountDeleteAuth object', () => {
  const expAction = {
    chainActionType: 'AccountDeleteAuth',
    args: {
      account: 'accountname',
      authAccount: 'authaccount',
      authPermission: 'active',
      permission: 'permission',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose AccountDeleteAuth', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
