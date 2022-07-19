import { toEosEntityName } from '../../../helpers'
import { composeAction, decomposeAction } from './createEscrow_create'

const getComposedAction = () => ({
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('create'),
  authorization: [
    {
      actor: toEosEntityName('creator'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    memo: toEosEntityName('creator'),
    account: toEosEntityName('accountname'),
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    origin: 'app',
    referral: 'referral',
  },
})

const getDefaultArgs = () => ({
  accountName: 'accountname',
  contractName: 'createescrow',
  appName: 'app',
  creatorAccountName: 'creator',
  creatorPermission: 'active',
  publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  pricekey: '1',
  referralAccountName: 'referral',
})

test('Compose CreateEscrowCreate object', () => {
  const args: any = getDefaultArgs()
  const actAction = composeAction(args)
  expect(actAction).toEqual(getComposedAction())
})

test('Decomposes CreateEscrowCreate object', () => {
  const expAction = {
    chainActionType: 'CreateEscrowCreate',
    args: {
      accountName: 'accountname',
      contractName: 'createescrow',
      appName: 'app',
      creatorAccountName: 'creator',
      creatorPermission: 'active',
      publicKeyActive: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      publicKeyOwner: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
      // pricekey: '1',
      pricekey: null as number,
      referralAccountName: 'referral',
    },
    partial: false,
  }
  const actAction = decomposeAction(getComposedAction())
  expect(actAction).toEqual(expAction)
})

test('Compose and Decompose CreateEscrowCreate', () => {
  const action = composeAction(getDefaultArgs() as any)
  const decomposed = decomposeAction(action)
  const decomposedArgs = {
    ...getDefaultArgs(),
    pricekey: '1', // null is passed-in but will get set to default of 1
  }
  expect(decomposedArgs).toEqual(getDefaultArgs())
})
