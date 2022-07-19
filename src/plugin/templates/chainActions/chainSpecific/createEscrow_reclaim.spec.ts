import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_reclaim'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('reclaim'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    reclaimer: toEosEntityName('accountname'),
    dapp: 'app',
    sym: 'EOS,4',
  },
})

const getDefaultArgs = () => ({
  accountName: 'accountname',
  appName: 'app',
  contractName: 'createescrow',
  permission: 'active',
  symbol: 'EOS,4',
})

test('Compose CreateEscrowReclaim object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes CreateEscrowReclaim object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowReclaim',
    args: {
      accountName: 'accountname',
      appName: 'app',
      contractName: 'createescrow',
      permission: 'active',
      symbol: 'EOS,4',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose CreateEscrowReclaim', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
