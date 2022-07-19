import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_approve'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('approve'),
  authorization: [
    {
      actor: toEosEntityName('fromaccount'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '5.0000 EOS',
    memo: 'memo',
  },
})

const getDefaultArgs = () => ({
  contractName: 'eosio.token',
  memo: 'memo',
  fromAccountName: 'fromaccount',
  toAccountName: 'toaccount',
  amount: '5.0000',
  symbol: 'EOS',
  permission: 'active',
})

test('Compose EosTokenApprove object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenApprove object', () => {
  const expAction = {
    chainActionType: 'EosTokenApprove',
    args: {
      contractName: 'eosio.token',
      memo: 'memo',
      fromAccountName: 'fromaccount',
      toAccountName: 'toaccount',
      amount: '5.0000',
      symbol: 'EOS',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose EosTokenApprove', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
