import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_transferFrom'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('transferFrom'),
  authorization: [
    {
      actor: toEosEntityName('approved'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    sender: toEosEntityName('approved'),
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
})

const getDefaultArgs = () => ({
  approvedAccountName: 'approved',
  contractName: 'eosio.token',
  fromAccountName: 'fromaccount',
  toAccountName: 'toaccount',
  amount: '100.0000',
  symbol: 'EOS',
  memo: 'memo',
  permission: 'active',
})

test('Compose EosTokenTransferFrom object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenTransferFrom object', () => {
  const expAction = {
    chainActionType: 'EosTokenTransferFrom',
    args: {
      approvedAccountName: 'approved',
      contractName: 'eosio.token',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
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

test('Compose and Decompose EosTokenTransferFrom', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
