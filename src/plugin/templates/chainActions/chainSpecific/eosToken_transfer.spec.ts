import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_transfer'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('transfer'),
  authorization: [
    {
      actor: toEosEntityName('fromaccount'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
})

const getDefaultArgs = () => ({
  fromAccountName: 'fromaccount',
  toAccountName: 'toaccount',
  contractName: 'eosio.token',
  amount: '100.0000',
  symbol: 'EOS',
  memo: 'memo',
  permission: 'active',
})

test('Compose EosTokenTransfer object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenTransfer object', () => {
  const expAction = {
    chainActionType: 'EosTokenTransfer',
    args: {
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      contractName: 'eosio.token',
      amount: '100.0000',
      symbol: 'EOS',
      memo: 'memo',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose EosTokenTransfer', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
