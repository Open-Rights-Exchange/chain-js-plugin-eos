import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_retire'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('retire'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    quantity: '1000.0000 EOS',
    memo: 'memo',
  },
})

const getDefaultArgs = () => ({
  contractName: 'eosio.token',
  ownerAccountName: 'eosio',
  amount: '1000.0000',
  symbol: 'EOS',
  memo: 'memo',
  permission: 'active',
})

test('Compose EosTokenRetire object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenRetire object', () => {
  const expAction = {
    chainActionType: 'EosTokenRetire',
    args: {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose EosTokenRetire', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
