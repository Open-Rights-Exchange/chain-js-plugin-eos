import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_issue'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('issue'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    to: toEosEntityName('eosio.token'),
    quantity: '1000.0000 EOS',
    memo: 'memoo',
  },
})

const getDefaultArgs = () => ({
  contractName: 'eosio.token',
  ownerAccountName: 'eosio',
  toAccountName: 'eosio.token',
  amount: '1000.0000',
  symbol: 'EOS',
  memo: 'memoo',
  permission: 'active',
})

test('Compose EosTokenIssue object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenIssue object', () => {
  const expAction = {
    chainActionType: 'EosTokenIssue',
    args: {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '1000.0000',
      symbol: 'EOS',
      memo: 'memoo',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose EosTokenIssue', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
