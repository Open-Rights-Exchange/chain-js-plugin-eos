import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_init'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('init'),
  authorization: [
    {
      actor: toEosEntityName('createescrow'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    symbol: 'EOS,4',
    newaccountcontract: toEosEntityName('eosio'),
    newaccountaction: toEosEntityName('newaccount'),
    minimumram: '0',
  },
})

const getDefaultArgs = () => ({
  contractName: 'createescrow',
  chainSymbol: 'EOS,4',
  newAccountContract: 'eosio',
  newAccountAction: 'newaccount',
  minimumRAM: '0',
  permission: 'active',
})

test('Compose CreateEscrowInit object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes CreateEscrowInit object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowInit',
    args: {
      contractName: 'createescrow',
      chainSymbol: 'EOS,4',
      newAccountContract: 'eosio',
      newAccountAction: 'newaccount',
      minimumRAM: '0',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose CreateEscrowInit', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
