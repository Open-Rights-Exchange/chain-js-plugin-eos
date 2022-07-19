import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_transfer'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('transfer'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('accountname'),
    to: toEosEntityName('escrowname'),
    quantity: '10.0000 EOS',
    memo: 'memo',
  },
})

const getDefaultArgs = () => ({
  accountName: 'accountname',
  amount: '10.0000 EOS',
  contractName: 'createescrow',
  createEscrowAccountName: 'escrowname',
  memo: 'memo',
  permission: 'active',
})

test('Compose CreateEscrowTransfer object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes CreateEscrowTransfer object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowTransfer',
    args: {
      accountName: 'accountname',
      amount: '10.0000 EOS',
      contractName: 'createescrow',
      createEscrowAccountName: 'escrowname',
      memo: 'memo',
      permission: 'active',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose CreateEscrowTransfer', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)

  expect(decomposed.args).toEqual(getDefaultArgs())
})
