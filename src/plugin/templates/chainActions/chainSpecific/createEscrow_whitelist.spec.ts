import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_whitelist'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('whitelist'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    owner: toEosEntityName('accountname'),
    account: toEosEntityName('whitelisted'),
    dapp: 'app',
  },
})

const getDefaultArgs = () => ({
  accountName: 'accountname',
  appName: 'app',
  contractName: 'createescrow',
  permission: 'active',
  whitelistAccount: 'whitelisted',
})

test('Compose CreateEscrowWhitelist object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes CreateEscrowWhitelist object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowWhitelist',
    args: {
      accountName: 'accountname',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      whitelistAccount: 'whitelisted',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose CreateEscrowWhitelist', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
