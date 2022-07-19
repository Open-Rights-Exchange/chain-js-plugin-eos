import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './eosToken_create'

const getComposedAction = () => ({
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('create'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    issuer: toEosEntityName('eosio.token'),
    maximum_supply: '10000.0000 EOS',
  },
})

const getDefaultArgs = () => ({
  contractName: 'eosio.token',
  ownerAccountName: 'eosio',
  toAccountName: 'eosio.token',
  amount: '10000.0000',
  symbol: 'EOS',
  permission: 'active',
})

test('Compose EosTokenCreate object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes EosTokenCreate object', () => {
  const expAction = {
    chainActionType: 'EosTokenCreate',
    args: {
      contractName: 'eosio.token',
      ownerAccountName: 'eosio',
      toAccountName: 'eosio.token',
      amount: '10000.0000',
      symbol: 'EOS',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose EosTokenCreate', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
